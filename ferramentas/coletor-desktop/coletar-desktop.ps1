<#
.SYNOPSIS
  Coletor de desktop do InfraHub — lê o hardware desta máquina Windows e cadastra
  o desktop (item + peças) no inventário numa única chamada ao endpoint
  POST /item/coletar-desktop.

.DESCRIPTION
  Faz login na API (o cookie de sessão httpOnly é capturado via -SessionVariable),
  coleta marca/modelo do desktop e as peças (processador, placa-mãe, memória,
  armazenamento, vídeo e rede) via CIM/WMI e envia tudo como JSON. Número de série
  e preço das peças são OPCIONAIS — o backend aplica os defaults ("N/A" e 0).

.PARAMETER ApiBase
  URL base da API, sem barra final. Ex.: http://localhost:3032 ou
  https://infrahub.suaempresa.com/api (atrás do nginx que faz proxy de /api).

.PARAMETER Login
  Login de um usuário adm.

.PARAMETER Senha
  Senha do usuário adm. Se omitida, é pedida de forma segura no console.

.PARAMETER EmpresaId
  Id da empresa dona do desktop. Obrigatório.

.PARAMETER Etiqueta
  Etiqueta do desktop (máximo 10 caracteres). Obrigatório.

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
  [Parameter(Mandatory = $true)] [string] $Login,
  [string] $Senha,
  [Parameter(Mandatory = $true)] [int] $EmpresaId,
  [Parameter(Mandatory = $true)] [string] $Etiqueta,
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

function New-Peca($tipo, $marca, $modelo, $numSerie) {
  $m  = Limpar $marca
  $mo = Limpar $modelo
  # O backend recusa "modelo sem marca"; se a marca sumiu (vazia ou placeholder),
  # descarta o modelo junto — a peça grava marca/modelo nulos em vez de derrubar
  # o lote inteiro com erro 400.
  if (-not $m) { $mo = '' }
  return [ordered]@{
    tipo      = $tipo
    marca     = $m
    modelo    = $mo
    num_serie = Limpar $numSerie
    preco     = ''
  }
}

Write-Host "Coletando hardware desta máquina..." -ForegroundColor Cyan

$cs = Get-CimInstance Win32_ComputerSystem
$desktopMarca  = if ($Marca)  { $Marca }  else { Limpar $cs.Manufacturer }
$desktopModelo = if ($Modelo) { $Modelo } else { Limpar $cs.Model }

$pecas = New-Object System.Collections.Generic.List[object]

# Processador(es)
foreach ($cpu in Get-CimInstance Win32_Processor) {
  $pecas.Add( (New-Peca 'processador' $cpu.Manufacturer $cpu.Name $cpu.ProcessorId) )
}

# Placa-mãe
foreach ($mb in Get-CimInstance Win32_BaseBoard) {
  $pecas.Add( (New-Peca 'placa-mae' $mb.Manufacturer $mb.Product $mb.SerialNumber) )
}

# Memória (uma peça por pente)
foreach ($mem in Get-CimInstance Win32_PhysicalMemory) {
  $pecas.Add( (New-Peca 'ram' $mem.Manufacturer $mem.PartNumber $mem.SerialNumber) )
}

# Armazenamento (ignora discos USB/removíveis)
foreach ($disk in Get-CimInstance Win32_DiskDrive |
    Where-Object { $_.InterfaceType -ne 'USB' -and $_.MediaType -notmatch 'Removable' }) {
  # Win32_DiskDrive.Manufacturer quase sempre é um pseudo-fabricante do Windows
  # (ex.: "(Standard disk drives)", inclusive localizado) — não vale como marca real.
  $marcaDisco = if ($disk.Manufacturer -match 'disk drive|disco') { '' } else { $disk.Manufacturer }
  $pecas.Add( (New-Peca 'armazenamento' $marcaDisco $disk.Model $disk.SerialNumber) )
}

# Placa de vídeo
foreach ($gpu in Get-CimInstance Win32_VideoController | Where-Object { $_.Name }) {
  $pecas.Add( (New-Peca 'placa-video' $gpu.AdapterCompatibility $gpu.Name $null) )
}

# Placa de rede (apenas adaptadores físicos, sem virtuais)
foreach ($nic in Get-CimInstance Win32_NetworkAdapter |
    Where-Object { $_.PhysicalAdapter -and $_.PNPDeviceID -and $_.PNPDeviceID -notlike 'ROOT\*' }) {
  $pecas.Add( (New-Peca 'placa-rede' $nic.Manufacturer $nic.Name $nic.MACAddress) )
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

$json = $payload | ConvertTo-Json -Depth 6

Write-Host ("Desktop: {0} {1}" -f $desktopMarca, $desktopModelo) -ForegroundColor Green
Write-Host ("Peças coletadas: {0}" -f $pecas.Count) -ForegroundColor Green
foreach ($p in $pecas) {
  Write-Host ("  - {0}: {1} {2}" -f $p.tipo, $p.marca, $p.modelo)
}

if ($DryRun) {
  Write-Host "`n[DryRun] JSON que seria enviado:`n" -ForegroundColor Yellow
  Write-Output $json
  return
}

# Senha: se não veio por parâmetro, pede de forma segura.
if (-not $Senha) {
  $secure = Read-Host "Senha de $Login" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $Senha = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
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

Write-Host "`nOK - $($resposta.message)" -ForegroundColor Green
Write-Host ("  item_id: {0} | pecas criadas: {1}" -f $resposta.item_id, $resposta.pecas_criadas)
