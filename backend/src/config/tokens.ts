import jwt from 'jsonwebtoken';
import { env } from './env';
import { logger } from './logger';

/**
 * Token Management Configuration
 * Implements JWT with refresh token pattern for enhanced security
 */

export interface TokenPayload {
  id: string;
  email: string;
  user_type: 'individual' | 'business';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Generate access token (short-lived, default 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';

  try {
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: accessTokenExpiry,
      algorithm: 'HS256',
    } as any);

    return token;
  } catch (error) {
    logger.error('Failed to generate access token', error as Error);
    throw new Error('Token generation failed');
  }
}

/**
 * Generate refresh token (long-lived, default 30 days)
 * This token should be stored securely on the server (e.g., in Redis or DB)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '30d';

  try {
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: refreshTokenExpiry,
      algorithm: 'HS256',
    } as any);

    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', error as Error);
    throw new Error('Token generation failed');
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Parse the expiry time of access token (default 15 minutes = 900 seconds)
  const accessTokenExpiry = 15 * 60; // 15 minutes in seconds

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpiry,
  };
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('Invalid access token');
    } else {
      logger.error('Token verification error', error as Error);
    }

    return null;
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('Invalid refresh token');
    } else {
      logger.error('Refresh token verification error', error as Error);
    }

    return null;
  }
}

/**
 * Refresh access token using refresh token
 * In production, you should also check if the refresh token exists in your database/cache
 */
export function refreshAccessToken(refreshToken: string): TokenPair | null {
  try {
    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      logger.warn('Invalid refresh token attempt');
      return null;
    }

    // Generate new token pair
    const newTokenPair = generateTokenPair(payload);

    logger.info('Access token refreshed', {
      userId: payload.id,
      email: payload.email,
    });

    return newTokenPair;
  } catch (error) {
    logger.error('Token refresh failed', error as Error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
