import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  // Database
  databaseUrl: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword?: string;

  // Server
  port: number;
  nodeEnv: 'development' | 'production' | 'staging';
  frontendUrl: string;

  // Security
  jwtSecret: string;
  jwtExpiration: string;

  // File Upload
  maxFileSize: number;
  uploadDir: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // Stripe
  stripeSecretKey?: string;

  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';

  // HTTPS
  useHttps: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'JWT_SECRET',
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
  ];

  // Проверить обязательные переменные
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error('❌ ОШИБКА: Отсутствуют обязательные переменные окружения:');
    missingEnvVars.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error('\nСкопируйте .env.example в .env.local и заполните значения');
    process.exit(1);
  }

  // Проверить JWT_SECRET в production
  const jwtSecret = process.env.JWT_SECRET || '';
  if (process.env.NODE_ENV === 'production' && jwtSecret === 'secret') {
    console.error(
      '❌ ОШИБКА: В production нельзя использовать JWT_SECRET="secret"'
    );
    console.error(
      '   Установите безопасный ключ. Команда для генерации:'
    );
    console.error('   openssl rand -base64 32');
    process.exit(1);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'staging'].includes(nodeEnv)) {
    console.error(
      `❌ ОШИБКА: NODE_ENV должен быть development, production или staging. Получено: ${nodeEnv}`
    );
    process.exit(1);
  }

  // Парсить PORT
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port)) {
    console.error('❌ ОШИБКА: PORT должен быть числом');
    process.exit(1);
  }

  // Парсить размер файла
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
  if (isNaN(maxFileSize)) {
    console.error('❌ ОШИБКА: MAX_FILE_SIZE должен быть числом');
    process.exit(1);
  }

  return {
    // Database
    databaseUrl: process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbName: process.env.DB_NAME || 'bike_marketplace',
    dbUser: process.env.DB_USER || 'postgres',
    dbPassword: process.env.DB_PASSWORD,

    // Server
    port,
    nodeEnv: nodeEnv as 'development' | 'production' | 'staging',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Security
    jwtSecret,
    jwtExpiration: process.env.JWT_EXPIRATION || '7d',

    // File Upload
    maxFileSize,
    uploadDir: process.env.UPLOAD_DIR || 'public/uploads',

    // Rate Limiting
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10
    ),
    rateLimitMaxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || '100',
      10
    ),

    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,

    // Logging
    logLevel: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',

    // HTTPS
    useHttps: process.env.USE_HTTPS === 'true',
    sslCertPath: process.env.SSL_CERT_PATH,
    sslKeyPath: process.env.SSL_KEY_PATH,
  };
}

export const env = validateEnv();

// Логировать окружение при старте
console.log(`
╔════════════════════════════════════════╗
║     BikeMarket Backend Configuration   ║
╚════════════════════════════════════════╝
🌍 Environment:      ${env.nodeEnv}
🚀 Port:            ${env.port}
📊 Frontend URL:    ${env.frontendUrl}
📝 Log Level:       ${env.logLevel}
🔐 JWT Expiration:  ${env.jwtExpiration}
📁 Upload Dir:      ${env.uploadDir}
⏱️  Rate Limit:      ${env.rateLimitMaxRequests} requests / ${env.rateLimitWindowMs}ms
${env.useHttps ? '🔒 HTTPS:           ENABLED\n' : '⚠️  HTTPS:           DISABLED (use reverse proxy in production)\n'}
`);
