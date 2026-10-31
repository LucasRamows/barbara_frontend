# Spec Delta

## Purpose

Definir uma identidade de acesso única e dados de perfil consistentes para alunos e personals, com autenticação compatível e proteção adequada de informações pessoais.

## ADDED Requirements

### Requirement: Username único gerado pelo servidor
Ao criar aluno ou personal, o sistema SHALL gerar um username canônico a partir do nome quando ele não for informado, SHALL resolver colisões sem sobrescrever contas e MUST garantir unicidade sem diferenciar maiúsculas de minúsculas.

#### Scenario: Nome sem colisão
- **WHEN** uma conta é criada com o nome "Maria da Silva" e sem username explícito
- **THEN** o sistema cria e retorna um username legível derivado do nome

#### Scenario: Nome repetido
- **WHEN** o username derivado já pertence a outra conta ativa ou excluída logicamente
- **THEN** o sistema acrescenta um sufixo determinístico até obter um valor único

#### Scenario: Concorrência de criação
- **WHEN** duas criações concorrentes tentam reservar o mesmo username
- **THEN** no máximo uma usa o valor original e a outra recebe uma alternativa única ou um erro de conflito recuperável

### Requirement: Estabilidade e validação do username
O sistema SHALL normalizar acentos, espaços e caracteres não permitidos na geração, SHALL validar usernames informados e MUST manter o username estável quando apenas o nome do perfil for alterado.

#### Scenario: Nome com acentos
- **WHEN** uma conta é criada para "João d'Ávila"
- **THEN** o username gerado contém somente os caracteres permitidos e preserva uma forma reconhecível do nome

#### Scenario: Alteração do nome civil
- **WHEN** o nome do perfil é atualizado
- **THEN** o username existente não muda automaticamente

### Requirement: Login por username ou e-mail
O sistema SHALL autenticar uma conta ativa usando username ou e-mail canônico com a mesma senha e MUST responder falhas com mensagem genérica que não revele se a conta existe.

#### Scenario: Login por e-mail
- **WHEN** o usuário informa um e-mail cadastrado e a senha correta
- **THEN** o sistema autentica a mesma conta associada àquele e-mail

#### Scenario: Login por username legado
- **WHEN** um cliente envia o username pelo contrato de login existente
- **THEN** o sistema continua autenticando a conta durante o período de compatibilidade

#### Scenario: Identificador ou senha inválidos
- **WHEN** o identificador não existe ou a senha está incorreta
- **THEN** o sistema retorna a mesma resposta genérica de credenciais inválidas

### Requirement: E-mail de acesso globalmente único
Todo e-mail usado para login MUST ser normalizado e único entre alunos, personals e administradores, sem diferenciar maiúsculas de minúsculas.

#### Scenario: E-mail duplicado em outro papel
- **WHEN** uma criação ou edição tenta salvar um e-mail já associado a qualquer outra conta
- **THEN** o sistema rejeita a operação com conflito de e-mail sem alterar os dados existentes

#### Scenario: Dados legados conflitantes
- **WHEN** a migração encontra e-mails duplicados ou inválidos
- **THEN** ela produz uma lista de conflitos para correção e não aplica uma constraint que tornaria contas inacessíveis

### Requirement: Dados pessoais padronizados
O sistema SHALL permitir gerenciar telefone, CPF ou CNPJ, endereço postal e datas aplicáveis nos perfis de aluno e personal, usando formatos de entrada consistentes e valores canônicos na API.

#### Scenario: Telefone válido
- **WHEN** o usuário informa um telefone brasileiro formatado
- **THEN** a interface mantém uma máscara legível e a API recebe o valor canônico definido pelo contrato

#### Scenario: Documento válido
- **WHEN** o usuário informa CPF ou CNPJ
- **THEN** o sistema valida dígitos verificadores, armazena a forma canônica e mostra o valor mascarado fora da edição autorizada

#### Scenario: Preenchimento por CEP
- **WHEN** um CEP válido é informado e o serviço de consulta responde
- **THEN** rua, bairro, cidade, UF e código IBGE disponíveis são preenchidos sem apagar campos já informados quando a resposta estiver incompleta

#### Scenario: Data de nascimento
- **WHEN** uma data é selecionada no componente de data
- **THEN** a interface exibe formato brasileiro e envia uma data civil sem deslocamento causado por fuso horário

### Requirement: Autorização e minimização de dados pessoais
O sistema MUST permitir leitura e alteração de dados pessoais somente ao titular ou aos papéis explicitamente autorizados, MUST evitar esses valores em logs e mensagens de erro e SHALL retornar apenas os campos necessários a cada tela.

#### Scenario: Personal não vinculado
- **WHEN** um personal tenta consultar ou alterar documento ou endereço de aluno sem vínculo ativo
- **THEN** o sistema nega o acesso sem retornar os dados protegidos

#### Scenario: Resposta de listagem
- **WHEN** uma listagem precisa apenas de nome, username e contato resumido
- **THEN** a API não inclui documento completo nem endereço detalhado

### Requirement: Configurações do aluno simplificadas
A área de perfil/configurações do aluno SHALL separar dados pessoais, endereço, segurança e sessão em opções curtas, responsivas e com uma ação primária inequívoca por seção.

#### Scenario: Navegação em tela pequena
- **WHEN** o aluno abre configurações em um dispositivo móvel
- **THEN** ele consegue alternar entre as seções sem perder o contexto nem gerar rolagem horizontal da página

#### Scenario: Salvamento de uma seção
- **WHEN** o aluno salva dados pessoais ou endereço válido
- **THEN** apenas a seção correspondente entra em estado de envio e o sistema confirma a atualização
