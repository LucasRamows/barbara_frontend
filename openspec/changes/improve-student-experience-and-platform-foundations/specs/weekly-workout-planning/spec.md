# Spec Delta

## Purpose

Dar ao aluno uma leitura clara de como seus treinos estão distribuídos na semana e ao personal uma visão consistente da programação atribuída.

## ADDED Requirements

### Requirement: Agenda semanal completa do aluno
O sistema SHALL apresentar sete dias consecutivos da semana no fuso de referência do usuário, identificando treino programado, descanso e o dia atual.

#### Scenario: Semana com dias livres
- **WHEN** o aluno possui treinos apenas em parte da semana
- **THEN** a agenda mostra os sete dias e marca explicitamente os demais como descanso ou sem treino programado

#### Scenario: Mudança de semana
- **WHEN** o aluno navega para a semana anterior ou seguinte
- **THEN** o sistema carrega a programação e as sessões correspondentes ao novo intervalo

### Requirement: Detalhes do treino programado
Cada dia com treino SHALL permitir visualizar nome do plano, objetivo, exercícios, séries, repetições e carga prescrita disponível sem iniciar uma sessão.

#### Scenario: Expansão de um dia programado
- **WHEN** o aluno expande um dia que contém treino
- **THEN** o sistema mostra os detalhes prescritos daquele dia e preserva os demais dias da semana

#### Scenario: Plano alterado pelo personal
- **WHEN** o personal altera uma programação futura e o aluno recarrega ou revisita a agenda
- **THEN** o aluno vê a versão atualizada sem dados obsoletos de cache

### Requirement: Estado de execução por dia
A agenda SHALL distinguir sessão não iniciada, em andamento, concluída, parcial e cancelada para cada dia, sem inferir conclusão apenas pela existência de programação.

#### Scenario: Sessão concluída
- **WHEN** existe sessão concluída vinculada ao treino e à data
- **THEN** o dia mostra o estado concluído e não oferece iniciar uma sessão duplicada

#### Scenario: Sessão em andamento
- **WHEN** o aluno possui uma sessão ativa
- **THEN** a agenda oferece retomar essa sessão e bloqueia o início concorrente de outra sessão incompatível

### Requirement: Início seguro do treino
O sistema SHALL permitir iniciar o treino aplicável ao dia somente quando houver plano válido e SHALL proteger contra duplo clique, repetição de requisição e sessão ativa conflitante.

#### Scenario: Início bem-sucedido
- **WHEN** o aluno inicia o treino de hoje e não existe sessão ativa conflitante
- **THEN** o sistema cria no máximo uma sessão e navega para sua execução

#### Scenario: Dia sem exercícios
- **WHEN** o aluno tenta iniciar um dia programado sem exercícios válidos
- **THEN** o sistema não cria sessão e explica o que precisa ser corrigido pelo personal

### Requirement: Visão semanal do personal
O personal SHALL visualizar e alterar a programação semanal somente de alunos com vínculo ativo, usando o mesmo significado de datas e estados apresentado ao aluno.

#### Scenario: Programação de aluno vinculado
- **WHEN** o personal abre a aba de treinos de um aluno vinculado
- **THEN** o sistema mostra a agenda semanal atual e permite as ações de programação autorizadas

#### Scenario: Tentativa sobre aluno não vinculado
- **WHEN** o personal solicita a agenda de um aluno sem vínculo ativo
- **THEN** o sistema nega o acesso
