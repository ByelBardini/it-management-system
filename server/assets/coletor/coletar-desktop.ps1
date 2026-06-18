<#
.SYNOPSIS
  Coletor de desktop do InfraHub - le o hardware desta maquina Windows e cadastra
  o desktop (item + pecas) no inventario numa unica chamada ao endpoint
  POST /item/coletar-desktop.

.DESCRIPTION
  Coleta marca/modelo do desktop e as pecas (processador, placa-mae, memoria,
  armazenamento, video e rede) via CIM/WMI e envia tudo como JSON.
  Autentica com usuario e senha fixos (coletor / 123456).

.PARAMETER ApiBase
  URL base da API, sem barra final. Ex.: http://localhost:3032 ou
  https://infrahub.suaempresa.com/api.

.PARAMETER EmpresaId
  Id da empresa dona do desktop. Se omitido, o script lista as empresas apos o login
  e pede para escolher.

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
  .\coletar-desktop.ps1 -ApiBase http://localhost:3032 -EmpresaId 1

.EXAMPLE
  .\coletar-desktop.ps1 -ApiBase http://localhost:3032
  (lista as empresas disponiveis e pede para escolher)

.NOTES
  Requer Windows + PowerShell 5.1+ e permissao de leitura WMI (um usuario normal
  costuma bastar). Para rodar sem mexer na politica da maquina:
    powershell -ExecutionPolicy Bypass -File .\coletar-desktop.ps1 ...
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $ApiBase,
  [int]    $EmpresaId,
  [int]    $SetorId,
  [int]    $WorkstationId,
  [string] $Marca,
  [string] $Modelo,
  [bool]   $EmUso = $true,
  [switch] $DryRun
)

$ErrorActionPreference = 'Stop'

# Credenciais fixas do usuario coletor
$LOGIN = 'coletor'
$SENHA = '123456'

