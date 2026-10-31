# Proposal

## Why

A experiência atual do Bárbara já possui partes de agenda, histórico, evolução e recompensas, mas elas estão fragmentadas, têm contratos inconsistentes entre front e back e ainda não oferecem ao aluno e ao personal uma visão confiável da jornada de treino. A mudança consolida esses fluxos, simplifica o uso do aplicativo e estabelece requisitos de segurança, uniformidade e performance antes de ampliar a base de usuários.

## What Changes

- Exibir a oferta de instalação da PWA no máximo uma vez por usuário autenticado em cada navegador/dispositivo, sem confundir esse controle com o aviso de atualização do aplicativo.
- Dar ao personal uma visão do histórico do aluno com alternância entre tabela e calendário, linha expansível para os detalhes do treino e acesso à evolução de peso e medidas.
- Corrigir e transformar Gifts em uma rotina de gamificação completa: regras, progresso automático por eventos de treino/medição, conquistas, aprovação e entrega de prêmios com estados coerentes para aluno e personal.
- Mostrar ao aluno a organização semanal dos treinos, incluindo descanso, detalhes do treino, estado da sessão e ação segura para iniciar ou retomar o treino do dia.
- Gerar usernames únicos a partir do nome no servidor, resolver colisões de forma determinística e permitir login tanto por username quanto por e-mail, mantendo compatibilidade com o contrato atual durante a transição.
- Uniformizar telefone, CPF/CNPJ, endereço e datas nos fluxos de criação/edição de aluno e personal; adaptar os componentes de endereço, navegação por abas e seleção de datas fornecidos pelo CristhERP ao design system do Bárbara.
- Simplificar a tela de configurações/perfil do aluno, separando dados pessoais, endereço, segurança e sessão por navegação curta e responsiva.
- Estabelecer requisitos transversais de autorização por vínculo personal-aluno, proteção de dados pessoais, estados de loading/erro/vazio, acessibilidade, responsividade, cache e invalidação de dados, redução de waterfalls/re-renderizações e orçamento de bundle.
- Corrigir a dívida de qualidade diretamente tocada pela mudança, incluindo contratos TypeScript sem `any`, dependências corretas de hooks e testes de integração dos fluxos críticos.

## Capabilities

### New Capabilities

- `pwa-install-preferences`: controla quando a oferta de instalação pode ser mostrada e persiste a decisão por usuário e navegador/dispositivo.
- `identity-and-profile`: define usernames únicos gerados automaticamente, login por username ou e-mail e gerenciamento seguro de telefone, documento, endereço e datas de perfil.
- `weekly-workout-planning`: apresenta ao aluno e ao personal a programação semanal de treinos e os estados de execução de cada dia.
- `workout-history`: oferece histórico paginado em tabela ou calendário, com filtros e expansão dos detalhes de cada sessão para aluno e personal autorizado.
- `student-progress-tracking`: permite acompanhar peso e demais medidas ao longo do tempo, com visualização do aluno e do personal vinculado.
- `rewards-gamification`: mantém regras, progresso, conquistas e entrega de gifts em um fluxo automático e consistente.
- `frontend-experience-quality`: define requisitos comuns de design, acessibilidade, segurança de interface, tratamento de estados e performance para os fluxos alterados.

### Modified Capabilities

- Nenhuma. O projeto ainda não possui especificações principais registradas no OpenSpec.

## Impact

- **Frontend (`barbaraFront`)**: rotas e telas de aluno/personal, serviços e tipos de autenticação, gifts, treinos, histórico e evolução; novos componentes compartilhados de formulário, abas, tabela expansível e calendário; React Query e divisão de bundles.
- **Backend (`barbaraBackend`)**: autenticação, usuários, alunos, personals, sessões, histórico, medidas, gifts e recompensas; DTOs, autorização, testes e documentação OpenAPI.
- **Banco de dados**: migrations Prisma para e-mail canônico e único, CPF/CNPJ, endereço, preferências necessárias e rastreabilidade da gamificação; backfill e tratamento explícito de colisões antes de criar constraints.
- **Integrações**: consulta de CEP adaptada do CristhERP, sem copiar imports ou dependências incompatíveis.
- **Compatibilidade**: o endpoint de login aceitará o campo legado `username` durante a migração; dados existentes serão preservados e normalizados por migration/backfill.
