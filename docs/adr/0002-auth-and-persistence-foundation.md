# ADR 0002: Auth and persistence foundation for API

## Status

Accepted

## Context

После foundation-скелета API всё ещё оставался demo-only:

- заявки жили только в памяти процесса
- не было аутентификации
- роли были задекларированы только на уровне схем

Это не позволяет двигаться к реальной очереди юриста и role-based dashboard.

## Decision

- добавить SQLAlchemy-слой с `users` и `legal_requests`
- использовать SQLite по умолчанию для локального старта и `DATABASE_URL` для переключения на Postgres
- ввести repository layer для доступа к данным
- добавить базовый Bearer auth с HMAC-signed JWT-compatible token
- ограничить создание заявок ролями `business_requester` и `system_admin`
- ограничить чтение заявок role-aware правилами видимости

## Consequences

В системе появляется первый persisted поток:

- demo-пользователь логинится
- получает token
- создаёт заявку
- видит сохранённые данные после перезапуска API

Следующий шаг после этого блока:

- миграции
- полноценный JWT/SSO слой
- назначение исполнителя
- экран очереди юриста в web
