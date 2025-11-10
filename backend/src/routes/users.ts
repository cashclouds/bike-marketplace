import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { query } from '../config/database';
import { registerLimiter, authLimiter } from '../config/rateLimit';
import { logger } from '../config/logger';
import {
  registerSchema,
  loginSchema,
  formatValidationErrors,
} from '../config/validation';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateTokenPair, refreshAccessToken } from '../config/tokens';

const router: Router = express.Router();

// Register user (with rate limiting to prevent spam)
router.post('/register', registerLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Валидируем входные данные
    const validatedData = registerSchema.parse(_req.body);
    const { email, password, name, user_type, phone } = validatedData;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await query(
      `INSERT INTO users (id, email, password_hash, name, user_type, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, email, hashedPassword, name, user_type, phone || null]
    );

    // Generate token pair
    const tokenPair = generateTokenPair({ id: userId, email, user_type });

    logger.info('User registered successfully', {
      userId,
      email,
      userType: user_type,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email, name, user_type },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    } else {
      logger.error('Registration error:', error as Error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login user
router.post('/login', authLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Валидируем входные данные
    const validatedData = loginSchema.parse(_req.body);
    const { email, password } = validatedData;

    // Find user
    const result = await query('SELECT id, email, password_hash, name, user_type FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token pair
    const tokenPair = generateTokenPair({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
    });

    logger.info('User login successful', {
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, user_type: user.user_type },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    } else {
      logger.error('Login error:', error as Error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, email, name, user_type, phone, created_at FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    logger.error('Get user error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;

    const result = await query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3 RETURNING id, email, name, user_type, phone',
      [name || null, phone || null, req.user?.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    logger.error('Update user error:', error as Error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Refresh access token
router.post('/refresh', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const newTokenPair = refreshAccessToken(refreshToken);

    if (!newTokenPair) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    logger.info('Access token refreshed successfully');

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
      expiresIn: newTokenPair.expiresIn,
    });
  } catch (error) {
    logger.error('Token refresh error:', error as Error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
