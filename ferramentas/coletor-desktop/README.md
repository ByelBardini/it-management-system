# Coletor de desktop — InfraHub

Script PowerShell que lê o hardware de uma máquina Windows e cadastra o **desktop**
(item + peças) no inventário do InfraHub numa única chamada, via o endpoint
`POST /item/coletar-desktop`.

Em vez de criar cada peça à mão e depois montar o desktop, você roda o script na
própria máquina-alvo: ele detecta marca/modelo do computador e as peças
(processador, placa-mãe, memória, armazenamento, vídeo e rede) e envia tudo de uma
vez. Número de série e preço de peça que o hardware não informa caem nos defaults
do backend (`"N/A"` e `0`).

## Dois modos

- **Autoatendimento (`-Token`)** — para os **PCs da empresa**. O funcionário loga no
  site com uma conta de papel **`coletor`**, clica em **Baixar coletor** e recebe um
  ZIP com este script + um `Coletar.bat`. Ao dar duplo-clique no `.bat`, o script
  autentica pelo **token embutido** (Bearer, revogável), pergunta **nome** e **setor**
  e monta a etiqueta (3 letras do setor + `-` + iniciais do nome, ex.: `FIN-JCS`). A
  empresa vem do token — sem login/senha/URL. Ver [auth-usuarios](../../docs/context/auth-usuarios.md).
- **Manual (`-Login`/`-EmpresaId`/`-Etiqueta`)** — para **TI/dev**, com login adm.

## Pré-requisitos

- **Windows** com **PowerShell 5.1+** (já incluso no Windows 10/11) ou PowerShell 7.
- Leitura de WMI/CIM (rodar como um usuário normal costuma bastar).
- Autoatendimento: uma conta **`coletor`** (criada na tela de Usuários, vinculada a uma
  empresa). Manual: uma conta **adm** e a URL base da API acessível pela máquina.

## Parâmetros

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `-ApiBase` | sim | URL base da API, **sem barra final**. Ex.: `http://localhost:3032` ou `https://infrahub.suaempresa.com/api` |
| `-Token` | autoatendimento | Token de coleta (Bearer). Dispensa `-Login`/`-EmpresaId`/`-Etiqueta`; já vem embutido no `Coletar.bat` do ZIP |
| `-Login` | manual | Login de um usuário adm |
| `-Senha` | não | Senha do adm. Se omitida, é pedida de forma segura no console |
| `-EmpresaId` | manual | Id da empresa dona do desktop |
| `-Etiqueta` | manual | Etiqueta do desktop (máx. 10 caracteres) |
| `-SetorId` | não | Id do setor a vincular |
| `-WorkstationId` | não | Id do workstation a vincular |
| `-Marca` | não | Sobrescreve a marca do desktop detectada no hardware |
| `-Modelo` | não | Sobrescreve o modelo do desktop detectado no hardware |
| `-EmUso` | não | Marca o item como em uso (default `$true`; use `-EmUso:$false` para desligar) |
| `-DryRun` | não | Coleta e imprime o JSON que **seria** enviado, sem autenticar nem enviar |

## Como rodar

A política de execução padrão do Windows costuma bloquear scripts. A forma mais
simples, sem alterar a máquina, é passar `-ExecutionPolicy Bypass` só para esta
execução:

```powershell
powershell -ExecutionPolicy Bypass -File .\coletar-desktop.ps1 `
  -ApiBase http://localhost:3032 `
  -Login admin -Senha admin123 `
  -EmpresaId 1 -Etiqueta DSK-014
```

Conferindo o que seria enviado, **sem** cadastrar nada (recomendado na primeira vez):

```powershell
powershell -ExecutionPolicy Bypass -File .\coletar-desktop.ps1 `
  -ApiBase http://localhost:3032 -Login admin -EmpresaId 1 -Etiqueta DSK-014 -DryRun
```

Vinculando setor/workstation e sobrescrevendo a marca do desktop:

```powershell
.\coletar-desktop.ps1 -ApiBase https://infrahub.suaempresa.com/api `
  -Login admin -EmpresaId 1 -Etiqueta DSK-014 `
  -SetorId 3 -WorkstationId 9 -Marca Dell -Modelo "OptiPlex 7090"
```

