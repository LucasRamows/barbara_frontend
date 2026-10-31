# Tasks

## 1. Baseline, auditoria e migrations aditivas

- [x] 1.1 Registrar o baseline dos dois repositórios (status Git, testes, lint e relatório de chunks) sem sobrescrever mudanças locais; verificar que o relatório reproduz o build atual do front e os 21 testes atuais do backend.
- [x] 1.2 Criar no backend uma auditoria somente leitura para usernames/e-mails canônicos conflitantes e documentos legados; verificar com fixtures que duplicidades e valores inválidos são listados sem modificar o banco.
- [x] 1.3 Adicionar ao schema Prisma os campos normalizados de usuário, identidade protegida, endereço principal, ciclo de conquista e jobs de avaliação como mudanças inicialmente aditivas; verificar `prisma validate`, geração do client e revisão do SQL para ausência de remoções destrutivas.
- [x] 1.4 Implementar backfill em lotes para usernames/e-mails normalizados e aplicar índices únicos somente após a auditoria; verificar em banco de teste casos normais, duplicados, rollback lógico e reexecução idempotente.

## 2. Identidade, autenticação e segurança do backend

- [x] 2.1 Implementar normalizador e gerador de username no backend, com retry limitado para conflito `P2002`; verificar testes unitários de acentos, nomes vazios, tamanho, caixa, colisão sequencial e criação concorrente.
- [x] 2.2 Usar a geração automática nas criações de aluno e personal, mantendo username explícito válido como opção autorizada e sem renomear após edição do nome; verificar testes dos serviços e respostas com o username persistido.
- [x] 2.3 Migrar e-mail para a identidade de usuário e atualizar create/update/me com compatibilidade de resposta; verificar testes de unicidade global entre papéis, normalização e conflito sem alteração parcial.
- [x] 2.4 Alterar o login para aceitar `identifier` e o campo legado `username`, consultando username ou e-mail normalizado e preservando erro genérico; verificar testes de login pelos dois identificadores, enumeração, conta inativa e contrato legado.
- [x] 2.5 Implementar validação, hash, cifra autenticada e mascaramento de CPF/CNPJ, além do CRUD autorizado de endereço principal e telefone normalizado; verificar testes de dígitos verificadores, unicidade, rotação/versionamento de chave, listagem minimizada e personal não vinculado.
- [x] 2.6 Atualizar DTOs e OpenAPI de autenticação, usuário, aluno e personal com limites, exemplos e respostas de conflito; verificar que a exportação OpenAPI reflete o contrato e que `ValidationPipe` rejeita campos e datas inválidos.
- [x] 2.7 Remover o segredo JWT padrão, validar CORS por ambiente e tipar a inicialização do Helmet sem `any`; verificar testes/configuração de startup que falham com segredo ausente em produção e aceitam somente origens configuradas.

## 3. Componentes comuns e perfis no frontend

- [x] 3.1 Portar `RHFAddressForm` do CristhERP para `components/common`, adaptando imports, tipos, campos necessários e consulta de CEP sem apagar valores existentes; verificar testes de preenchimento completo, resposta parcial, CEP inválido e falha de rede.
- [x] 3.2 Portar `TabNavigation` como componente local tipado, rolável e operável por teclado; verificar estados ativo/foco, badges opcionais e layout sem overflow em 320 px.
- [x] 3.3 Consolidar o `DatePicker` local com suporte a `string | Date`, data civil, alinhamento e bloqueio de futuras; verificar testes em fuso negativo/positivo e seleção de nascimento/medição sem mudança de dia.
- [x] 3.4 Criar máscaras/normalizadores e schemas compartilhados para telefone, CPF/CNPJ, e-mail e endereço; verificar testes unitários e paridade entre payload canônico enviado e valor formatado exibido.
- [x] 3.5 Atualizar tipos e serviços do front para o novo contrato de identidade e exibir preview/read-only do username gerado nos cadastros de aluno/personal; verificar criação por nome, conflito retornado pela API e login por e-mail/username.
- [x] 3.6 Refatorar configurações do aluno para `TabNavigation` com seções Dados pessoais, Endereço, Segurança e Sessão, uma ação principal por seção e estados independentes; verificar navegação móvel, salvamento parcial, mensagens por campo e logout.
- [x] 3.7 Aplicar os mesmos componentes a edição/criação de aluno e personal onde os campos existirem, sem reformatar telas fora do escopo; verificar testes dos formulários e uma revisão visual comparativa com os componentes de referência.

