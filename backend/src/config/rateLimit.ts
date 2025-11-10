import rateLimit from 'express-rate-limit';
import { env } from './env';

/**
 * Rate limiter для защиты API от брутфорса и DoS атак
 * Ограничивает количество запросов с одного IP адреса
 */

// Основной rate limiter для всех маршрутов
export const generalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs, // Окно времени (по умолчанию 15 минут)
  max: env.rateLimitMaxRequests, // Максимум запросов в окно
  message: {
    error: 'Слишком много запросов с этого IP адреса. Пожалуйста, повторите попытку позже.',
    retryAfter: env.rateLimitWindowMs / 1000,
  },
  standardHeaders: true, // Вернуть информацию о rate limit в RateLimit-* headers
  legacyHeaders: false, // Отключить X-RateLimit-* headers
  skip: (req) => {
    // Не применять rate limit для health check
    return req.path === '/health';
  },
});

// Строгий rate limiter для аутентификации (защита от брутфорса)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Максимум 5 попыток входа за 15 минут
  message: {
    error: 'Слишком много попыток входа. Попробуйте позже.',
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Не считать успешные запросы
});

// Rate limiter для регистрации (защита от spam)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // Максимум 3 регистрации с одного IP за час
  message: {
    error: 'Слишком много попыток регистрации. Попробуйте позже.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter для загрузки файлов (защита от переполнения хранилища)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // Максимум 10 загрузок в час
  message: {
    error: 'Слишком много загрузок. Повторите попытку позже.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter для создания объявлений
export const listingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 20, // Максимум 20 объявлений в час (для spam protection)
  message: {
    error: 'Слишком много объявлений. Повторите попытку позже.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
