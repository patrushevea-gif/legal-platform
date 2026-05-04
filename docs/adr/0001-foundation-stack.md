# ADR 0001: Foundation stack for legal-platform

## Status

Accepted

## Context

Репозиторий пока пустой и содержит только ТЗ. Первый инкремент должен:

- запустить монорепо без лишней сложности
- позволить быстро показать demo основного потока
- не закрыть дорогу к enterprise-требованиям из ТЗ

## Decision

- монорепо: `pnpm workspace`
- frontend: `Next.js App Router + Tailwind CSS`
- backend: `FastAPI`
- infra baseline: `Postgres`, `Redis`, `MinIO`, `OpenSearch`
- API versioning: `/api/v1/*`
- первый доменный фокус: `legal requests` как входная точка для заявок бизнеса

## Why this is the first cut

- `FastAPI` быстрее доводится до первого demo и хорошо подходит под AI/RAG-слой из ТЗ
- `Next.js` подходит для role-based dashboard и внутренних dense-интерфейсов
- `Postgres + Redis + MinIO + OpenSearch` совпадают с инфраструктурными требованиями документа

## Consequences

Пока не реализованы:

- production auth
- SSO
- настоящие миграции БД
- event bus / background workers
- полнофункциональный RBAC

Эти части пойдут следующими инкрементами после стабилизации foundation-слоя.
