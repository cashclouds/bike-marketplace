# 🔒 Production Security Checklist

Этот документ содержит все необходимые шаги для безопасного развёртывания bike-marketplace в production.

---

## ✅ КРИТИЧНЫЕ: ВЫПОЛНИТЬ ПЕРЕД DEPLOYMENT

### 1. Генерировать новые приватные ключи

Все ключи должны быть уникальны для каждого production environment:

```bash
# Генерировать JWT_SECRET (32 байта в hex формате)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Генерировать сильный пароль БД (минимум 16 символов)
openssl rand -base64 16

# Генерировать CSRF токен seed (если используется)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Настроить переменные окружения

Создать `.env.production` или использовать переменные окружения хостера:

```bash
# Database
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=bike_marketplace_prod
DB_USER=postgres
DB_PASSWORD=YOUR_GENERATED_STRONG_PASSWORD_HERE
DATABASE_URL=postgresql://postgres:PASSWORD@host:5432/bike_marketplace_prod

# Server
PORT=5001
NODE_ENV=production
USE_HTTPS=true

# JWT (Используй сгенерированный ключ из пункта 1)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_EXPIRATION=7d

# CORS
FRONTEND_URL=https://your-production-domain.com

# Cloudinary (Производство)
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# Stripe (Production credentials)
STRIPE_PUBLIC_KEY=pk_live_your_live_public_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Logging
LOG_LEVEL=warn
```

### 3. Проверить HTTPS

```bash
# Убедиться, что USE_HTTPS=true в .env.production
# Настроить SSL сертификат (Let's Encrypt рекомендуется)
# Настроить reverse proxy (nginx/Apache) для HTTPS
```

### 4. Защитить директории

```bash
# .env файл должен быть недоступен через веб
chmod 600 .env.production
chmod 700 /var/www/bike-marketplace
```

### 5. Настроить CORS для production домена

```bash
# Убедиться, что FRONTEND_URL указывает на production домен
FRONTEND_URL=https://your-production-domain.com

# Проверить backend/src/config/cors.ts:
# - Добавить production домен в allowedOrigins
# - Убедиться credentials: true
```

---

## 🔐 ВЫСОКИЙ ПРИОРИТЕТ: БЕЗОПАСНОСТЬ

### Базовая безопасность сервера

```bash
# 1. Обновить систему
apt update && apt upgrade

# 2. Установить firewall
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5001/tcp  # Только если API на отдельном сервере

# 3. Отключить SSH доступ через root
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 4. Настроить fail2ban для защиты от brute force
apt install fail2ban
systemctl enable fail2ban
```

### Приложение безопасность

- ✅ **CSRF Protection**: Реализована Double Submit Cookie (middleware/csrf.ts)
- ✅ **Content Security Policy (CSP)**: Настроена в Helmet (config/helmet.ts)
- ✅ **HTTP Only Cookies**: Используются для токенов (не доступны из JS)
- ✅ **CORS**: Ограничена для production домена
- ✅ **Rate Limiting**: Реализовано для auth endpoints
- ✅ **Input Validation**: Zod schemas для всех inputs
- ✅ **SQL Injection Protection**: Parameterized queries везде
- ✅ **Path Traversal Protection**: Валидация filepath в upload/delete

### Проверки перед deployment

```bash
# 1. Запустить тесты безопасности
npm run test:security

# 2. Проверить зависимости на уязвимости
npm audit
npm audit fix

# 3. Сканировать код статически
npm run lint

