#!/bin/bash

# Скрипт для обновления переменных окружения на Vercel
# Использует Vercel CLI

echo "🚀 Vercel Environment Variables Update"
echo "======================================="
echo ""

# Проверить установлен ли vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI найден"
echo ""

# Логин в Vercel
echo "🔐 Логирование в Vercel..."
vercel login

echo ""
echo "📦 Выберите проект (bike-marketplace)"
vercel link

echo ""
echo "🔧 Обновление переменных окружения..."
echo ""

# Переменные окружения для обновления
echo "⚠️  ВАЖНО: Обновите следующие переменные вручную в Vercel Dashboard:"
echo ""
echo "1. NEXT_PUBLIC_API_URL"
echo "   - Значение: https://your-api-domain.com/api"
echo ""
echo "2. NODE_ENV"
echo "   - Значение: production"
echo ""
echo "3. JWT_SECRET (если backend на Vercel)"
echo "   - Значение: 8375892f2ee3b1bf0e7c07fea3116f683b876542ee05d71cf75880318f685411"
echo ""

# Попытка установить переменные через CLI
echo "Попытка установить переменные через CLI..."
echo ""

# Пример - раскомментировать и заполнить свои значения:
# vercel env add NEXT_PUBLIC_API_URL https://your-api-domain.com/api
# vercel env add NODE_ENV production

echo "✅ Переменные можно установить вручную в Vercel Dashboard:"
echo "   https://vercel.com/dashboard/[PROJECT]/settings/environment-variables"
echo ""

echo "🔄 Перестроение проекта..."
vercel --prod --force

echo ""
echo "✅ Deployment завершён!"
echo ""
echo "📝 Проверьте:"
echo "   1. https://bike-marketplace-rho.vercel.app/ загружается"
echo "   2. Логин работает без ошибок"
echo "   3. Cookies устанавливаются"
