import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

import { env } from './config/env';
import { pool } from './config/database';
import { generalLimiter } from './config/rateLimit';
import { helmetConfig } from './config/helmet';
import { corsOptions } from './config/cors';
import { compressionMiddleware } from './config/compression';
import { logger, httpLogger } from './config/logger';
import userRoutes from './routes/users';
import listingRoutes from './routes/listings';
import brandRoutes from './routes/brands';
import modelRoutes from './routes/models';
import componentRoutes from './routes/components';
import uploadRoutes from './routes/upload';
import paymentRoutes from './routes/payments';

const app: Express = express();
const PORT = env.port;

// Security headers middleware (should be early in the middleware stack)
app.use(helmetConfig);

// CORS middleware (must be after helmet, before routes)
app.use(cors(corsOptions));

// Response compression middleware
app.use(compressionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Serve static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// HTTP request logging middleware
app.use(httpLogger);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error', err);

  const customErr = err as any;
  if (customErr.status) {
    res.status(customErr.status).json({
      error: customErr.message,
      details: customErr.details || undefined,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: _req.path,
    method: _req.method,
  });
});

// Test database connection
pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect(async (err: Error | undefined, _client?: any, release?: any) => {
  if (err) {
    logger.error('Failed to connect to database:', err);
  } else {
    logger.info('Database connection successful');
    release?.();
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`, {
    port: PORT,
    environment: env.nodeEnv,
    corsOrigin: env.frontendUrl,
  });
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await pool.end();
  logger.info('Server shut down');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await pool.end();
  logger.info('Server shut down');
  process.exit(0);
});
