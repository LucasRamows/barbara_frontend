# Spec Delta

## Purpose

Permitir que aluno e personal consultem sessões passadas com eficiência, alternando entre visão analítica em tabela e leitura temporal em calendário.

## ADDED Requirements

### Requirement: Alternância entre tabela e calendário
O histórico SHALL oferecer visualizações de tabela e calendário sobre o mesmo conjunto filtrado, preservando período, filtros e seleção ao alternar entre elas.

#### Scenario: Troca de visualização
- **WHEN** o usuário alterna de tabela para calendário
- **THEN** o sistema mantém o período e os filtros atuais e representa as mesmas sessões

#### Scenario: Preferência durante a visita
- **WHEN** o usuário volta à área de histórico na mesma visita
- **THEN** a interface restaura a última visualização usada quando o contexto do aluno for o mesmo

### Requirement: Tabela paginada de sessões
A visão de tabela SHALL listar data, treino, duração, estado e indicadores relevantes, com paginação no servidor e ordenação decrescente por início por padrão.

#### Scenario: Histórico extenso
- **WHEN** existem mais sessões que o limite de uma página
- **THEN** a tabela mostra controles de paginação e solicita apenas a página necessária

#### Scenario: Aplicação de filtros
- **WHEN** o usuário filtra por período ou estado
- **THEN** o servidor aplica os filtros antes de calcular itens e total

### Requirement: Linha expansível de detalhes
Cada linha da tabela SHALL ter uma ação identificada por ícone de olho que expande os detalhes imediatamente abaixo, permite apenas uma linha aberta por vez e fecha ao acionar novamente.

#### Scenario: Abrir detalhes
- **WHEN** o usuário aciona o olho de uma sessão
- **THEN** uma linha abaixo mostra exercícios, séries, repetições, cargas, RPE, deload e observações disponíveis

#### Scenario: Abrir outra sessão
- **WHEN** uma linha está aberta e o usuário aciona o olho de outra sessão
- **THEN** a primeira fecha e a segunda passa a mostrar seus detalhes

#### Scenario: Acesso por teclado
- **WHEN** o foco está na ação de detalhes e o usuário a ativa pelo teclado
- **THEN** a expansão muda e seu estado é anunciado por atributos acessíveis

### Requirement: Calendário de dias treinados
A visão de calendário SHALL marcar dias com sessões e distinguir estados concluído, parcial, cancelado e em andamento, permitindo selecionar um dia para listar suas sessões.

#### Scenario: Dia com múltiplas sessões
- **WHEN** um dia selecionado possui mais de uma sessão
- **THEN** o sistema mostra todas as sessões daquele dia sem perder os indicadores do calendário

#### Scenario: Mês sem treinos
- **WHEN** o mês consultado não possui sessões
- **THEN** o calendário permanece navegável e informa que não há treinos no período

### Requirement: Consulta por intervalo eficiente
A API SHALL aceitar intervalo, paginação e filtros do histórico e MUST limitar o volume retornado; a consulta de calendário SHALL retornar apenas os dados sumários necessários ao mês solicitado.

#### Scenario: Navegação para outro mês
- **WHEN** o usuário avança ou retrocede o calendário
- **THEN** o cliente busca o intervalo mensal correspondente sem carregar todo o histórico

#### Scenario: Intervalo inválido
- **WHEN** o início é posterior ao fim ou o intervalo excede o limite permitido
- **THEN** a API rejeita a consulta com erro de validação claro

### Requirement: Histórico autorizado por papel
O aluno SHALL acessar apenas o próprio histórico; o personal SHALL acessar somente históricos de alunos com vínculo ativo; dados detalhados MUST ser autorizados no servidor.

#### Scenario: Aluno consulta a própria sessão
- **WHEN** o aluno solicita uma sessão pertencente ao seu perfil
- **THEN** o sistema retorna o resumo e os detalhes autorizados

#### Scenario: Personal não vinculado
- **WHEN** um personal solicita histórico ou detalhes de aluno não vinculado
- **THEN** o sistema nega o acesso sem revelar se a sessão existe
