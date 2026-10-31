# Design

## Context

O `barbaraFront` é uma SPA React 19/Vite com rotas lazy, Tailwind 4, componentes Radix, React Query parcialmente adotado e PWA via `vite-plugin-pwa`. O `barbaraBackend` é uma API NestJS/Prisma. A motivação está em [proposal.md](./proposal.md).

Achados que condicionam o desenho:

- A agenda semanal e o histórico do personal já estão parcialmente implementados em arquivos ainda não commitados; a implementação deve evoluí-los, não recriá-los.
- O prompt de instalação guarda o descarte apenas em estado React e volta após remontagem.
- O histórico do aluno carrega até 50 sessões para montar o calendário local; o personal tem somente uma lista agrupada, sem tabela/calendário nem detalhe expansível.
- Gifts, progresso e conquistas são buscados em paralelo, mas um erro derruba a tela inteira. O front reduz estados de conquista para `PENDING | ACKNOWLEDGED`, enquanto o backend persiste oito estados. Só quatro dos oito tipos de regra possuem cálculo e a avaliação depende de comando manual do personal.
- `User.username` já é único no banco, porém a busca é sensível ao valor persistido; e-mail vive nos perfis e não pode ser usado de forma global no login.
- O service worker usa cache `NetworkFirst` para respostas autenticadas da API. Isso pode manter dados privados entre sessões no mesmo navegador e deve ser removido.
- O build atual passa, mas o lint tem 17 erros e 9 avisos. O build produz aproximadamente 499 kB no chunk principal, 393 kB no vendor de gráficos e 119 kB no vendor de motion antes de gzip.
- Os componentes de referência do CristhERP dependem de aliases, tipos e primitivos próprios. A estrutura e o comportamento serão portados, com imports, contratos e estilo adaptados ao Bárbara.

## Goals / Non-Goals

**Goals:**

- Definir contratos únicos entre front, API e banco antes de refatorar as telas.
- Entregar os fluxos por fatias verticais testáveis, preservando o trabalho local existente.
- Fazer autorização e unicidade valerem no servidor e no banco, não apenas na interface.
- Evitar cache privado persistente no service worker e reduzir carregamento desnecessário por rota.
- Reutilizar componentes compartilhados sem tornar as telas visualmente genéricas.

**Non-Goals:**

- Criar rede social, ranking público, moedas virtuais, loja ou pagamento de gifts.
- Substituir todo o design system, trocar a família tipográfica global ou redesenhar áreas fora dos fluxos citados.
- Inferir relação causal entre peso e frequência de treino; a interface apenas apresenta os dados no mesmo período.
- Oferecer múltiplos endereços por usuário nesta entrega; o modelo começa com um endereço principal.
- Fazer sincronização offline de mutações protegidas. A PWA continua dependente da API para dados de conta.

## Decisions

### 1. Implementação em fatias verticais e contrato primeiro

Cada fatia será implementada na ordem banco/API → tipos/serviços do front → tela → testes. Agenda/histórico, evolução, identidade/perfil, gamificação e PWA podem ser liberados atrás de flags independentes quando a mudança de banco exigir implantação em duas etapas.

**Racional:** reduz o período em que front e back discordam e permite validar cada fluxo. Um grande merge apenas no fim foi rejeitado porque o estado atual já contém implementações parciais e contratos divergentes.

### 2. Identidade canônica no `User`

Adicionar ao usuário campos normalizados de identidade:

- `username` para exibição e `usernameNormalized` único para busca sem distinção de caixa;
- `email` e `emailNormalized` único e opcional no nível de `User`;
- `documentType`, `documentHash`, `documentEncrypted` e `documentLast4` opcionais;
- relação um-para-um com `UserAddress` para o endereço principal.

Durante a migração, respostas de perfil continuam expondo e-mail/telefone nos formatos esperados pelo front. O e-mail passa a ter fonte de verdade em `User`; telefone pode permanecer no perfil nesta entrega para minimizar migração, mas usa normalização comum. CPF/CNPJ é validado antes de persistir, cifrado com algoritmo autenticado e acompanhado de hash com chave para unicidade; logs e DTOs de listagem nunca recebem o valor integral.

**Racional:** e-mail de login e documento precisam de unicidade entre papéis. Manter e-mail apenas em `StudentProfile` e `PersonalProfile` exigiria consultas cruzadas sem constraint global. Guardar documento em texto puro foi rejeitado por exposição desnecessária; cifrar sem hash impediria unicidade eficiente.

