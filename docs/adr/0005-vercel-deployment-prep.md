# ADR 0005: Vercel deployment preparation

## Status

Accepted

## Context

Проект дорос до первого end-to-end demo, но для деплоя на Vercel ему не хватало:

- production-oriented env-конфигурации
- явного FastAPI entrypoint на уровне `apps/api`
- понятной схемы разделения web и api проектов

## Decision

- готовить Vercel как две независимые deployment units: `apps/web` и `apps/api`
- добавить `app.py` в `apps/api` как entrypoint для Vercel Python runtime
- отделить demo seed от production через env-переключатель
- сделать CORS и env-конфигурацию управляемыми через переменные окружения

## Consequences

Проект можно разворачивать на Vercel уже сейчас при наличии внешней Postgres БД.

Следующий шаг:

- подключить Supabase/Postgres
- перейти от `create_all()` к миграциям
- подготовить production-ready auth/session слой
