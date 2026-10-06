# Bizaffle AI

Интеллектуальная SaaS-платформа для предпринимателей, ИП и ТОО в Казахстане.

**Юрист, бухгалтер и бизнес-консультант — в одном AI-сервисе.**

Пользователь регистрируется, добавляет компанию и получает персональную AI-команду:

- **Айдана** — AI Бухгалтер
- **Алихан** — AI Юрист
- **Данияр** — AI Бизнес-консультант

AI не заменяет лицензированного специалиста. В интерфейсе есть соответствующий disclaimer.

---

## Архитектура

Монорепозиторий npm workspaces:

```
apps/web          Next.js 15 · App Router · Tailwind 4
apps/api          NestJS 11 · Prisma · PostgreSQL · Redis
packages/types    Общие TypeScript-контракты
packages/ui       Бренд-токены
packages/config   Общие настройки
nginx/            Пример reverse-proxy
```

Frontend и backend живут в разных приложениях. API-ключи LLM никогда не попадают во frontend.

### AI abstraction

Провайдер выбирается через `AI_PROVIDER`:

| Значение | Поведение |
| --- | --- |
| `mock` | Богатые ответы на русском (по умолчанию для MVP) |
| `ravatar` | Заготовка под Ravatar. Когда появится ключ — достаточно заполнить `RAVATAR_API_URL` и `RAVATAR_API_KEY` |
| `openai` | Заготовка под OpenAI |

Интерфейс: `AIProvider` в `apps/api/src/modules/ai/providers/`.

---

## Требования

- Node.js 20+
- npm 10+
- Docker Desktop опционален (PostgreSQL/Redis). Локальный MVP работает на SQLite без Docker.
- 8 GB RAM рекомендуется из‑за 3D-сцены на лендинге

---

## Быстрый старт

```bash
# 1. Зависимости
npm install

# 2. База (SQLite, файл apps/api/prisma/dev.db)
npm run db:generate
npm run db:push
npm run db:seed

# 3. Разработка
npm run dev
```

Если есть Docker и нужен PostgreSQL — смените `provider` в `schema.prisma` на `postgresql`, укажите `DATABASE_URL` и выполните:

```bash
docker compose up -d postgres redis
npm run db:push
npm run db:seed
```

После этого:

- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/docs

### Demo-аккаунты

| Роль | Email | Пароль |
| --- | --- | --- |
| Пользователь | demo@bizaffle.ai | Demo1234! |
| Админ | admin@bizaffle.ai | Admin1234! |

Демо-компания: **ТОО «Bizaffle Demo»** — с документами, календарём, метриками, диалогами и уведомлениями.

---

## Переменные окружения

Скопируйте `.env.example` в `.env` (корень) и в `apps/api/.env`.  
Для frontend используйте `apps/web/.env.local`.

Ключевые переменные:

```
DATABASE_URL=postgresql://bizaffle:bizaffle@localhost:5432/bizaffle?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
WEB_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
AI_PROVIDER=mock
RAVATAR_API_URL=
RAVATAR_API_KEY=
```

Redis опционален: API стартует и без него, rate limit уходит в память.

---

## База данных

Prisma-схема: `apps/api/prisma/schema.prisma`

```bash
npm run db:generate    # prisma generate
npm run db:push        # схема → БД без миграции (dev)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # demo-данные
npm run db:studio      # Prisma Studio
```

Основные сущности: User, Company, CompanyMember, AIConversation, AIMessage, AIAgent, Document, DocumentAnalysis, Notification, Subscription, Payment, BusinessMetric, CalendarEvent, AuditLog.

---

## API

Версия: `/api/v1`

Примеры:

```
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /users/me
GET  /companies/current
GET  /ai/agents
POST /ai/chat
GET  /ai/conversations
POST /documents
POST /documents/:id/analyze
GET  /dashboard/overview
GET  /notifications
GET  /calendar
GET  /business/health
GET  /admin/stats
```

Ответ всегда:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 0 } }
```

или

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## Безопасность

- JWT access + refresh (httpOnly cookie)
- RBAC: `USER`, `COMPANY_ADMIN`, `ADMIN`
- argon2 для паролей
- Helmet, CORS, ValidationPipe, rate limiting
- AuditLog: регистрация, вход, анализ документов, смена тарифа
- Пароли, JWT, API-ключи и содержимое документов не логируются

---

## Docker

Только инфраструктура:

```bash
docker compose up -d postgres redis
```

Полный стек (api + web):

```bash
docker compose --profile full up --build
```

Nginx-конфиг: `nginx/default.conf`.

---

## Скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | API + web параллельно |
| `npm run dev:web` | только Next.js |
| `npm run dev:api` | только NestJS |
| `npm run build` | production build |
| `npm run lint` | TypeScript check |

---

## Продукт (маршруты web)

**Маркетинг:** `/` `/pricing`  
**Auth:** `/login` `/register` `/forgot-password` `/onboarding`  
**Кабинет:** `/dashboard` `/dashboard/ai` `/dashboard/ai/[agent]` `/dashboard/documents` `/dashboard/accounting` `/dashboard/legal` `/dashboard/consulting` `/dashboard/calendar` `/dashboard/finance` `/dashboard/company` `/dashboard/notifications`  
**Админ:** `/admin`

Язык MVP — русский. Словари `ru` / `kk` / `en` лежат в `apps/web/src/lib/i18n`.

---

## Vercel (демо-фронтенд)

Показательный сайт работает **без Nest API**: кабинет заполнен моками, вход сразу открывает демо.

Репозиторий: [Anubizze/BizzafleAI](https://github.com/Anubizze/BizzafleAI)

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → этот GitHub.
2. Framework Preset: **Next.js**. Root Directory оставьте пустым (корень монорепо).
3. `vercel.json` уже задаёт install/build для `@bizaffle/web`.
4. Deploy. Через минуту откроется лендинг; кнопка **Открыть демо** ведёт в кабинет.

Локально как на Vercel:

```bash
npm install
npm run build --workspace=@bizaffle/web
npm run start -w @bizaffle/web
```

---

## Production

1. Смените JWT-секреты и пароль PostgreSQL.
2. Включите `COOKIE_SECURE=true` за HTTPS.
3. Поставьте реальный `AI_PROVIDER=ravatar` и ключи.
4. Вынесите файлы из локальной папки `uploads` в object storage.
5. Соберите образы и поставьте Nginx перед web/api.

```bash
npm run build
npm run start -w @bizaffle/api
npm run start -w @bizaffle/web
```
