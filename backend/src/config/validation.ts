import { z } from 'zod';

/**
 * Валидационные схемы для API запросов
 * Используют Zod для runtime type-safe validation
 */

// ========================================
// User Validation Schemas
// ========================================

export const registerSchema = z.object({
  email: z
    .string()
    .email('Некорректный email')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Пароль должен быть минимум 8 символов')
    .max(128, 'Пароль не может быть больше 128 символов'),
  name: z
    .string()
    .min(2, 'Имя должно быть минимум 2 символа')
    .max(100, 'Имя не может быть больше 100 символов'),
  user_type: z
    .enum(['individual', 'business'])
    .optional()
    .default('individual'),
  phone: z
    .string()
    .max(20, 'Номер телефона не может быть больше 20 символов')
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Некорректный email')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Пароль обязателен'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно быть минимум 2 символа')
    .max(100, 'Имя не может быть больше 100 символов')
    .optional(),
  email: z
    .string()
    .email('Некорректный email')
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .max(20, 'Номер телефона не может быть больше 20 символов')
    .optional()
    .nullable(),
});

// ========================================
// Listing Validation Schemas
// ========================================

export const createListingSchema = z.object({
  brand: z
    .string()
    .min(1, 'Марка не может быть пустой'),
  model: z
    .string()
    .min(1, 'Модель не может быть пустой')
    .optional(),
  year: z
    .string()
    .or(z.number())
    .transform((val) => typeof val === 'string' ? parseInt(val, 10) : val)
    .pipe(
      z
        .number()
        .min(1900, 'Год не может быть раньше 1900')
        .max(new Date().getFullYear() + 1, 'Год не может быть в будущем')
    ),
  condition: z
    .enum(['new', 'like-new', 'used', 'damaged'])
    .optional()
    .default('used'),
  price: z
    .string()
    .or(z.number())
    .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
    .pipe(
      z
        .number()
        .positive('Цена должна быть положительным числом')
        .max(1000000, 'Цена не может превышать 1,000,000')
    ),
  description: z
    .string()
    .min(10, 'Описание должно быть минимум 10 символов')
    .max(2000, 'Описание не может быть больше 2000 символов')
    .optional(),
  location: z
    .string()
    .min(2, 'Местоположение должно быть минимум 2 символа')
    .max(100, 'Местоположение не может быть больше 100 символов'),
  type: z
    .enum(['road', 'mountain', 'hybrid', 'cruiser', 'bmx', 'electric'])
    .optional(),
  frame_size: z
    .string()
    .max(20, 'Размер рамы не может быть больше 20 символов')
    .optional(),
  frame_material: z
    .string()
    .max(50, 'Материал рамы не может быть больше 50 символов')
    .optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const filterListingsSchema = z.object({
  brand_id: z.string().uuid().optional(),
  type: z.string().optional(),
  minPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().nonnegative())
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive())
    .optional(),
  year: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .optional(),
  material: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(100))
    .optional()
    .default(() => 20),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().nonnegative())
    .optional()
    .default(() => 0),
});

// ========================================
// Validation Error Handler
// ========================================

export interface ValidationError {
  field: string;
  message: string;
}

export function formatValidationErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((err: any) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
  }));
}

/**
 * Middleware для валидации request body
 */
export function validateRequest(schema: z.ZodSchema) {
  return async (req: any, res: any, next: any) => {
    try {
      req.validatedBody = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatValidationErrors(error);
        res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
}
