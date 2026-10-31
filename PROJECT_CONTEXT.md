# Contexto do projeto Bárbara

## Repositórios relacionados

- Frontend: `D:\Trabalho\Projetos\barbaraFront`
- Backend complementar: `D:\Trabalho\Projetos\barbaraBackend`

O `barbaraBackend` é o backend oficial deste projeto frontend. Alterações que envolvam API, banco de dados, autenticação, Web Push ou regras de treino devem considerar os dois repositórios.

## Notificações Web Push

O frontend consome os endpoints de push implementados no backend:

- `GET /api/notifications/push/public-key`
- `POST /api/notifications/push/subscriptions`
- `DELETE /api/notifications/push/subscriptions`

As chaves VAPID privadas pertencem somente ao ambiente do `barbaraBackend`.
