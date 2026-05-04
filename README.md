# legal-platform

Корпоративная LegalOps-платформа для юридического департамента. Репозиторий стартует с первого инкремента foundation-слоя на основе `legal_platform_tz_prompt_2.md`.

## Что уже есть

- монорепо-структура под `apps/*`, `packages/*`, `docs/*`
- `docker-compose.yml` с `Postgres`, `Redis`, `MinIO`, `OpenSearch`
- каркас `apps/web` на `Next.js + Tailwind`
- каркас `apps/api` на `FastAPI`
- первый API-срез под сценарий "заявка от бизнес-заказчика -> очередь юриста"
- ADR с выбранным стеком и границами первого инкремента

## Структура

```text
apps/
  api/
  web/
docs/
  adr/
packages/
  contracts/
```

## Локальный запуск

1. Поднять инфраструктуру:

```bash
docker compose up -d
```

2. Web:

```bash
cd apps/web
pnpm install
pnpm dev
```

3. API:

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

## Ближайший следующий шаг

Следующий инкремент должен добавить:

- реальную БД-модель и миграции
- JWT auth и RBAC
- persisted workflow для legal requests
- страницу очереди юриста и карточку заявки
