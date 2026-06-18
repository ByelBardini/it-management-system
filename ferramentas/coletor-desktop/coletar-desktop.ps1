<#
.SYNOPSIS
  Coletor de desktop do InfraHub — lê o hardware desta máquina Windows e cadastra
  o desktop (item + peças) no inventário numa única chamada ao endpoint
  POST /item/coletar-desktop.

.DESCRIPTION
  Coleta marca/modelo do desktop e as peças (processador, placa-mãe, memória,
  armazenamento, vídeo e rede) via CIM/WMI e envia tudo como JSON. Número de série
  e preço das peças são OPCIONAIS — o backend aplica os defaults ("N/A" e 0).

  Dois modos de autenticação:
   - AUTOATENDIMENTO (-Token): usado pelos PCs da empresa. O token (embutido no ZIP
     baixado) autentica por Bearer; a empresa vem do token e a etiqueta é montada a
     partir do nome e do setor perguntados em runtime. Não exige login/empresa.
   - MANUAL (-Login/-EmpresaId/-Etiqueta): para TI/dev. Faz login adm (cookie de
     sessão httpOnly capturado via -SessionVariable).

.PARAMETER ApiBase
  URL base da API, sem barra final. Ex.: http://localhost:3032 ou
  https://infrahub.suaempresa.com/api (atrás do nginx que faz proxy de /api).

.PARAMETER Token
  Token de coleta (modo autoatendimento). Enviado como Authorization: Bearer.
  Quando informado, dispensa -Login/-EmpresaId/-Etiqueta.

.PARAMETER Login
  Login de um usuário adm (modo manual).

.PARAMETER Senha
  Senha do usuário adm. Se omitida, é pedida de forma segura no console.

.PARAMETER EmpresaId
  Id da empresa dona do desktop (modo manual).

.PARAMETER Etiqueta
  Etiqueta do desktop (máximo 10 caracteres, modo manual).

.PARAMETER SetorId
  Id do setor (opcional).

.PARAMETER WorkstationId
  Id do workstation (opcional).

.PARAMETER Marca
  Sobrescreve a marca do desktop detectada no hardware (opcional).

.PARAMETER Modelo
  Sobrescreve o modelo do desktop detectado no hardware (opcional).

.PARAMETER EmUso
  Marca o item como em uso (default: $true). Use -EmUso:$false para desligar.

.PARAMETER DryRun
  Coleta e imprime o JSON que SERIA enviado, sem autenticar nem enviar nada.

.EXAMPLE
  .\coletar-desktop.ps1 -ApiBase http://localhost:3032 -Login admin -Senha admin123 -EmpresaId 1 -Etiqueta DSK-014

.EXAMPLE
  .\coletar-desktop.ps1 -ApiBase http://localhost:3032 -Login admin -EmpresaId 1 -Etiqueta DSK-014 -DryRun

.NOTES
  Requer Windows + PowerShell 5.1+ e permissão de leitura WMI (um usuário normal
  costuma bastar). Para rodar sem mexer na política da máquina:
    powershell -ExecutionPolicy Bypass -File .\coletar-desktop.ps1 ...
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $ApiBase,
  # Modo AUTOATENDIMENTO: token de coleta (Bearer). Quando informado, o script não faz
  # login nem exige empresa/etiqueta — a identidade/empresa vêm do token e a etiqueta é
  # montada a partir do nome e do setor perguntados em runtime.
  [string] $Token,
  # Modo MANUAL (TI/dev): login adm + empresa + etiqueta.
  [string] $Login,
  [string] $Senha,
  [int] $EmpresaId,
  [string] $Etiqueta,
  [int] $SetorId,
  [int] $WorkstationId,
  [string] $Marca,
  [string] $Modelo,
  [bool] $EmUso = $true,
  [switch] $DryRun
)

$ErrorActionPreference = 'Stop'

