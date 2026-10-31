# Spec Delta

## Purpose

Transformar gifts e conquistas em um ciclo de gamificação previsível, automático e motivador, mantendo regras e estados coerentes entre aluno, personal, API e banco.

## ADDED Requirements

### Requirement: Contrato único de gamificação
API e interfaces SHALL usar um conjunto documentado de estados para progresso e conquista, preservando os significados de em progresso, alcançada, aguardando aprovação, aprovada, rejeitada, entregue, cancelada e reconhecida pelo aluno.

#### Scenario: Conquista aguardando aprovação
- **WHEN** uma regra com aprovação obrigatória atinge a meta
- **THEN** aluno e personal recebem o mesmo estado de aguardando aprovação e ações compatíveis com seus papéis

#### Scenario: Estado desconhecido
- **WHEN** o cliente recebe um estado não suportado
- **THEN** a tela não quebra, mostra um estado neutro e registra diagnóstico sem expor dados pessoais

### Requirement: Avaliação automática por eventos
O sistema SHALL recalcular regras afetadas após conclusão ou parcialização de treino e após criação ou alteração de medição, sem depender de uma ação manual do personal.

#### Scenario: Treino concluído incrementa meta
- **WHEN** uma sessão muda para concluída e afeta uma regra ativa
- **THEN** o progresso correspondente é recalculado e uma conquista é criada se a meta for atingida

#### Scenario: Medição atualiza regra corporal
- **WHEN** uma medição relevante é salva
- **THEN** regras corporais ativas daquele aluno são reavaliadas

#### Scenario: Falha na avaliação
- **WHEN** a avaliação de recompensa falha após o treino ser salvo
- **THEN** o treino permanece concluído, a falha fica rastreável e a avaliação pode ser repetida com segurança

### Requirement: Processamento idempotente
Repetir o mesmo evento ou recalcular o mesmo progresso MUST produzir o mesmo valor e MUST NOT criar conquistas duplicadas para o mesmo ciclo elegível da regra.

#### Scenario: Reenvio da conclusão
- **WHEN** a conclusão da mesma sessão é processada mais de uma vez
- **THEN** o sistema mantém uma única evolução correspondente e não duplica conquista

#### Scenario: Regra recorrente
- **WHEN** uma regra periódica entra em um novo ciclo elegível
- **THEN** o sistema pode criar uma nova conquista vinculada ao novo ciclo sem alterar conquistas anteriores

### Requirement: Tipos de regra implementados de ponta a ponta
O sistema SHALL impedir ativação de tipos sem cálculo implementado e SHALL validar parâmetros necessários para total de treinos, frequência, sequência, aumento de carga, exercício específico, treino específico, medida corporal e regra personalizada suportada.

#### Scenario: Regra sem parâmetros obrigatórios
- **WHEN** o personal tenta ativar uma regra que exige exercício, período ou meta e o parâmetro está ausente
- **THEN** o sistema rejeita a ativação e informa os campos necessários

#### Scenario: Tipo ainda não suportado
- **WHEN** um tipo não possui cálculo executável no servidor
- **THEN** ele não aparece como opção ativa ou é rejeitado explicitamente, em vez de permanecer sempre com progresso zero

### Requirement: Jornada do aluno em formato de jogo
A área de Gifts SHALL listar desafios ativos, progresso, conquistas desbloqueadas e prêmios, dando destaque ao próximo objetivo e usando linguagem consistente de jogo sem esconder condições ou valores.

#### Scenario: Desafio em andamento
- **WHEN** o aluno possui regra ativa ainda não concluída
- **THEN** a tela mostra objetivo, progresso numérico, percentual válido e o que falta para concluir

#### Scenario: Meta sem alvo numérico
- **WHEN** uma regra válida não possui alvo numérico aplicável
- **THEN** a tela usa uma representação apropriada e não calcula percentual inválido

#### Scenario: Nova conquista
- **WHEN** uma conquista ainda não foi reconhecida pelo aluno
- **THEN** a tela a destaca e permite reconhecê-la sem mudar o estado de aprovação ou entrega

### Requirement: Aprovação e entrega de prêmio
O personal SHALL aprovar, rejeitar ou entregar conquistas somente de alunos vinculados e conforme transições válidas; cada transição SHALL registrar ator, data e observação aplicável.

#### Scenario: Aprovação válida
- **WHEN** o personal aprova uma conquista aguardando aprovação
- **THEN** o estado passa para aprovada e registra responsável e data

#### Scenario: Entrega válida
- **WHEN** o personal marca como entregue uma conquista aprovada com gift associado
- **THEN** o sistema registra a entrega uma única vez e o aluno vê o prêmio como entregue

#### Scenario: Transição inválida
- **WHEN** alguém tenta entregar conquista rejeitada ou aprovar conquista já cancelada
- **THEN** o sistema rejeita a transição sem modificar o histórico

### Requirement: Listagem resiliente para o aluno
A tela de Gifts SHALL tratar carregamento, vazio, falha parcial e repetição de tentativa separadamente para desafios, conquistas e prêmios.

#### Scenario: Falha em uma fonte
- **WHEN** prêmios carregam mas o progresso falha
- **THEN** a tela mantém os prêmios visíveis e oferece tentar novamente apenas para a parte com erro

#### Scenario: Nenhum conteúdo configurado
- **WHEN** o personal ainda não configurou regras nem gifts
- **THEN** o aluno vê uma mensagem orientativa e a página permanece utilizável

### Requirement: Autorização da gamificação
O aluno MUST acessar apenas a própria gamificação; o personal MUST acessar e gerenciar apenas alunos vinculados e regras próprias; a autorização MUST ocorrer no servidor em todas as consultas e transições.

#### Scenario: Identificador de outro aluno
- **WHEN** um aluno altera o identificador da requisição para outro perfil
- **THEN** o servidor nega o acesso sem retornar progresso, conquista ou gift

#### Scenario: Regra de outro personal
- **WHEN** um personal tenta alterar regra pertencente a outro personal
- **THEN** o servidor nega a operação