Se `-Senha` for omitida, o script pede a senha de forma segura (não fica no
histórico do shell).

## O que é coletado

| Tipo de peça | Origem (CIM/WMI) | Marca | Modelo | Nº de série | Especificações |
|---|---|---|---|---|---|
| `processador` | `Win32_Processor` | `Manufacturer` | `Name` | `ProcessorId` | núcleos, threads, clock |
| `placa-mae` | `Win32_BaseBoard` | `Manufacturer` | `Product` | `SerialNumber` | — |
| `ram` (1 por pente) | `Win32_PhysicalMemory` | `Manufacturer` | `PartNumber` | `SerialNumber` | capacidade, velocidade, tipo (DDR3/4/5) |
| `armazenamento` | `Get-PhysicalDisk` (fallback `Win32_DiskDrive`; ignora USB) | derivada do modelo | `FriendlyName`/`Model` | `SerialNumber` | capacidade, mídia (HDD/SSD), conexão (SATA/NVMe/USB) |
| `placa-video` | `Win32_VideoController` | `AdapterCompatibility` | `Name` | — | memória (best-effort) |
| `placa-rede` | `Win32_NetworkAdapter` (só físicos) | `Manufacturer` | `Name` | `MACAddress` | velocidade (com link ativo) |

As **especificações** vão num objeto opcional `especificacoes` por peça (rótulo→valor) e
são gravadas na coluna `peca_especificacoes` (JSON) do inventário; aparecem expandíveis no
detalhe do desktop e na tabela de peças. Campos que o hardware não informa são omitidos.

> **Armazenamento:** a marca é **derivada** do nome do disco (Samsung, WD, Seagate,
> Kingston, Crucial…), pois o `Manufacturer` do Windows é um pseudo-fabricante. Quando a
> marca não é reconhecida, o nome completo do disco é preservado em `especificacoes.descricao`
> (em vez de ser descartado pela regra "modelo sem marca").

A **marca/modelo do desktop** vêm de `Win32_ComputerSystem` (`Manufacturer`/`Model`),
sobreponíveis por `-Marca`/`-Modelo`. Valores-placeholder de BIOS comuns (ex.:
"To Be Filled By O.E.M.", "System manufacturer", "Default string") são tratados como
vazios — o backend então grava a marca/modelo como nulo em vez de criar um cadastro lixo.

## Segurança

- O login grava o token JWT num **cookie httpOnly** (não trafega no corpo da
  resposta). O script captura esse cookie com `-SessionVariable` e o reenvia no POST
  com `-WebSession` — o token nunca é manipulado em texto puro pelo script.
- Use **HTTPS** em produção (o cookie de sessão é `Secure`). Sob HTTP só em rede
  local confiável (ex.: `localhost`).
- O endpoint é **adm**. Trate o login como credencial sensível: prefira informar a
  senha no prompt (omitindo `-Senha`) a deixá-la em scripts/agendamentos.

## Empacotar em `.exe` (opcional)

Para distribuir sem depender de `.ps1`, dá para gerar um executável com o módulo
[`ps2exe`](https://github.com/MScholtes/PS2EXE):

```powershell
Install-Module ps2exe -Scope CurrentUser   # uma vez
Invoke-PS2EXE .\coletar-desktop.ps1 .\coletar-desktop.exe
```

O `.exe` aceita os mesmos parâmetros:

```powershell
.\coletar-desktop.exe -ApiBase http://localhost:3032 -Login admin -EmpresaId 1 -Etiqueta DSK-014
```

> O empacotamento é só conveniência de distribuição; a lógica (e a validação de
> verdade) continua no backend, em `POST /item/coletar-desktop`.

## Solução de problemas

- **`Falha no login: ...`** — confira `-ApiBase` (sem barra final), login/senha e se a
  conta é adm.
- **`... etiqueta deve ter no máximo 10 caracteres`** — encurte `-Etiqueta`.
- **Erro de TLS/SSL em HTTPS** — o script já força TLS 1.2; se ainda falhar, atualize
  o PowerShell ou o .NET da máquina.
- **Nenhuma peça coletada** — rode num prompt com permissão de WMI; máquinas virtuais
  muito enxutas podem não expor todos os componentes.