### 3. Username gerado no backend sem nova biblioteca obrigatória

Uma função pequena e testada fará normalização Unicode NFKD, remoção de diacríticos, minúsculas, substituição de separadores e limite de tamanho. O serviço tenta o slug base e depois sufixos numéricos; a constraint única é a autoridade final e conflitos `P2002` são repetidos com limite.

Bibliotecas como `slugify` existem, mas não são necessárias para este conjunto pequeno de regras. A alternativa foi rejeitada para não adicionar dependência apenas por transliteração. Se requisitos futuros incluírem alfabetos não latinos complexos, a decisão deve ser revista.

O formulário envia `name` e permite preview do username; edição manual é opcional conforme papel. Alterar o nome não renomeia a conta automaticamente.

### 4. Login por identificador com compatibilidade

O DTO novo aceita `identifier`; temporariamente também aceita o campo legado `username`. O backend normaliza o valor, consulta `usernameNormalized` ou `emailNormalized`, mantém erro genérico e aplica o rate limit existente. A resposta mantém o formato atual.

Produção deve falhar ao iniciar sem `JWT_SECRET` válido; o fallback conhecido atual é removido. CORS não usará `*` com credenciais e será validado por ambiente.

**Alternativa considerada:** consultar e-mail diretamente nos dois perfis. Foi rejeitada por ambiguidade, ausência de unicidade global e consulta mais cara.

### 5. Componentes compartilhados portados do CristhERP

Criar no Bárbara uma camada `components/common` com:

- `RHFAddressForm`: manter a organização de CEP, complemento, rua, número, bairro, cidade, UF, país e IBGE do componente fornecido; adaptar `Field`, `Input`, `react-hook-form`, serviço de CEP e tipos locais. A consulta de CEP preserva dados digitados quando a resposta vier incompleta.
- `TabNavigation`: remover dependência do tipo de navegação do ERP, aceitar itens locais tipados e ser a única navegação usada para seções de perfil, detalhe do aluno, histórico e evolução.
- `DatePicker`: aceitar `string | Date`, produzir `yyyy-MM-dd`, corrigir data civil com meio-dia local, suportar alinhamento, `disableFutureDates`, intervalo permitido, `id` e estado inválido.
- `ExpandedTableRow`: extrair o padrão usado em `SalesTable`, com célula de largura total, região associada ao botão, animação reduzível e conteúdo responsivo.

Não será feito copy/paste literal de imports do CristhERP. A paridade exigida é de comportamento e composição visual; os primitivos e tokens serão os do Bárbara.

### 6. Direção visual: diário de treino, não grade de SaaS

O elemento memorável será uma faixa semanal contínua que se comporta como um diário de treino: sete marcos, estados compactos e detalhe progressivo. Histórico, evolução e gifts usam a mesma linguagem de linha do tempo e registro, reduzindo a coleção atual de cartões independentes.

**Tokens preservados e consolidados:**

- `Noite de treino` `#18184C`: texto e números de maior hierarquia;
- `Violeta Bárbara` `#7660F9`: ação e estado selecionado;
- `Névoa azul` `#F5F8FF`: base das superfícies;
- `Branco de ficha` `#FFFFFF`: tabela, formulário e detalhe expandido;
- `Verde conquista` `#059669`: conclusão/entrega;
- `Âmbar esforço` `#B45309`: parcial, atenção e progresso pendente.

**Tipografia:** manter Plus Jakarta Sans nos títulos e números-chave e Inter no corpo para não ampliar o bundle nem descaracterizar o produto nesta entrega. Títulos ficam em sentence case; labels não usam caixa alta decorativa. Valores de carga, peso e duração usam algarismos tabulares quando disponíveis.

**Layout e alinhamento:** conteúdo e ações permanecem alinhados à esquerda; números comparáveis alinham à direita em tabelas. No mobile, tabela vira lista estruturada somente abaixo do breakpoint em que as colunas deixam de ser legíveis, mantendo a ação de olho.

```text
ALUNO / HOJE
┌──────────────────────────────────────┐
│ Sua semana  ‹  19–25 out  ›          │
│  S    T    Q    Q    S    S    D     │
│  ●────○────●────○────●────○────○     │
│ hoje: Treino A · Peito e tríceps      │
│ [ver exercícios]       [iniciar]      │
└──────────────────────────────────────┘
```

