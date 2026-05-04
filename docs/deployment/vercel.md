# Deploy to Vercel

Текущая рекомендуемая схема для проекта:

- отдельный Vercel project для `apps/web`
- отдельный Vercel project для `apps/api`

## 1. Frontend project

- Repository: `patrushevea-gif/legal-platform`
- Root Directory: `apps/web`
- Framework Preset: `Next.js`

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`

Пример:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-api-project.vercel.app
```

## 2. Backend project

- Repository: `patrushevea-gif/legal-platform`
- Root Directory: `apps/api`
- Framework Preset: `Other`

Vercel будет использовать `app.py` как entrypoint FastAPI-приложения.

### Environment Variables

- `APP_ENV=production`
- `DATABASE_URL=<external-postgres-url>`
- `JWT_SECRET=<strong-secret>`
- `ENABLE_DEMO_SEED=false`
- `CORS_ALLOWED_ORIGINS=https://your-web-project.vercel.app`

## 3. Deployment order

1. Сначала задеплой `apps/api`.
2. Возьми production URL backend.
3. Подставь его в `NEXT_PUBLIC_API_BASE_URL` у `apps/web`.
4. Передеплой `apps/web`.

## 4. Important notes

- Для production не оставляй SQLite.
- До подключения Supabase или другого внешнего Postgres backend в production не стоит запускать.
- `ENABLE_DEMO_SEED` держи выключенным в production, если не нужен demo-режим.

## 5. Current limitation

Сейчас схема БД создаётся через SQLAlchemy `create_all()` на старте приложения.
Это подходит для раннего demo-этапа, но следующим шагом проекту нужны миграции.
