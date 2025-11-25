import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Использует Double Submit Cookie pattern для защиты от CSRF атак
 */

export interface CsrfRequest extends Request {
  csrfToken?: string;
}

// Middleware для генерации CSRF токена
export const generateCsrfToken = (_req: CsrfRequest, res: Response, next: NextFunction): void => {
  try {
    // Генерируем новый CSRF токен
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Сохраняем в cookie (для Double Submit Cookie pattern)
    res.cookie('_csrf', csrfToken, {
      httpOnly: false, // Необходимо для доступа из JS (но будет protect от XSS через CSP)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
    });

    _req.csrfToken = csrfToken;
    next();
  } catch (error) {
    res.status(500).json({ error: 'CSRF token generation failed' });
  }
};

// Middleware для верификации CSRF токена (для состояний, изменяющих данные)
export const verifyCsrfToken = (req: CsrfRequest, res: Response, next: NextFunction): void => {
  // CSRF проверка только для методов, которые изменяют данные
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
    next();
    return;
  }

  try {
    // Получаем CSRF токен из cookie
    const tokenFromCookie = req.cookies._csrf;

    // Получаем CSRF токен из request body или header
    const tokenFromRequest = req.body._csrf || req.headers['x-csrf-token'];

    if (!tokenFromCookie || !tokenFromRequest) {
      res.status(403).json({ error: 'CSRF token missing' });
      return;
    }

    // Сравниваем токены
    if (tokenFromCookie !== tokenFromRequest) {
      res.status(403).json({ error: 'CSRF token invalid' });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({ error: 'CSRF verification failed' });
  }
};
