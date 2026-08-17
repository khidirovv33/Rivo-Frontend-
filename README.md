# Rivo — Frontend

Веб-интерфейс Rivo (SaaS/POS/ERP для розничной торговли), дизайн-направление «Ledger». Стек: React 18+ / TypeScript, Vite, React Router, TanStack Query, React Hook Form + Zod, axios, CSS Modules + design tokens (без Tailwind/UI-кит библиотек).

Реализована зона **Frontend Dev1 (Core & Commerce)**: общий фундамент (дизайн-токены, базовые компоненты, API-клиент, auth/permissions, роутинг) + экраны авторизации, каталога (товары/категории/бренды), настроек магазинов/филиалов, кассы (`/pos`), продаж и возвратов (`/sales`), клиентов и лояльности (`/customers`), сотрудников (`/employees`), ролей и прав (`/roles`), профиля (`/profile`). Остальные разделы (`/warehouse`, `/purchases`, `/transfers`, `/inventory`, `/finance`, `/reports`, `/dashboard`) — заглушки для зон Dev2/Dev3.

## Запуск

```bash
npm install
npm run dev
```

Фронт поднимается на `http://localhost:5174` (порт 5173 занят бэкендом). Бэкенд запускается отдельно, из `Rivo-Backend`:

```bash
dotnet run --project src/Rivo.API
```

Адрес API задаётся в `.env` (см. `.env.example`):

```
VITE_API_BASE_URL=http://localhost:5173/api
```

## Скрипты

- `npm run dev` — dev-сервер
- `npm run build` — проверка типов (`tsc -b`) + продакшн-сборка
- `npm run lint` — oxlint
- `npm run preview` — предпросмотр собранного билда

## Структура

- `src/styles/tokens.css` — дизайн-токены Ledger (цвета, три шрифтовые роли)
- `src/api/` — axios-клиент, типы конверта ответа, типизированные обёртки над эндпоинтами
- `src/auth/` — auth-контекст, `usePermissions()`, `ProtectedRoute`
- `src/store-context/` — контекст текущего магазина/филиала
- `src/components/` — переиспользуемые UI-компоненты
- `src/pages/` — экраны, сгруппированные по доменам
- `src/routes/` — конфигурация роутинга и пунктов сайдбара

## Известные ограничения

- `GET /api/roles/{roleId}` на бэкенде защищён правом `Roles.Read`, которого нет у ролей Manager/Cashier/Warehouse Worker/Accountant по умолчанию — они не могут прочитать список своих же прав. `usePermissions()` обрабатывает это отказоустойчиво (пустой список при 403), но скрытие элементов по правам для этих ролей не работает, пока не поправлено на бэкенде.