# 4. Проверить конфигурацию
node -e "const env = require('./src/config/env').env; console.log({
  nodeEnv: env.nodeEnv,
  useHttps: env.useHttps,
  jwtSecret: env.jwtSecret.substring(0, 10) + '***',
  corsOrigins: process.env.FRONTEND_URL,
})"
```

---

## 📝 ПРОЦЕДУРА DEPLOYMENT

### 1. На локальной машине

```bash
# Создать production branch
git checkout -b deploy/production
git add PRODUCTION_SECURITY_CHECKLIST.md
git commit -m "docs: Add production security checklist"
git push origin deploy/production
```

### 2. На production сервере

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/bike-marketplace.git
cd bike-marketplace

# Установить зависимости
npm install
cd backend
npm install
cd ..

# Создать .env.production (с генерированными ключами!)
cat > .env.production << 'EOF'
# ВАЖНО: Заменить ВСЕ placeholder значения на реальные!
DB_HOST=your_db_host
DB_PASSWORD=your_generated_password
JWT_SECRET=your_generated_jwt_secret
# ... остальные переменные
EOF

# Убедиться в правильных permissions
chmod 600 .env.production

# Запустить миграции БД
cd backend
npm run migrate
cd ..

# Собрать приложение
npm run build
cd backend
npm run build
cd ..

# Запустить приложение (рекомендуется использовать PM2 или systemd)
pm2 start "npm run start" --name "bike-marketplace"
pm2 save
```

### 3. Настроить обратный прокси (nginx)

```nginx
# /etc/nginx/sites-available/bike-marketplace

upstream api_backend {
    server 127.0.0.1:5001;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name your-production-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://api_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Важно для cookies
        proxy_cookie_path / "/";
        proxy_cookie_flags ~ secure httponly samesite=strict;
    }
}

server {
    listen 80;
    server_name your-production-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🧪 ТЕСТИРОВАНИЕ БЕЗОПАСНОСТИ

После deployment, выполни эти проверки:

```bash
# 1. Проверить HTTPS
curl -I https://your-domain.com
# Должны быть видны security headers

# 2. Проверить CORS
curl -H "Origin: https://attacker.com" https://your-domain.com/api/users/me
# Должна быть отклонена с CORS ошибкой

# 3. Проверить CSRF protection
curl -X POST https://your-domain.com/api/listings \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Должна быть ошибка 403 (CSRF token missing)

# 4. Проверить httpOnly cookies
curl -v https://your-domain.com/api/users/login \
  -d '{"email":"test@test.com","password":"test"}'
# Должны быть видны Set-Cookie с httpOnly флагом

# 5. Проверить rate limiting
for i in {1..101}; do
  curl https://your-domain.com/api/users/login
done
# После 100 запросов должна быть 429 (Too Many Requests) ошибка
```

---

## 📊 МОНИТОРИНГ

### Логирование

```bash
# Настроить логирование в production
LOG_LEVEL=warn  # Только важные события
LOG_FILE=/var/log/bike-marketplace.log

# Ротация логов
cat > /etc/logrotate.d/bike-marketplace << 'EOF'
/var/log/bike-marketplace.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0600 www-data www-data
}
EOF
```

### Мониторинг приложения

```bash
# Установить PM2 мониторинг
pm2 monitor

# Или использовать systemd
cat > /etc/systemd/system/bike-marketplace.service << 'EOF'
[Unit]
Description=Bike Marketplace API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/bike-marketplace
Environment="NODE_ENV=production"
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/node backend/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bike-marketplace
systemctl start bike-marketplace
```

---

## 🚨 INCIDENT RESPONSE

Если обнаружена уязвимость:

1. **Немедленно**:
   - Остановить приложение (systemctl stop bike-marketplace)
   - Взять снимок состояния для анализа
   - Оценить масштаб компрометации

2. **В течение часа**:
   - Исправить уязвимость
   - Запустить тесты безопасности
   - Развернуть патч

3. **В течение дня**:
   - Провести аудит логов для выявления эксплуатации
   - Сброс всех чувствительных токенов/паролей
   - Уведомить пользователей если необходимо

4. **В течение недели**:
   - Провести post-mortem анализ
   - Улучшить процессы безопасности
   - Документировать lesson learned

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Дата создания**: 2025-11-25
**Версия**: 1.0
**Статус**: ✅ Готово к production deployment
