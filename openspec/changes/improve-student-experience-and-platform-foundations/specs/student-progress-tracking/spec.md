# Spec Delta

## Purpose

Oferecer uma leitura confiável da evolução física do aluno ao longo do treinamento, com acesso seguro para o próprio aluno e para seu personal vinculado.

## ADDED Requirements

### Requirement: Série histórica de peso
O sistema SHALL apresentar peso por data em ordem cronológica, indicar a variação entre medições e permitir consultar o valor exato sem depender apenas do gráfico.

#### Scenario: Duas ou mais medições
- **WHEN** o aluno possui medições de peso em datas distintas
- **THEN** a visualização mostra a tendência, os valores e a variação entre o primeiro e o último ponto do período

#### Scenario: Uma única medição
- **WHEN** existe apenas uma medição
- **THEN** o sistema mostra o valor registrado sem inventar tendência ou percentual de evolução

#### Scenario: Nenhuma medição
- **WHEN** não existe peso registrado
- **THEN** o sistema explica como adicionar a primeira medição e não renderiza um gráfico vazio

### Requirement: Evolução de medidas corporais
O sistema SHALL permitir alternar entre peso e outras medidas disponíveis, mantendo unidade, período e identificação da data de cada registro.

#### Scenario: Seleção de cintura
- **WHEN** o usuário seleciona a medida de cintura
- **THEN** a visualização usa somente registros que contêm cintura e exibe a unidade correta

#### Scenario: Dados parciais
- **WHEN** uma medição não possui o campo selecionado
- **THEN** o sistema omite esse ponto sem tratá-lo como zero

### Requirement: Contexto de treinos na evolução
A visão de evolução SHALL mostrar a cadência de sessões concluídas ou parciais no período para que a mudança de peso possa ser lida junto ao histórico de treino, sem afirmar causalidade.

#### Scenario: Período com medições e treinos
- **WHEN** há medições e sessões no intervalo selecionado
- **THEN** o sistema apresenta ambos em uma linha do tempo ou resumo coordenado e identifica claramente cada tipo de dado

#### Scenario: Período sem sessões
- **WHEN** há medições mas nenhuma sessão válida no período
- **THEN** o sistema mostra as medições e informa ausência de treinos registrados no intervalo

### Requirement: Registro e correção de medições
O aluno ou personal autorizado SHALL criar e editar medições com data civil, peso e campos opcionais validados; a origem e o responsável pelo registro SHALL permanecer rastreáveis.

#### Scenario: Personal registra peso
- **WHEN** o personal vinculado salva uma medição válida para o aluno
- **THEN** o sistema registra valor, data e responsável e atualiza a evolução sem recarregar a página inteira

#### Scenario: Valor inválido
- **WHEN** peso, altura ou medida está fora dos limites aceitos
- **THEN** o sistema rejeita o registro e associa uma mensagem ao campo inválido

### Requirement: Acesso do personal à evolução
O personal SHALL acessar a evolução dentro do detalhe do aluno vinculado e SHALL usar o mesmo contrato de dados e significados disponível ao aluno.

#### Scenario: Personal abre evolução
- **WHEN** o personal abre a seção de evolução de um aluno vinculado
- **THEN** o sistema carrega peso, medidas e resumo de treinos do período selecionado

#### Scenario: Vínculo removido
- **WHEN** o vínculo é removido antes ou durante a consulta
- **THEN** novas requisições são negadas e os dados protegidos deixam de ser exibidos

### Requirement: Consulta limitada por período
A API SHALL aceitar intervalo de datas para medições e resumo de treinos, ordenar dados de forma determinística e limitar intervalos excessivos.

#### Scenario: Alteração do período
- **WHEN** o usuário escolhe outro intervalo válido
- **THEN** o sistema busca apenas os dados desse período e atualiza todas as visualizações relacionadas

#### Scenario: Datas no mesmo dia
- **WHEN** existem múltiplos registros no mesmo dia
- **THEN** a API os retorna em ordem determinística com identificadores distintos
