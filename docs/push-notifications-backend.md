# Notificações push

O frontend registra cada dispositivo autorizado em:

`POST /api/notifications/push/subscriptions`

Payload:

```json
{
  "endpoint": "https://...",
  "expirationTime": null,
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

Para remover um dispositivo:

`DELETE /api/notifications/push/subscriptions`

```json
{ "endpoint": "https://..." }
```

O backend deve associar a inscrição ao usuário autenticado, salvar apenas uma inscrição por endpoint e remover endpoints que retornarem `404` ou `410` ao enviar.

## Eventos de treino

O envio deve acontecer no backend, depois da transação ser concluída:

- `WorkoutSession` finalizada: enviar ao aluno inscrito.
- Ficha, dia, exercício ou programação alterados pelo personal: enviar ao aluno inscrito afetado.

Formato recomendado do payload Web Push:

```json
{
  "title": "Treino concluído",
  "body": "Seu treino foi concluído com sucesso.",
  "url": "/historico",
  "tag": "workout-finished"
}
```

Para alteração:

```json
{
  "title": "Treino atualizado",
  "body": "Seu personal fez uma alteração na sua ficha.",
  "url": "/",
  "tag": "workout-updated"
}
```

Quando o app estiver aberto e visível, o Service Worker encaminha o evento para o app e ele mostra um toast. Quando estiver em segundo plano ou fechado, o sistema operacional mostra a notificação push. Assim, o push não substitui nem duplica o toast das ações feitas dentro do app.

## Configuração

Gerar um par de chaves VAPID no backend e publicar somente a chave pública no frontend:

O backend expõe a chave pública em `GET /api/notifications/push/public-key`, e o frontend a consulta automaticamente. Opcionalmente, ela pode ser definida diretamente no build com `VITE_VAPID_PUBLIC_KEY=<chave-publica>`.

A chave privada deve permanecer exclusivamente no backend.
