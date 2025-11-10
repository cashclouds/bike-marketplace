import winston from 'winston';
import path from 'path';
import { env } from './env';

/**
 * Winston Logger Configuration
 * Provides structured logging with multiple transports
 */

const logDir = path.join(__dirname, '../../logs');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),

  // Error file transport
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),

  // Combined file transport
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: env.logLevel,
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

/**
 * Express middleware for HTTP request logging
 */
export function httpLogger(req: any, res: any, next: any) {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.path}`, {
    method: req.method,
    url: req.path,
    ip: req.ip,
  });

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';

    logger.log(level, `${req.method} ${req.path} ${status}`, {
      method: req.method,
      url: req.path,
      status,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
}

/**
 * Utility functions for logging with context
 */
export const logError = (message: string, error: any, context?: any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    context,
  });
};

export const logWarn = (message: string, context?: any) => {
  logger.warn(message, { context });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, { context });
};

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, { context });
};
