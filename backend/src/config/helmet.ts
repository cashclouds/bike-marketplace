import helmet from 'helmet';
import { env } from './env';

/**
 * Helmet configuration for security headers
 * https://helmetjs.github.io/
 */

export const helmetConfig = helmet({
  // Content Security Policy - защита от XSS и injection атак
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", env.frontendUrl],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },

  // Strict-Transport-Security - принудить HTTPS (только если USE_HTTPS=true)
  hsts: {
    maxAge: 31536000, // 1 год
    includeSubDomains: true,
    preload: env.useHttps,
  },

  // X-Frame-Options - защита от clickjacking
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options - защита от MIME type sniffing
  noSniff: true,

  // X-XSS-Protection - включить встроенную защиту браузера от XSS
  xssFilter: true,

  // Referrer-Policy - контроль информации о реферере
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Note: Permissions-Policy is handled separately via middleware

  // X-DNS-Prefetch-Control - отключить DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options - защита для IE
  ieNoOpen: true,

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
});

/**
 * Additional security headers
 */
export function addSecurityHeaders(_req: any, res: any, next: any) {
  // Disable powered by header
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
}
