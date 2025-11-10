# BikeMarket Full Stack Setup Guide

Полное руководство по настройке и запуску Bike Marketplace с бэкенд и фронтенд.

## 📋 Prerequisites (Требования)

Убедитесь, что у вас установлены:
- **Node.js** 16+ ([download](https://nodejs.org/))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/))
- **Git** (опционально)
- Аккаунты на:
  - **Cloudinary** (для фото) - [cloudinary.com](https://cloudinary.com)
  - **Stripe** (для платежей) - [stripe.com](https://stripe.com)

## 🚀 Quick Start (Быстрый Старт)

### 1. Подготовка проекта
```bash
# Клонируйте или загрузите проект
cd bike-marketplace

# Установите зависимости фронтенда
npm install

# Установите зависимости бэкенда
cd backend
npm install
cd ..
```

### 2. Настройка PostgreSQL

```bash
# Создайте базу данных
createdb bike_marketplace

# Инициализируйте схему (Windows)
psql -U postgres -d bike_marketplace -f backend/sql/01_init_schema.sql
psql -U postgres -d bike_marketplace -f backend/sql/02_seed_data.sql

# Или (macOS/Linux)
psql postgres < backend/sql/01_init_schema.sql
psql postgres < backend/sql/02_seed_data.sql
```

### 3. Настройка переменных окружения

**Фронтенд** - создайте `.env.local`:
```bash
cp .env.example .env.local
```

Отредактируйте `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Бэкенд** - создайте `.env`:
```bash
cd backend
cp .env.example .env
```

Отредактируйте `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bike_marketplace
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (get from https://dashboard.stripe.com)
STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🏃 Запуск приложения

### Вариант 1: Два терминала (Рекомендуется для разработки)

**Терминал 1 - Фронтенд:**
```bash
cd bike-marketplace
npm run dev
# Фронтенд запустится на http://localhost:3000
```

**Терминал 2 - Бэкенд:**
```bash
cd bike-marketplace/backend
npm run dev
# Бэкенд запустится на http://localhost:5000
```

### Вариант 2: Один терминал (с использованием concurrently)

```bash
# Сначала установите concurrently
npm install -D concurrently

# Обновите scripts в root package.json:
# "dev": "concurrently \"npm run dev\" \"cd backend && npm run dev\""

# Запустите:
npm run dev
```

## 🔌 Проверка подключения

### API Health Check
```bash
curl http://localhost:5000/health
```

### Создание тестового пользователя
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "user_type": "individual"
  }'
```

### Получение объявлений
```bash
curl http://localhost:5000/api/listings
```

## 🔧 Конфигурация Cloudinary

1. Перейдите на [cloudinary.com](https://cloudinary.com)
2. Создайте аккаунт и подтвердите email
3. Перейдите в [Dashboard](https://cloudinary.com/console)
4. Скопируйте:
   - Cloud Name
   - API Key
   - API Secret
5. Добавьте в `backend/.env`

## 💳 Конфигурация Stripe

1. Перейдите на [stripe.com](https://stripe.com)
2. Создайте аккаунт
3. Перейдите в [Dashboard](https://dashboard.stripe.com)
4. Найдите API Keys раздел
5. Скопируйте:
   - Publishable Key (начинается с `pk_test_`)
   - Secret Key (начинается с `sk_test_`)
6. Для webhook'ов:
   - Перейдите в Developers > Webhooks
   - Создайте endpoint: `http://localhost:5000/api/payments/webhook`
   - Events: `checkout.session.completed`
   - Скопируйте Signing Secret
7. Добавьте в `backend/.env`

## 📊 Структура базы данных

Таблицы которые будут созданы:
- `users` - Пользователи (покупатели и продавцы)
- `brands` - Бренды велосипедов
- `models` - Модели велосипедов
- `listings` - Объявления о продаже
- `components` - Компоненты велосипедов
- `transactions` - Транзакции (платежи)
- `reviews` - Отзывы между пользователями
- `messages` - Сообщения между пользователями

## 🔄 API Endpoints

### Authentication
- `POST /api/users/register` - Регистрация
- `POST /api/users/login` - Вход
- `GET /api/users/me` - Текущий пользователь
- `PUT /api/users/me` - Обновить профиль

### Listings
- `GET /api/listings` - Получить объявления
- `GET /api/listings/:id` - Одно объявление
- `POST /api/listings` - Создать объявление (требует токена)
- `PUT /api/listings/:id` - Обновить объявление
- `DELETE /api/listings/:id` - Удалить объявление

### Brands & Models
- `GET /api/brands` - Все бренды
- `GET /api/brands/:id/models` - Модели бренда

### Upload
- `POST /api/upload/upload` - Загрузить одно фото
- `POST /api/upload/upload-multiple` - Загрузить несколько фото
- `DELETE /api/upload/delete/:public_id` - Удалить фото

### Payments
- `POST /api/payments/create-checkout-session` - Создать платеж
- `POST /api/payments/webhook` - Webhook от Stripe
- `GET /api/payments/status/:sessionId` - Статус платежа

## 🐛 Common Issues

### "Cannot find module 'pg'"
```bash
cd backend
npm install pg
```

### "Port already in use"
Измените PORT в `backend/.env` или kill процесс:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### "ECONNREFUSED" - Cannot connect to database
- Убедитесь что PostgreSQL запущен
- Проверьте DB_HOST, DB_USER, DB_PASSWORD в .env
- Проверьте что база данных создана: `createdb -l`

### Stripe webhook not working locally
Используйте [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
# Установка
brew install stripe/stripe-cli/stripe

# Или скачайте с https://stripe.com/docs/stripe-cli

# Запустите forward:
stripe listen --forward-to localhost:5000/api/payments/webhook

# Copy the webhook secret and add to .env
```

## 📈 Production Deployment

### Подготовка к production
1. Установите `NODE_ENV=production`
2. Используйте сильный `JWT_SECRET`
3. Включите HTTPS
4. Настройте базу данных на production сервере
5. Используйте production Stripe keys
6. Настройте CORS правильно

### Deployment платформы

**Фронтенд:**
- Vercel (рекомендуется для Next.js)
- Netlify
- Railway

**Бэкенд:**
- Railway
- Render
- Heroku
- AWS (EC2, Elastic Beanstalk)

**База данных:**
- Railway
- Supabase
- AWS RDS
- Digital Ocean

### Пример Vercel deployment

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Deploy фронтенд
vercel --prod

# 3. Обновите .env для production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 📚 Дополнительные ресурсы

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## 📞 Support

Если у вас есть вопросы:
1. Проверьте логи бэкенда и фронтенда
2. Убедитесь что все env переменные установлены
3. Проверьте что базаданных создана и инициализирована
4. Прочитайте error messages внимательно

## ✅ Checklist для запуска

- [ ] Node.js установлен (проверьте: `node -v`)
- [ ] PostgreSQL установлен и запущен
- [ ] Клонировали/загрузили проект
- [ ] `npm install` выполнен в root и backend
- [ ] Создали базу данных
- [ ] Запустили SQL скрипты (schema + seed)
- [ ] Создали `.env.local` для фронтенда
- [ ] Создали `.env` для бэкенда
- [ ] Заполнили Cloudinary ключи
- [ ] Заполнили Stripe ключи
- [ ] Запустили фронтенд (`npm run dev`)
- [ ] Запустили бэкенд (`npm run dev`)
- [ ] Открыли http://localhost:3000

## 🎉 Всё готово!

Ваш BikeMarket должен работать на:
- **Фронтенд:** http://localhost:3000
- **Бэкенд API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

Создайте тестового пользователя и начните тестировать!

---

**Built with ❤️ for Estonian cycling community**