# Windows PowerShell 5.1 pode negociar TLS antigo; forca TLS 1.2 para HTTPS moderno.
try {
  [Net.ServicePointManager]::SecurityProtocol =
    [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$ApiBase = $ApiBase.TrimEnd('/')

# Monta a etiqueta a partir do setor e do nome: 3 primeiras letras do setor (maiusculas)
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

$nomePessoa = Read-Host "Seu nome completo"
$setorPessoa = Read-Host "Seu setor"
$Etiqueta = MontarEtiqueta $nomePessoa $setorPessoa
Write-Host ("Etiqueta gerada: {0}" -f $Etiqueta) -ForegroundColor Cyan

if ($Etiqueta.Length -gt 10) {
  Write-Warning "A etiqueta tem mais de 10 caracteres; o backend vai recusar."
}

# Valores-placeholder comuns de BIOS/OEM que nao valem como marca/modelo reais.
$PLACEHOLDERS = @(
  'to be filled by o.e.m.', 'system manufacturer', 'system product name',
  'default string', 'o.e.m.', 'oem', 'none', 'not applicable', 'n/a', 'unknown',
  'not specified', 'standard disk drives', 'to be filled by oem'
)

function Limpar([string] $valor) {
  if ([string]::IsNullOrWhiteSpace($valor)) { return '' }
  $v = $valor.Trim()
  $chave = $v.ToLower().Trim('(', ')', ' ')
  if ($PLACEHOLDERS -contains $chave) { return '' }
  return $v
}

function New-Peca($tipo, $marca, $modelo, $numSerie, $especificacoes) {
  $m  = Limpar $marca
  $mo = Limpar $modelo
  if (-not $m) { $mo = '' }
  $obj = [ordered]@{
    tipo      = $tipo
    marca     = $m
    modelo    = $mo
    num_serie = Limpar $numSerie
    preco     = ''
  }
  if ($especificacoes -and $especificacoes.Count -gt 0) {
    $obj['especificacoes'] = $especificacoes
  }
  return $obj
}

function FormatarTamanho($bytes) {
  $b = [double]($bytes)
  if (-not $b -or $b -le 0) { return '' }
  if ($b -ge 1TB) { return "{0} TB" -f [math]::Round($b / 1TB, 1) }
  if ($b -ge 1GB) { return "{0} GB" -f [math]::Round($b / 1GB, 0) }
  return "{0} MB" -f [math]::Round($b / 1MB, 0)
}

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

$DDR_POR_CODIGO = @{
  20 = 'DDR'; 21 = 'DDR2'; 24 = 'DDR3'; 26 = 'DDR4'; 34 = 'DDR5'
}

Write-Host "Coletando hardware desta maquina..." -ForegroundColor Cyan

$cs = Get-CimInstance Win32_ComputerSystem
$desktopMarca  = if ($Marca)  { $Marca }  else { Limpar $cs.Manufacturer }
$desktopModelo = if ($Modelo) { $Modelo } else { Limpar $cs.Model }

$pecas = New-Object System.Collections.Generic.List[object]

foreach ($cpu in Get-CimInstance Win32_Processor) {
  $espec = [ordered]@{}
  if ($cpu.NumberOfCores)              { $espec['nucleos'] = "$($cpu.NumberOfCores)" }
  if ($cpu.NumberOfLogicalProcessors) { $espec['threads'] = "$($cpu.NumberOfLogicalProcessors)" }
  if ($cpu.MaxClockSpeed)              { $espec['clock']   = "{0} MHz" -f $cpu.MaxClockSpeed }
  $pecas.Add( (New-Peca 'processador' $cpu.Manufacturer $cpu.Name $cpu.ProcessorId $espec) )
}

foreach ($mb in Get-CimInstance Win32_BaseBoard) {
  $pecas.Add( (New-Peca 'placa-mae' $mb.Manufacturer $mb.Product $mb.SerialNumber) )
}

foreach ($mem in Get-CimInstance Win32_PhysicalMemory) {
  $espec = [ordered]@{}
  $cap = FormatarTamanho $mem.Capacity
  if ($cap) { $espec['capacidade'] = $cap }
  $clk = if ($mem.ConfiguredClockSpeed) { $mem.ConfiguredClockSpeed } else { $mem.Speed }
  if ($clk) { $espec['velocidade'] = "{0} MHz" -f $clk }
  $tipoMem = $DDR_POR_CODIGO[[int]$mem.SMBIOSMemoryType]
  if ($tipoMem) { $espec['tipo'] = $tipoMem }
  $pecas.Add( (New-Peca 'ram' $mem.Manufacturer $mem.PartNumber $mem.SerialNumber $espec) )
}

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
    if (-not $marca -and $modelo) { $espec['descricao'] = $modelo }
    $pecas.Add( (New-Peca 'armazenamento' $marca $modelo $d.SerialNumber $espec) )
  }
} else {
  foreach ($disk in Get-CimInstance Win32_DiskDrive |
      Where-Object { $_.InterfaceType -ne 'USB' -and $_.MediaType -notmatch 'Removable' }) {
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

foreach ($gpu in Get-CimInstance Win32_VideoController | Where-Object { $_.Name }) {
  $espec = [ordered]@{}
  if ($gpu.AdapterRAM -and [double]$gpu.AdapterRAM -gt 0) {
    $mem = FormatarTamanho $gpu.AdapterRAM
    if ($mem) { $espec['memoria'] = $mem }
  }
  $pecas.Add( (New-Peca 'placa-video' $gpu.AdapterCompatibility $gpu.Name $null $espec) )
}

foreach ($nic in Get-CimInstance Win32_NetworkAdapter |
    Where-Object { $_.PhysicalAdapter -and $_.PNPDeviceID -and $_.PNPDeviceID -notlike 'ROOT\*' }) {
  $espec = [ordered]@{}
  if ($nic.Speed -and [double]$nic.Speed -gt 0) {
    $mbps = [math]::Round([double]$nic.Speed / 1000000, 0)
    if ($mbps -ge 1000) { $espec['velocidade'] = "{0} Gbps" -f [math]::Round($mbps / 1000, 0) }
    else                { $espec['velocidade'] = "{0} Mbps" -f $mbps }
  }
  $pecas.Add( (New-Peca 'placa-rede' $nic.Manufacturer $nic.Name $nic.MACAddress $espec) )
}

if ($pecas.Count -eq 0) {
  throw "Nenhuma peca coletada - o desktop precisa de ao menos uma peca."
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

$json = $payload | ConvertTo-Json -Depth 8

Write-Host ("Desktop: {0} {1}" -f $desktopMarca, $desktopModelo) -ForegroundColor Green
Write-Host ("Pecas coletadas: {0}" -f $pecas.Count) -ForegroundColor Green
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

Write-Host "`nAutenticando em $ApiBase/login..." -ForegroundColor Cyan
$loginJson = @{ usuario_login = $LOGIN; usuario_senha = $SENHA } | ConvertTo-Json
try {
  Invoke-RestMethod -Uri "$ApiBase/login" -Method Post -Body $loginJson `
    -ContentType 'application/json' -SessionVariable session | Out-Null
} catch {
  throw "Falha no login: $(Get-MensagemErro $_)"
}

# Se EmpresaId nao foi informado, lista as empresas e pede para escolher.
if (-not $EmpresaId) {
  Write-Host "`nBuscando empresas cadastradas..." -ForegroundColor Cyan
  try {
    $empresas = Invoke-RestMethod -Uri "$ApiBase/empresa" -Method Get -WebSession $session
  } catch {
    throw "Falha ao listar empresas: $(Get-MensagemErro $_)"
  }

  if (-not $empresas -or $empresas.Count -eq 0) {
    throw "Nenhuma empresa encontrada na API."
  }

  Write-Host ""
  Write-Host "Empresas disponiveis:" -ForegroundColor Yellow
  foreach ($e in $empresas) {
    Write-Host ("  [{0}] {1}" -f $e.empresa_id, $e.empresa_nome)
  }
  Write-Host ""

  do {
    $entrada = Read-Host "Digite o ID da empresa"
    $EmpresaId = [int]($entrada -replace '[^0-9]', '')
    $valida = $empresas | Where-Object { $_.empresa_id -eq $EmpresaId }
  } while (-not $valida)

  Write-Host ("Empresa selecionada: [{0}] {1}" -f $valida.empresa_id, $valida.empresa_nome) -ForegroundColor Cyan

  # Atualiza o payload com o EmpresaId escolhido.
  $payload['item_empresa_id'] = $EmpresaId
  $json = $payload | ConvertTo-Json -Depth 8
}

Write-Host "Enviando o desktop para $ApiBase/item/coletar-desktop..." -ForegroundColor Cyan
try {
  $resposta = Invoke-RestMethod -Uri "$ApiBase/item/coletar-desktop" -Method Post `
    -Body $json -ContentType 'application/json' -WebSession $session
} catch {
  throw "Falha ao cadastrar o desktop: $(Get-MensagemErro $_)"
}

Write-Host "`nOK - $($resposta.message)" -ForegroundColor Green
Write-Host ("  item_id: {0} | pecas criadas: {1}" -f $resposta.item_id, $resposta.pecas_criadas)
