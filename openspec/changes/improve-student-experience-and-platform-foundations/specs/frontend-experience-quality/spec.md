# Spec Delta

## Purpose

Garantir que os novos fluxos do Bárbara tenham comportamento visual consistente, acessível, seguro e rápido em dispositivos móveis e desktop.

## ADDED Requirements

### Requirement: Navegação por abas consistente
Áreas com troca entre seções equivalentes SHALL usar o mesmo padrão de navegação rolável e responsivo, com estado ativo perceptível e sem depender apenas de cor.

#### Scenario: Abas excedem a largura móvel
- **WHEN** as opções não cabem na largura disponível
- **THEN** a navegação permite rolagem horizontal própria sem expandir a largura da página

#### Scenario: Uso por teclado
- **WHEN** o usuário navega pelas opções com teclado
- **THEN** foco, seleção e ativação ficam visíveis e semanticamente identificados

### Requirement: Seleção de datas uniforme
Campos de data nos fluxos alterados SHALL usar um seletor comum, mostrar formato brasileiro, enviar data canônica e aplicar restrições como proibição de datas futuras quando o domínio exigir.

#### Scenario: Data futura proibida
- **WHEN** o usuário edita nascimento ou medição e tenta selecionar data futura
- **THEN** o componente impede a seleção e mantém o campo válido

#### Scenario: Valor ISO com horário
- **WHEN** a API retorna uma data ISO com horário
- **THEN** a interface representa a data civil esperada sem deslocar o dia por fuso

### Requirement: Estados assíncronos orientativos
Cada fluxo SHALL diferenciar carregamento, vazio, erro, sucesso e ausência de autorização, com ação de recuperação quando aplicável e sem esconder conteúdo já carregado por falha parcial.

#### Scenario: Erro recuperável
- **WHEN** uma consulta falha por rede
- **THEN** a interface explica o problema, oferece nova tentativa e preserva filtros e contexto

#### Scenario: Envio duplicado
- **WHEN** uma mutação está em andamento
- **THEN** a ação correspondente fica indisponível e fornece retorno visual até finalizar

### Requirement: Acessibilidade e responsividade
Os fluxos alterados MUST ser operáveis por teclado, possuir nomes acessíveis, foco visível, contraste adequado e conteúdo utilizável entre 320 px e desktop, respeitando preferência por movimento reduzido.

#### Scenario: Tela de 320 px
- **WHEN** uma tela alterada é aberta com 320 px de largura
- **THEN** ações essenciais e conteúdo permanecem acessíveis sem rolagem horizontal da página

#### Scenario: Movimento reduzido
- **WHEN** o sistema operacional solicita movimento reduzido
- **THEN** animações não essenciais são removidas ou reduzidas sem perda de informação

### Requirement: Linguagem visual específica do treino
As telas SHALL preservar os tokens e a identidade existentes do Bárbara, usando hierarquia baseada em semana, sessão, progresso e conquista, e MUST evitar decoração que não comunique estado ou ação.

#### Scenario: Cartão de sessão
- **WHEN** uma sessão é exibida em agenda, histórico ou evolução
- **THEN** data, estado e ação principal seguem a mesma hierarquia e vocabulário

#### Scenario: Conquista em destaque
- **WHEN** uma nova conquista precisa chamar atenção
- **THEN** apenas o elemento de conquista recebe ênfase especial e os controles ao redor permanecem visualmente contidos

### Requirement: Orçamento de carregamento
Cada rota alterada SHALL carregar sob demanda dependências exclusivas da própria experiência, MUST evitar waterfalls independentes e SHALL manter o chunk inicial comprimido dentro do orçamento definido pela equipe antes da implementação.

#### Scenario: Acesso sem gráficos
- **WHEN** o usuário abre uma rota que não exibe evolução
- **THEN** o código da biblioteca de gráficos não é necessário para a primeira renderização dessa rota

#### Scenario: Consultas independentes
- **WHEN** uma tela precisa de fontes de dados independentes
- **THEN** o sistema inicia as consultas em paralelo e trata cada resultado conforme sua criticidade

#### Scenario: Regressão de bundle
- **WHEN** o build de produção excede o orçamento aprovado para chunk inicial ou chunk de rota
- **THEN** a verificação automatizada falha e informa quais artefatos excederam o limite

### Requirement: Cache e invalidação previsíveis
Consultas SHALL ter chaves estáveis por usuário, aluno, período e filtros; mutações SHALL atualizar ou invalidar somente dados afetados para evitar conteúdo obsoleto ou vazamento entre contas.

#### Scenario: Troca de usuário
- **WHEN** uma conta encerra a sessão e outra entra no mesmo navegador
- **THEN** dados protegidos em cache da conta anterior não aparecem para a nova conta

#### Scenario: Medição criada
- **WHEN** uma medição é salva com sucesso
- **THEN** evolução e resumos afetados são atualizados sem invalidar dados não relacionados

### Requirement: Segurança da interface
O frontend MUST tratar autorização como informação de apresentação, nunca como único controle, SHALL evitar HTML não confiável e MUST NOT registrar tokens, documentos, endereço completo ou credenciais.

#### Scenario: Ação escondida manipulada
- **WHEN** um usuário força manualmente uma requisição de ação não autorizada
- **THEN** o backend nega a operação independentemente do estado da interface

#### Scenario: Erro com dado sensível
- **WHEN** uma operação de perfil falha
- **THEN** telemetria e mensagem visível não incluem documento, senha, token ou endereço completo

### Requirement: Barreira de qualidade automatizada
Os arquivos alterados SHALL passar por compilação, lint sem erros, testes unitários e testes de integração dos contratos críticos; novos tipos de domínio MUST evitar `any` e estados impossíveis.

#### Scenario: Pull request com erro de lint
- **WHEN** uma alteração introduz erro de lint em arquivo do escopo
- **THEN** a verificação automatizada falha antes da publicação

#### Scenario: Mudança de contrato
- **WHEN** o backend altera resposta de login, histórico, evolução ou gamificação
- **THEN** testes de contrato detectam incompatibilidade com os consumidores do frontend