```text
PERSONAL / HISTÓRICO DO ALUNO
┌ Tabela | Calendário ┐  [período] [estado]
├──────────┬──────────────┬────────┬───────┤
│ 22/10    │ Treino A     │ 48 min │  👁   │
├──────────┴──────────────┴────────┴───────┤
│ Exercício        séries  carga  RPE      │
│ Supino reto      4×10    32 kg  8        │
└──────────────────────────────────────────┘
```

```text
EVOLUÇÃO
┌ Peso | Medidas ┐  [últimos 90 dias]
│ 72,4 kg  ↓ 1,8 kg                         │
│       linha de peso + marcas de treino    │
│ histórico exato em lista/tabela acessível │
└───────────────────────────────────────────┘
```

**Revisão contra o brief:** a primeira direção poderia cair na grade genérica de cards e em excesso de pills. Ela foi revisada para uma superfície contínua de “ficha/diário”, na qual linhas, marcadores e expansão codificam semana, sessão e progresso. A ênfase especial fica reservada a conquista recém-desbloqueada; o restante permanece contido.

### 7. Histórico com endpoints de resumo e detalhe

Estender a consulta de sessões com `studentId`, `from`, `to`, `status`, `page`, `limit` e ordenação validada. Criar uma resposta mensal resumida para calendário, sem exercícios/séries. O detalhe da sessão é carregado sob demanda ao expandir a linha pelo botão de olho.

O servidor aplica vínculo personal-aluno em lista, calendário e detalhe. A tabela mantém apenas um `expandedSessionId`; detalhes usam cache por sessão. Selecionar um dia no calendário usa o mesmo filtro de intervalo, sem carregar todo o histórico.

**Alternativa considerada:** carregar até 50 sessões e agrupar tudo no cliente, como hoje. Rejeitada por paginação incorreta, calendário incompleto e custo crescente.

### 8. Leitura agregada de evolução

Adicionar uma consulta de progresso por aluno e período que retorna medições ordenadas e contagens de sessões concluídas/parciais agrupadas por dia ou semana. Ela não duplica os detalhes de sessão. A mesma rota autoriza o próprio aluno ou personal vinculado.

O gráfico e a tabela acessível usam o mesmo dataset. Pontos ausentes são `null`, nunca zero. Criação/edição de medição invalida apenas a chave do aluno/período afetado.

### 9. Gamificação orientada a eventos duráveis

Unificar os DTOs do front com o enum real do backend. `acknowledgedAt` é um atributo da experiência do aluno, não substitui o estado de aprovação/entrega.

Ao concluir/parcializar sessão ou salvar medição, a mesma transação cria um registro de avaliação pendente com chave idempotente. Um processador executa jobs pendentes, recalcula apenas regras afetadas, registra tentativas/erro e pode ser reexecutado. Adicionar `cycleKey` à conquista e uma constraint única por aluno, regra e ciclo evita duplicação.

O processador pode iniciar no próprio backend nesta fase, com busca periódica e lock no banco. A tabela de jobs permite migrá-lo para worker separado depois sem mudar o contrato. A execução síncrona pura foi rejeitada porque uma falha de gamificação não deve desfazer treino; avaliação apenas na leitura foi rejeitada por efeitos colaterais imprevisíveis.

Regras recorrentes recebem ciclo explícito (por exemplo, semana/mês). Tipos ainda não implementados ficam indisponíveis para ativação até terem validador e calculador. Transições de estado são centralizadas em uma máquina de estados testada.

### 10. Estado do front com React Query

Migrar os fluxos tocados que ainda usam `useEffect + useState` para queries/mutations com chaves que incluam `userId`, `studentId`, intervalo, página e filtros. Consultas independentes iniciam em paralelo; falhas parciais permanecem isoladas, especialmente em Gifts.

No logout, cancelar requisições e limpar o `QueryClient` antes de redirecionar. Evitar `useMemo`, `useCallback` e `React.memo` indiscriminados; aplicá-los apenas quando identidade estável ou medição justificar. Isso segue os critérios da skill oficial de boas práticas React descoberta para o trabalho.

### 11. PWA por usuário e sem cache persistente de API privada

Quando `beforeinstallprompt` estiver disponível e houver usuário, verificar a chave versionada `barbara:pwa-install-seen:<userId>:v1`. Ao renderizar a oferta pela primeira vez, gravar a chave; aceitar ou dispensar encerra o fluxo. O aviso de atualização conserva estado separado.

Remover o runtime cache genérico de `/api` do service worker. Endpoints autenticados usam rede e o cache em memória controlado pelo React Query. Apenas assets e endpoints explicitamente públicos e não personalizados podem ter cache persistente.

