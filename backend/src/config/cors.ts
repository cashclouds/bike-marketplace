import { CorsOptions } from 'cors';
import { env } from './env';

/**
 * CORS Configuration
 * Configures allowed origins, credentials, methods, and headers
 */

// Parse allowed origins from environment or use frontend URL
const getAllowedOrigins = (): string[] => {
  // In production, allow frontend URL and known Vercel domains
  if (env.nodeEnv === 'production') {
    return [
      env.frontendUrl,
      'https://bike-marketplace-rho.vercel.app',
      'https://bike-marketplace.vercel.app',
    ];
  }

  // In development, allow multiple origins for flexibility
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  return defaultOrigins;
};

export const corsOptions: CorsOptions = {
  // Allowed origins
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Rejected request from origin: ${origin}`);
      console.warn(`CORS: Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy: ${origin} is not allowed`));
    }
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  // Headers that browsers are allowed to access
  exposedHeaders: [
    'Content-Length',
    'X-Total-Count', // For pagination
    'X-Page-Count',
  ],

  // How long preflight results can be cached (24 hours)
  maxAge: 86400,
};
