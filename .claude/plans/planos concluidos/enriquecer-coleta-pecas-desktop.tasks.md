# Tracking de execução — enriquecer-coleta-pecas-desktop

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-18 08:18

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: coluna de especificações da peça, coberta por testes | Levanta o fluxo atual da coleta de desktop (endpoint + validação por peça); escreve antes os testes do validador (especificações opcionais, objeto inválido, teto de tamanho, índice da peça no erro) e do controller (persistir o objeto e gravar nulo quando ausente); adiciona a coluna JSON no modelo, a migração de banco, a validação e a gravação/retorno no controller. | 08:18 | 08:21 | 3 min |
| 2 | Frontend: exibir as especificações da peça | Cria a função pura que transforma o objeto de especificações em lista de rótulo/valor (com testes de caso feliz e bordas); exibe essas linhas no detalhe do desktop e na tabela de peças, no tema escuro do sistema. | 08:21 | 08:22 | 1 min |
| 3 | Coletor: capturar as especificações e corrigir o disco | Ajusta o script de coleta para ler capacidade/velocidade/tipo da memória, capacidade/mídia/conexão do armazenamento (trocando a fonte para corrigir o modelo vazio e o ruído de leitor de cartão), núcleos/threads/clock do processador, memória da placa de vídeo e velocidade da placa de rede; envia tudo no novo campo e atualiza o README. | 08:22 | 08:24 | 2 min |
| 4 | Documentação de contexto | Atualiza o doc de inventário com a nova coluna, o campo opcional no contrato da coleta e o atributo extra retornado no item completo. | 08:24 | 08:24 | <1 min |
| 5 | Frontend: cadastro manual das especificações | Estende o helper puro com os campos por tipo (`CAMPOS_ESPECIFICACAO`/`construirEspecificacoes`); o modal de cadastro mostra campos dinâmicos por tipo; `postPeca` (service + controller) passa a aceitar/validar/gravar `especificacoes`, reusando o validador compartilhado. | 08:30 | 08:45 | 15 min |
| 6 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`, aplicar a migração (`npm run db:migrate`), rodar o coletor com `-DryRun` conferindo o JSON com as especificações, e checar a exibição no detalhe do desktop e na tabela de peças + o cadastro manual com campos por tipo. | 08:52 | concluído (entregue ao usuário para rodar testes/migração) | — |

---

## Resumo

Implementação concluída. 6 etapas (a etapa 5 foi adicionada no meio do caminho a pedido
do usuário: além de exibir, poder **cadastrar** as specs manualmente). Validação manual
(testes/migração) fica com o usuário — o agente não roda testes nem migrações.

## Resumo do que foi implementado

**O quê / por quê:** as peças passaram a ter especificações técnicas (`peca_especificacoes`,
JSON rótulo→valor) — capacidade/velocidade/DDR da RAM, mídia/conexão do disco,
núcleos/threads/clock da CPU, memória da placa de vídeo, velocidade da rede. Antes a RAM
vinha sem esses dados e o **armazenamento vinha com marca/modelo vazios** (bug: a marca
pseudo do Windows zerava o modelo, e o `Win32_DiskDrive` ainda listava leitor de cartão).

**Como (ponta a ponta):**
- **Banco/model:** coluna `peca_especificacoes JSON NULL` (migração `0005`).
- **Backend:** `validarEspecificacoes` (validador puro compartilhado — objeto simples +
  teto de 2000 chars); `coletarDesktop` e `postPeca` gravam o objeto (null quando vazio);
  `getItemFull` e as listagens de peça retornam a coluna.
- **Coletor (`coletar-desktop.ps1`):** specs por tipo; armazenamento via `Get-PhysicalDisk`
  (fallback `Win32_DiskDrive`) com derivação de marca pelo nome do disco — corrige o modelo
  vazio e o ruído de leitor de cartão; quando a marca não é derivável, o nome vai em
  `especificacoes.descricao`.
- **Frontend:** `especificacoes.js` (puro) com `ROTULOS`, `CAMPOS_ESPECIFICACAO` (campos por
  tipo), `construirEspecificacoes` e `formatarEspecificacoesPeca`; cadastro manual com campos
  dinâmicos por tipo (`ModalCadastraPecas`); exibição **expansível** em `TabelaPecas` (ao
  selecionar) e `CardItem` (disclosure no desktop). Mesma forma p/ peça coletada e manual.
- **Docs:** `inventario.md` e README do coletor.

**Testes que cobrem:** `validarEspecificacoes`/`validarPecaColetada` e `coletarDesktop`
(item.controller.spec); `postPeca` (pecas.controller.spec); `formatarEspecificacoesPeca`/
`construirEspecificacoes` (especificacoesPeca.test).

**Commits:** `ad0bbd1` (test) · `50c9ecf` (backend) · `2c88bcb` (migração 0005) ·
`ec53bec` (frontend) · `7e95970` (coletor) · `f9b540f` (docs).
