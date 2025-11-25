import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../config/tokens';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_type: 'individual' | 'business';
  };
  file?: any;
  files?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Try to get token from Authorization header first (for backward compatibility)
    let token = extractTokenFromHeader(req.headers.authorization);

    // If not found in header, try to get from httpOnly cookie
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    // Try to get token from Authorization header first
    let token = extractTokenFromHeader(req.headers.authorization);

    // If not found in header, try to get from httpOnly cookie
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
  } catch (error) {
    // Token invalid, but optional so continue
  }

  next();
};
