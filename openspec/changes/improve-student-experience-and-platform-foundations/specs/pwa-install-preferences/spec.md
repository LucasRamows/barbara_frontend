# Spec Delta

## Purpose

Controlar a oferta de instalação da PWA para que ela seja útil, não repetitiva e corretamente isolada entre usuários do mesmo navegador ou dispositivo.

## ADDED Requirements

### Requirement: Oferta elegível de instalação
O sistema SHALL mostrar a oferta de instalação apenas quando houver usuário autenticado, o navegador disponibilizar o prompt nativo, o app não estiver em modo standalone e esse usuário ainda não tiver visto a oferta nesse navegador.

#### Scenario: Primeira oferta elegível
- **WHEN** um usuário autenticado acessa o app em um navegador instalável pela primeira vez
- **THEN** o sistema mostra uma única oferta de instalação

#### Scenario: Acesso sem suporte de instalação
- **WHEN** o navegador não disponibiliza instalação ou o app já está instalado
- **THEN** o sistema não mostra a oferta

### Requirement: Persistência da visualização por usuário
O sistema SHALL registrar a oferta como vista quando ela for apresentada e SHALL manter esse registro associado ao identificador estável do usuário no navegador atual, independentemente de aceitar ou dispensar.

#### Scenario: Retorno após dispensar
- **WHEN** o usuário dispensa a oferta e volta ao app posteriormente no mesmo navegador
- **THEN** o sistema não mostra a oferta novamente

#### Scenario: Outra conta no mesmo navegador
- **WHEN** outro usuário elegível entra no mesmo navegador e ainda não viu a oferta
- **THEN** o sistema pode mostrar a oferta uma vez para essa outra conta

### Requirement: Separação entre instalação e atualização
O sistema MUST tratar a oferta de instalação e o aviso de nova versão como estados independentes.

#### Scenario: Atualização após oferta já vista
- **WHEN** existe uma atualização aguardando ativação para um usuário que já viu a oferta de instalação
- **THEN** o sistema continua mostrando o aviso de atualização conforme a política de atualização
