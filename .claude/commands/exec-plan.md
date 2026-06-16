Invoque o agente **`executar-plano`** passando o nome do plano: $ARGUMENTS

O agente irá ler `.claude/plans/$ARGUMENTS.md`, reler o código atual citado no plano, delegar a escrita de testes ao agente `criar-testes`, validar os testes via agente `conferir-testes`, implementar a solução e gerar a migração `migration/version-XX.sql` se necessária. Você nunca executa testes nem migrações — apenas avisa o usuário ao final para rodar `cd server && npm test` e `cd client && npm test` manualmente.