# Windows PowerShell 5.1 pode negociar TLS antigo; força TLS 1.2 para HTTPS moderno.
try {
  [Net.ServicePointManager]::SecurityProtocol =
    [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$ApiBase = $ApiBase.TrimEnd('/')
$ModoToken = -not [string]::IsNullOrWhiteSpace($Token)

# Monta a etiqueta a partir do setor e do nome: 3 primeiras letras do setor (maiúsculas)
# + "-" + iniciais do nome. Respeita o limite de 10 caracteres da coluna.
function MontarEtiqueta($nome, $setor) {
  $set = ($setor -replace '[^A-Za-z]', '').ToUpper()
  $pref = if ($set.Length -ge 3) { $set.Substring(0, 3) }
          elseif ($set.Length -gt 0) { $set }
          else { 'XXX' }
  $partes = $nome -split '\s+' | Where-Object { $_ -ne '' }
  $iniciais = ($partes | ForEach-Object { $_.Substring(0, 1).ToUpper() }) -join ''
  $etq = if ($iniciais) { "$pref-$iniciais" } else { $pref }
  if ($etq.Length -gt 10) { $etq = $etq.Substring(0, 10) }
  return $etq
}

if ($ModoToken) {
  # Autoatendimento: pergunta nome e setor para montar a etiqueta deste PC.
  $nomePessoa = Read-Host "Seu nome completo"
  $setorPessoa = Read-Host "Seu setor"
  $Etiqueta = MontarEtiqueta $nomePessoa $setorPessoa
  Write-Host ("Etiqueta gerada: {0}" -f $Etiqueta) -ForegroundColor Cyan
} else {
  # Modo manual (TI/dev): exige login, empresa e etiqueta.
  if (-not $Login) { throw "Informe -Login (ou use -Token para o modo autoatendimento)." }
  if (-not $EmpresaId) { throw "Informe -EmpresaId no modo manual." }
  if (-not $Etiqueta) { throw "Informe -Etiqueta no modo manual." }
}

if ($Etiqueta.Length -gt 10) {
  Write-Warning "A etiqueta tem mais de 10 caracteres; o backend vai recusar."
}

# Valores-placeholder comuns de BIOS/OEM que não valem como marca/modelo reais.
$PLACEHOLDERS = @(
  'to be filled by o.e.m.', 'system manufacturer', 'system product name',
  'default string', 'o.e.m.', 'oem', 'none', 'not applicable', 'n/a', 'unknown',
  'not specified', 'standard disk drives', 'to be filled by oem'
)

function Limpar([string] $valor) {
  if ([string]::IsNullOrWhiteSpace($valor)) { return '' }
  $v = $valor.Trim()
  # Compara sem parênteses nas pontas (ex.: "(Standard disk drives)").
  $chave = $v.ToLower().Trim('(', ')', ' ')
  if ($PLACEHOLDERS -contains $chave) { return '' }
  return $v
}

function New-Peca($tipo, $marca, $modelo, $numSerie, $especificacoes) {
  $m  = Limpar $marca
  $mo = Limpar $modelo
  # O backend recusa "modelo sem marca"; se a marca sumiu (vazia ou placeholder),
  # descarta o modelo junto — a peça grava marca/modelo nulos em vez de derrubar
  # o lote inteiro com erro 400.
  if (-not $m) { $mo = '' }
  $obj = [ordered]@{
    tipo      = $tipo
    marca     = $m
    modelo    = $mo
    num_serie = Limpar $numSerie
    preco     = ''
  }
  # especificacoes (capacidade, velocidade/DDR, mídia/conexão, etc.) é OPCIONAL: só
  # entra no payload se houver ao menos um campo, mantendo retrocompatibilidade.
  if ($especificacoes -and $especificacoes.Count -gt 0) {
    $obj['especificacoes'] = $especificacoes
  }
  return $obj
}

# Converte bytes em texto legível (GB, ou TB para discos grandes). Vazio se não houver
# tamanho. Usado em capacidade de RAM/armazenamento e memória de vídeo.
function FormatarTamanho($bytes) {
  $b = [double]($bytes)
  if (-not $b -or $b -le 0) { return '' }
  if ($b -ge 1TB) { return "{0} TB" -f [math]::Round($b / 1TB, 1) }
  if ($b -ge 1GB) { return "{0} GB" -f [math]::Round($b / 1GB, 0) }
  return "{0} MB" -f [math]::Round($b / 1MB, 0)
}

# Marcas conhecidas de armazenamento, procuradas (em ordem) no FriendlyName/Model do
# disco — cuja coluna Manufacturer quase sempre é pseudo. Sem isso, o modelo do disco
# seria descartado (regra "modelo sem marca"). Pares [trecho em minúsculas, marca].
$MARCAS_DISCO = @(
  @('western digital', 'Western Digital'),
  @('wdc', 'Western Digital'),
  @('wd_', 'Western Digital'),
  @('samsung', 'Samsung'),
  @('seagate', 'Seagate'),
  @('kingston', 'Kingston'),
  @('crucial', 'Crucial'),
  @('sandisk', 'SanDisk'),
  @('kioxia', 'Kioxia'),
  @('toshiba', 'Toshiba'),
  @('micron', 'Micron'),
  @('intel', 'Intel'),
  @('adata', 'ADATA'),
  @('hgst', 'HGST'),
  @('hitachi', 'Hitachi'),
  @('corsair', 'Corsair'),
  @('lexar', 'Lexar'),
  @('pny', 'PNY')
)

function DerivarMarcaDisco([string] $texto) {
  if ([string]::IsNullOrWhiteSpace($texto)) { return '' }
  $t = $texto.ToLower()
  foreach ($par in $MARCAS_DISCO) {
    if ($t -like "*$($par[0])*") { return $par[1] }
  }
  return ''
}

# Tipo de memória pelo código SMBIOSMemoryType (mais confiável que MemoryType).
$DDR_POR_CODIGO = @{
  20 = 'DDR'; 21 = 'DDR2'; 24 = 'DDR3'; 26 = 'DDR4'; 34 = 'DDR5'
}

Write-Host "Coletando hardware desta máquina..." -ForegroundColor Cyan

$cs = Get-CimInstance Win32_ComputerSystem
$desktopMarca  = if ($Marca)  { $Marca }  else { Limpar $cs.Manufacturer }
$desktopModelo = if ($Modelo) { $Modelo } else { Limpar $cs.Model }

$pecas = New-Object System.Collections.Generic.List[object]

# Processador(es) — núcleos, threads e clock
foreach ($cpu in Get-CimInstance Win32_Processor) {
  $espec = [ordered]@{}
  if ($cpu.NumberOfCores)              { $espec['nucleos'] = "$($cpu.NumberOfCores)" }
  if ($cpu.NumberOfLogicalProcessors) { $espec['threads'] = "$($cpu.NumberOfLogicalProcessors)" }
  if ($cpu.MaxClockSpeed)              { $espec['clock']   = "{0} MHz" -f $cpu.MaxClockSpeed }
  $pecas.Add( (New-Peca 'processador' $cpu.Manufacturer $cpu.Name $cpu.ProcessorId $espec) )
}

# Placa-mãe
foreach ($mb in Get-CimInstance Win32_BaseBoard) {
  $pecas.Add( (New-Peca 'placa-mae' $mb.Manufacturer $mb.Product $mb.SerialNumber) )
}

# Memória (uma peça por pente) — capacidade, velocidade e tipo (DDR)
foreach ($mem in Get-CimInstance Win32_PhysicalMemory) {
  $espec = [ordered]@{}
  $cap = FormatarTamanho $mem.Capacity
  if ($cap) { $espec['capacidade'] = $cap }
  # ConfiguredClockSpeed = velocidade efetiva; Speed = nominal (fallback).
  $clk = if ($mem.ConfiguredClockSpeed) { $mem.ConfiguredClockSpeed } else { $mem.Speed }
  if ($clk) { $espec['velocidade'] = "{0} MHz" -f $clk }
  $tipoMem = $DDR_POR_CODIGO[[int]$mem.SMBIOSMemoryType]
  if ($tipoMem) { $espec['tipo'] = $tipoMem }
  $pecas.Add( (New-Peca 'ram' $mem.Manufacturer $mem.PartNumber $mem.SerialNumber $espec) )
}

# Armazenamento — capacidade, mídia (HDD/SSD) e conexão (SATA/NVMe/USB).
# Fonte preferida: Get-PhysicalDisk (módulo Storage, Win8/2012+), que lista discos
# físicos reais (sem leitores de cartão/slots vazios do Win32_DiskDrive) e expõe
# MediaType/BusType. Fallback para Win32_DiskDrive em PowerShell/SO antigos.
$discos = $null
try { $discos = @(Get-PhysicalDisk -ErrorAction Stop) } catch { $discos = $null }

if ($discos) {
  foreach ($d in $discos | Where-Object { "$($_.BusType)" -ne 'USB' }) {
    $modelo = Limpar $d.FriendlyName
    $marca  = DerivarMarcaDisco $modelo
    $espec  = [ordered]@{}
    $cap = FormatarTamanho $d.Size
    if ($cap) { $espec['capacidade'] = $cap }
    $midia = "$($d.MediaType)"
    if ($midia -and $midia -ne 'Unspecified') { $espec['midia'] = $midia }
    $conexao = "$($d.BusType)"
    if ($conexao -and $conexao -ne 'Unspecified') { $espec['conexao'] = $conexao }
    # Se a marca não foi derivada, o modelo seria descartado (regra "modelo sem
    # marca"); preserva-o na descrição para não perder a identidade do disco.
    if (-not $marca -and $modelo) { $espec['descricao'] = $modelo }
    $pecas.Add( (New-Peca 'armazenamento' $marca $modelo $d.SerialNumber $espec) )
  }
} else {
  foreach ($disk in Get-CimInstance Win32_DiskDrive |
      Where-Object { $_.InterfaceType -ne 'USB' -and $_.MediaType -notmatch 'Removable' }) {
    # Win32_DiskDrive.Manufacturer quase sempre é um pseudo-fabricante do Windows
    # (ex.: "(Standard disk drives)", inclusive localizado) — não vale como marca real.
    $modelo = Limpar $disk.Model
    $marca  = DerivarMarcaDisco $modelo
    $espec  = [ordered]@{}
    $cap = FormatarTamanho $disk.Size
    if ($cap) { $espec['capacidade'] = $cap }
    if ($disk.InterfaceType) { $espec['conexao'] = "$($disk.InterfaceType)" }
    if (-not $marca -and $modelo) { $espec['descricao'] = $modelo }
    $pecas.Add( (New-Peca 'armazenamento' $marca $modelo $disk.SerialNumber $espec) )
  }
}

# Placa de vídeo — memória de vídeo (best-effort)
foreach ($gpu in Get-CimInstance Win32_VideoController | Where-Object { $_.Name }) {
  $espec = [ordered]@{}
  # AdapterRAM é uint32 e satura em ~4 GB para placas maiores — valor aproximado.
  if ($gpu.AdapterRAM -and [double]$gpu.AdapterRAM -gt 0) {
    $mem = FormatarTamanho $gpu.AdapterRAM
    if ($mem) { $espec['memoria'] = $mem }
  }
  $pecas.Add( (New-Peca 'placa-video' $gpu.AdapterCompatibility $gpu.Name $null $espec) )
}

# Placa de rede (apenas adaptadores físicos, sem virtuais) — velocidade do enlace
foreach ($nic in Get-CimInstance Win32_NetworkAdapter |
    Where-Object { $_.PhysicalAdapter -and $_.PNPDeviceID -and $_.PNPDeviceID -notlike 'ROOT\*' }) {
  $espec = [ordered]@{}
  # Speed é em bits/s e só é confiável com o link ativo (0/nulo quando desconectado).
  if ($nic.Speed -and [double]$nic.Speed -gt 0) {
    $mbps = [math]::Round([double]$nic.Speed / 1000000, 0)
    if ($mbps -ge 1000) { $espec['velocidade'] = "{0} Gbps" -f [math]::Round($mbps / 1000, 0) }
    else                { $espec['velocidade'] = "{0} Mbps" -f $mbps }
  }
  $pecas.Add( (New-Peca 'placa-rede' $nic.Manufacturer $nic.Name $nic.MACAddress $espec) )
}

if ($pecas.Count -eq 0) {
  throw "Nenhuma peça coletada — o desktop precisa de ao menos uma peça."
}

$payload = [ordered]@{
  item_empresa_id = $EmpresaId
  etiqueta        = $Etiqueta
  marca           = $desktopMarca
  modelo          = $desktopModelo
  em_uso          = [bool] $EmUso
  pecas           = $pecas
}
if ($PSBoundParameters.ContainsKey('SetorId'))       { $payload['setor_id'] = $SetorId }
if ($PSBoundParameters.ContainsKey('WorkstationId')) { $payload['workstation_id'] = $WorkstationId }

# Depth 8: payload -> pecas -> peca -> especificacoes -> valores.
$json = $payload | ConvertTo-Json -Depth 8

Write-Host ("Desktop: {0} {1}" -f $desktopMarca, $desktopModelo) -ForegroundColor Green
Write-Host ("Peças coletadas: {0}" -f $pecas.Count) -ForegroundColor Green
foreach ($p in $pecas) {
  Write-Host ("  - {0}: {1} {2}" -f $p.tipo, $p.marca, $p.modelo)
  if ($p.Contains('especificacoes')) {
    $resumo = ($p.especificacoes.GetEnumerator() |
      ForEach-Object { "{0}: {1}" -f $_.Key, $_.Value }) -join ', '
    Write-Host ("      {0}" -f $resumo) -ForegroundColor DarkGray
  }
}

if ($DryRun) {
  Write-Host "`n[DryRun] JSON que seria enviado:`n" -ForegroundColor Yellow
  Write-Output $json
  return
}

function Get-MensagemErro($err) {
  # PS 7 expõe o corpo do erro em ErrorDetails.Message; PS 5.1 exige ler o stream.
  if ($err.ErrorDetails -and $err.ErrorDetails.Message) {
    try { return (($err.ErrorDetails.Message | ConvertFrom-Json).message) }
    catch { return $err.ErrorDetails.Message }
  }
  $resp = $err.Exception.Response
  if ($resp) {
    try {
      $reader = New-Object IO.StreamReader($resp.GetResponseStream())
      $corpo = $reader.ReadToEnd()
      try { return (($corpo | ConvertFrom-Json).message) } catch { return $corpo }
    } catch { }
  }
  return $err.Exception.Message
}

if ($ModoToken) {
  # Autoatendimento: autentica pelo token (Bearer); a empresa vem do token no backend.
  Write-Host "`nEnviando este computador para $ApiBase/item/coletar-desktop/token..." -ForegroundColor Cyan
  try {
    $resposta = Invoke-RestMethod -Uri "$ApiBase/item/coletar-desktop/token" -Method Post `
      -Body $json -ContentType 'application/json' `
      -Headers @{ Authorization = "Bearer $Token" }
  } catch {
    throw "Falha ao enviar a coleta: $(Get-MensagemErro $_)"
  }
} else {
  # Modo manual (TI/dev): senha (prompt seguro se omitida) + login por cookie de sessão.
  if (-not $Senha) {
    $secure = Read-Host "Senha de $Login" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
      $Senha = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }

  Write-Host "`nAutenticando em $ApiBase/login..." -ForegroundColor Cyan
  $loginJson = @{ usuario_login = $Login; usuario_senha = $Senha } | ConvertTo-Json
  try {
    Invoke-RestMethod -Uri "$ApiBase/login" -Method Post -Body $loginJson `
      -ContentType 'application/json' -SessionVariable session | Out-Null
  } catch {
    throw "Falha no login: $(Get-MensagemErro $_)"
  }

  Write-Host "Enviando o desktop para $ApiBase/item/coletar-desktop..." -ForegroundColor Cyan
  try {
    $resposta = Invoke-RestMethod -Uri "$ApiBase/item/coletar-desktop" -Method Post `
      -Body $json -ContentType 'application/json' -WebSession $session
  } catch {
    throw "Falha ao cadastrar o desktop: $(Get-MensagemErro $_)"
  }
}

Write-Host "`nOK - $($resposta.message)" -ForegroundColor Green
Write-Host ("  item_id: {0} | pecas criadas: {1}" -f $resposta.item_id, $resposta.pecas_criadas)




