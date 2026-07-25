# TJ Marketplace — Покупка и продажа товаров в Таджикистане

Мобильное приложение для покупки и продажи товаров с регистрацией по номеру телефона Таджикистана (+992).

## Структура проекта

```
├── backend/          # API-сервер (Node.js + Express + Prisma + SQLite)
├── mobile/           # Мобильное приложение (React Native + Expo)
├── admin/            # Админ-панель (React + Vite)
├── certs/            # SSL-сертификаты для локального HTTPS
└── .gitignore
```

## Возможности

### Мобильное приложение
- Регистрация и вход по номеру телефона Таджикистана (+992) с SMS-кодом
- Просмотр списка товаров с фильтром по категориям и поиском
- Детальная страница товара с контактом продавца
- Создание, редактирование и удаление своих товаров
- Избранное
- Профиль пользователя

### Backend API
- REST API на Express с HTTPS (самоподписанный сертификат)
- База данных SQLite через Prisma ORM
- JWT-аутентификация
- Валидация номеров Таджикистана: +992 (90, 91, 92, 93, 94, 95, 97, 98, 99, 50, 55, 88)
- Имитация SMS-кода для локальной разработки (код возвращается в ответе)

### Админ-панель
- Дашборд со статистикой (пользователи, товары, блокировки)
- Управление пользователями (блокировка, роли, удаление)
- Управление товарами (статус, удаление)

## Быстрый старт

### 1. Backend

```bash
cd backend
npm install
npm run cert          # генерация SSL-сертификата
npm run prisma:generate
npx prisma db push    # создание базы данных
npm run seed          # заполнить демо-данными
npm run dev           # запуск сервера на https://localhost:3000
```

### 2. Админ-панель

```bash
cd admin
npm install
npm run dev           # запуск на http://localhost:3001
```

Вход администратора:
- Телефон: `+992 90 000 0000`
- Код: `123456`

(настраивается в `backend/.env`: `ADMIN_PHONE` и `ADMIN_CODE`)

### 3. Мобильное приложение

```bash
cd mobile
npm install
npx expo start        # запуск Expo Dev Server
```

**Важно:** Для тестирования на реальном телефоне измените `API_URL` в `mobile/src/config.ts` на IP-адрес вашего компьютера:
```ts
export const API_URL = 'https://192.168.1.100:3000/api';
```

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/send-code` | Отправка SMS-кода |
| POST | `/api/auth/verify-code` | Проверка кода, вход/регистрация |
| POST | `/api/auth/admin-login` | Вход администратора |
| GET | `/api/auth/me` | Текущий пользователь |
| PUT | `/api/auth/profile` | Обновить профиль |
| GET | `/api/products` | Список товаров (пагинация, фильтр) |
| GET | `/api/products/:id` | Детали товара |
| POST | `/api/products` | Создать товар (auth) |
| PUT | `/api/products/:id` | Редактировать товар (owner/admin) |
| DELETE | `/api/products/:id` | Удалить товар (owner/admin) |
| GET | `/api/products/my/listing` | Мои товары (auth) |
| POST | `/api/products/:id/favorite` | Добавить в избранное (auth) |
| DELETE | `/api/products/:id/favorite` | Убрать из избранного (auth) |
| GET | `/api/products/favorites/my` | Моё избранное (auth) |
| GET | `/api/admin/stats` | Статистика (admin) |
| GET | `/api/admin/users` | Список пользователей (admin) |
| PUT | `/api/admin/users/:id/block` | Блокировка пользователя (admin) |
| PUT | `/api/admin/users/:id/role` | Изменить роль (admin) |
| DELETE | `/api/admin/users/:id` | Удалить пользователя (admin) |
| GET | `/api/admin/products` | Все товары (admin) |
| PUT | `/api/admin/products/:id/status` | Статус товара (admin) |
| DELETE | `/api/admin/products/:id` | Удалить товар (admin) |

## Технологии

- **Backend:** Node.js, Express, Prisma ORM, SQLite, JWT, Zod, HTTPS
- **Mobile:** React Native, Expo, React Navigation, AsyncStorage
- **Admin:** React, Vite, TypeScript
- **SSL:** selfsigned (самоподписанный сертификат для локальной разработки)

## Демо-данные

После `npm run seed` в базе:
- 7 категорий (Электроника, Автомобили, Недвижимость, Одежда, Мебель, Услуги, Другое)
- 5 демо-товаров
- Демо-пользователь: +992 90 123 4567