## 4. PWA, cache privado e isolamento de sessão

- [x] 4.1 Remover do service worker o cache persistente genérico de rotas autenticadas `/api`, mantendo apenas assets e recursos explicitamente públicos; verificar o service worker gerado e teste que respostas de perfil/histórico/gifts não entram no Cache Storage.
- [x] 4.2 Persistir a visualização do prompt em chave versionada por `userId` e navegador, marcando-a ao renderizar e mantendo o aviso de atualização separado; verificar aceitar, dispensar, remontar, trocar de conta e modo standalone.
- [x] 4.3 Cancelar requests e limpar o `QueryClient` no logout antes da troca de conta; verificar teste de integração no qual dados em cache da primeira conta nunca aparecem para a segunda.

## 5. Agenda semanal de treinos

- [x] 5.1 Revisar e completar os endpoints de agenda semanal para aluno e personal, incluindo sete dias, fuso/data civil, descanso e estados de sessão; verificar testes dos serviços para virada de semana, domingo, aluno sem plano e personal não vinculado.
- [x] 5.2 Tornar o início de sessão idempotente e bloquear sessões ativas conflitantes no servidor; verificar testes concorrentes que resultam em no máximo uma sessão e erro de domínio recuperável.
- [x] 5.3 Evoluir `StudentWeeklyAgenda` para a faixa contínua de diário de treino, com navegação semanal, detalhes progressivos e ações iniciar/retomar; verificar comportamento em mobile/desktop, teclado, estados vazio/erro/loading e atualização de cache.
- [x] 5.4 Alinhar `PersonalWeeklySchedule` ao mesmo significado de datas/estados e invalidar apenas as semanas afetadas após edição; verificar edição de aluno vinculado e reflexo no login do aluno.

## 6. Histórico em tabela e calendário

- [x] 6.1 Criar DTOs de filtro para sessões (`studentId`, intervalo, estado, página, limite e ordenação permitida) e aplicar filtros/paginação no servidor; verificar testes de totais, limites, intervalo inválido e autorização por papel.
- [x] 6.2 Criar resposta mensal resumida de calendário e garantir que o detalhe de sessão autorize titular/vínculo antes de carregar exercícios e séries; verificar testes de mês vazio, múltiplas sessões no dia e acesso negado sem enumeração.
- [x] 6.3 Extrair `ExpandedTableRow` do padrão do `SalesTable` e construir tabela de histórico com ação de olho, uma linha aberta por vez e detalhe lazy; verificar interação por mouse/teclado, `aria-expanded`, troca e fechamento da linha.
- [x] 6.4 Construir o calendário compartilhado de histórico com legenda de estados, navegação mensal e seleção de dia; verificar que cada mês gera uma consulta limitada e que dias com múltiplas sessões listam todas elas.
- [x] 6.5 Integrar `TabNavigation` Tabela/Calendário no histórico do aluno e na aba Histórico do detalhe do aluno para o personal, preservando filtros e preferência da visita; verificar testes dos dois papéis e paridade do conjunto filtrado.

## 7. Evolução de peso e medidas

- [x] 7.1 Adicionar consulta agregada de progresso por aluno/período com medições ordenadas e cadência de sessões concluídas/parciais; verificar testes de autorização, limites de intervalo, dados parciais, datas iguais e ausência de sessões.
- [x] 7.2 Validar limites plausíveis e data civil nos DTOs de medição, preservando responsável/origem em create/update; verificar testes de peso/medida inválidos, data futura e personal não vinculado.
- [x] 7.3 Criar hooks React Query com chaves por usuário, aluno e período e invalidação cirúrgica após mutação; verificar teste que criação de medição atualiza evolução sem apagar caches não relacionados.
- [x] 7.4 Implementar visão de evolução com Peso/Medidas, variação exata, tabela acessível e cadência de treinos sem alegar causalidade; verificar cenários com zero, um e vários pontos e campos ausentes tratados como `null`.
- [x] 7.5 Carregar gráficos somente ao abrir Evolução e integrar a mesma experiência ao aluno e ao personal vinculado; verificar no relatório de rede/bundle que Recharts não é baixado ao abrir Hoje ou Perfil do aluno.