Guardar a preferência apenas no navegador é intencional: capacidade de instalação pertence ao dispositivo. Persistir na conta impediria a oferta em um novo aparelho.

### 12. Performance e barreiras automatizadas

- Manter rotas lazy e adicionar lazy loading interno para evolução, gráficos, calendário completo e painéis de gamificação não ativos.
- Evitar importar Recharts em componentes carregados na aba inicial do detalhe do aluno.
- Revisar `framer-motion`; substituir usos triviais por CSS ou importar apenas onde necessário.
- Buscar calendário por mês, tabela por página e detalhe por expansão.
- Adotar orçamento inicial: JS inicial total ≤ 220 kB gzip, cada rota sem gráfico ≤ 50 kB gzip, vendor de gráfico ≤ 110 kB gzip e carregado somente em telas que o usam. Registrar baseline e ajustar apenas mediante decisão documentada.
- CI executa build com relatório de chunks, lint, testes do front e testes do backend. Os 17 erros/9 avisos atuais nos arquivos tocados entram na correção; lint global deve chegar a zero erro antes da conclusão.

### 13. Segurança por padrão

- Reutilizar uma política de autorização por recurso para verificar titularidade/vínculo em gifts, conquistas, histórico, agenda, medidas e fotos.
- Validar UUID/CUID, datas, paginação, enums, tamanhos e transições no DTO; `whitelist` permanece habilitado.
- Não montar filtros Prisma diretamente a partir de nomes de ordenação não validados.
- Não expor CPF/CNPJ, endereço completo ou notas sensíveis em listagens, logs, toasts ou caches persistentes.
- Manter mensagem genérica no login e cobertura de rate limit.
- Corrigir o uso de `any` no bootstrap do Helmet e nos formulários tocados, além das dependências de hooks reportadas pelo lint.

## Risks / Trade-offs

- **[Migração encontra e-mails ou documentos duplicados]** → executar auditoria e relatório antes das constraints; manter campos opcionais até conflitos serem resolvidos.
- **[Geração concorrente de username colide]** → constraint única em valor normalizado, retry limitado e teste de concorrência.
- **[Cifra de documento perde a chave]** → segredo obrigatório, versionamento de chave e runbook de rotação; rollback nunca remove a coluna legada antes de validação.
- **[Processador de gamificação fica parado]** → jobs duráveis, métricas de pendentes/falhas, retry com backoff e comando administrativo idempotente.
- **[Regra recorrente concede prêmio duas vezes]** → `cycleKey` e constraint única no banco.
- **[Calendário e tabela divergem por fuso]** → datas civis usam `yyyy-MM-dd` no contrato e sessões usam instantes UTC convertidos no fuso configurado.
- **[Port do CristhERP herda acoplamentos]** → copiar estrutura funcional, substituir imports/tipos e cobrir o contrato público com testes.
- **[Lazy loading cria flashes ou waterfalls]** → prefetch da próxima aba por intenção e skeleton no limite correto, sem pré-carregar bibliotecas pesadas na entrada.
- **[Mudanças locais do usuário entram em conflito]** → editar incrementalmente, reler cada arquivo imediatamente antes da alteração e evitar reformatar áreas não relacionadas.

## Migration Plan

1. Registrar baseline de banco, contratos, lint, testes e bundles; fazer backup e gerar relatório de e-mails/documentos conflitantes.
2. Implantar migration aditiva: colunas normalizadas, dados de documento/endereço, `cycleKey` e jobs de avaliação, todas inicialmente compatíveis com dados nulos.
3. Fazer backfill transacional em lotes para usernames/e-mails normalizados e criar índices únicos somente após resolver conflitos.
4. Implantar backend compatível com clientes antigos: login aceita `username` ou `identifier`, respostas mantêm campos legados e novas rotas ficam disponíveis.
5. Ativar processador de gamificação em modo de observação/reprocessamento e reconciliar progresso existente antes de expor novos estados.
6. Implantar frontend por fatias: segurança/cache e PWA; componentes compartilhados/perfil; agenda; histórico/evolução; gamificação.
7. Remover leitura de campos legados apenas após telemetria confirmar que todos os clientes usam o contrato novo; a remoção requer mudança posterior explícita.

**Rollback:** desativar flags do frontend e o processador, voltar ao backend compatível anterior e manter tabelas/colunas aditivas. Não apagar dados ou reverter constraints automaticamente; restauração destrutiva exige backup validado e janela própria.