## 8. Motor de gamificação no backend

- [x] 8.1 Unificar DTOs de regra, progresso e conquista com os enums persistidos, mantendo `acknowledgedAt` separado do estado; verificar testes de serialização e contrato OpenAPI para todos os estados.
- [x] 8.2 Implementar máquina de transições para alcançar, aguardar aprovação, aprovar, rejeitar, entregar e cancelar, com ator/data/notas; verificar testes de todas as transições válidas e rejeição sem mutação das inválidas.
- [x] 8.3 Criar jobs idempotentes na mesma transação de conclusão/parcialização de sessão e criação/edição de medição; verificar que falha de avaliação não desfaz o evento de origem e que reenvio não duplica job.
- [x] 8.4 Implementar processador com lock, retry/backoff e diagnóstico de falhas, além de comando seguro de reprocessamento; verificar testes com dois processadores concorrentes, falha temporária e reexecução.
- [x] 8.5 Implementar ou bloquear explicitamente cada tipo de regra conforme seus parâmetros, períodos e `cycleKey`; verificar testes de total, frequência, sequência, carga, exercício, treino, medida e rejeição de tipo customizado não executável.
- [x] 8.6 Reconciliar progresso/conquistas existentes e adicionar constraint única por aluno/regra/ciclo; verificar relatório antes/depois e execução repetida sem novos duplicados.
- [x] 8.7 Centralizar a autorização por recurso em regras, progresso, conquistas e gifts; verificar testes negativos para aluno alheio, personal não vinculado e regra de outro personal.

## 9. Experiência de Gifts para aluno e personal

- [x] 9.1 Atualizar tipos e serviços do front para o contrato real de gamificação e separar queries de gifts, desafios, progresso e conquistas; verificar teste de falha parcial em que seções bem-sucedidas permanecem visíveis.
- [x] 9.2 Redesenhar a tela do aluno como jornada de jogo com próximo objetivo, progresso válido, conquistas e prêmios entregues, reservando ênfase visual à conquista nova; verificar metas numéricas, meta sem alvo, vazio, loading, erro e estado desconhecido.
- [x] 9.3 Implementar reconhecimento pelo aluno sem alterar aprovação/entrega e atualizar o cache correspondente; verificar teste de mutação e persistência após recarregar.
- [x] 9.4 Atualizar a área do personal para criar regras válidas e executar apenas ações permitidas de aprovação/rejeição/entrega; verificar mensagens por transição, regra incompleta e aluno sem vínculo.
- [x] 9.5 Remover a dependência do comando manual como rotina principal, mantendo reprocessamento somente como suporte administrativo; verificar um fluxo integrado treino concluído → progresso → conquista → aprovação → entrega.

## 10. Performance, acessibilidade e integração

- [x] 10.1 Auditar imports e renderizações dos fluxos alterados segundo as boas práticas React da Vercel, eliminando waterfalls, imports pesados antecipados e memoização sem benefício; verificar React Profiler/rede e documentar antes/depois por rota.
- [x] 10.2 Adicionar verificação de orçamento de bundle (inicial ≤ 220 kB gzip, rota sem gráfico ≤ 50 kB gzip, gráficos ≤ 110 kB gzip e lazy) ao pipeline; verificar que o build atual produz relatório e uma fixture excedente falha a checagem.
- [x] 10.3 Corrigir erros de lint e dependências de hooks nos arquivos tocados, removendo `any` e modelando estados como uniões discriminadas; verificar `npm run lint` com zero erro e `npm run build` no front.
- [x] 10.4 Executar revisão responsiva e de acessibilidade dos fluxos em 320 px, tablet e desktop, incluindo teclado, foco, contraste e movimento reduzido; verificar checklist e testes automatizados sem violações críticas.
- [x] 10.5 Executar a suíte completa do backend, testes do frontend, testes de contrato e cenários E2E dos papéis aluno/personal; verificar que todos passam em ambiente limpo e que o resultado fica anexado à revisão da mudança.

## Workflow follow-up

- Após implementação e revisão, sincronizar as specs desta mudança com as specs principais.
- Arquivar a mudança somente depois de validar migrations, rollback e aceite dos fluxos em ambiente de homologação.
