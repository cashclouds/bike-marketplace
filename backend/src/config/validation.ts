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
    .email('validation_email_invalid')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'validation_password_min_8')
    .max(128, 'validation_password_max_128'),
  name: z
    .string()
    .min(2, 'validation_name_min_2')
    .max(100, 'validation_name_max_100'),
  user_type: z
    .enum(['individual', 'business'])
    .optional()
    .default('individual'),
  phone: z
    .string()
    .max(20, 'validation_phone_max_20')
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('validation_email_invalid')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'validation_password_required'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'validation_name_min_2')
    .max(100, 'validation_name_max_100')
    .optional(),
  email: z
    .string()
    .email('validation_email_invalid')
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .max(20, 'validation_phone_max_20')
    .optional()
    .nullable(),
});

// ========================================
// Listing Validation Schemas
// ========================================

export const createListingSchema = z.object({
  brand: z
    .string()
    .min(1, 'validation_brand_required'),
  model: z
    .string()
    .min(1, 'validation_model_required')
    .optional(),
  year: z
    .string()
    .or(z.number())
    .transform((val) => typeof val === 'string' ? parseInt(val, 10) : val)
    .pipe(
      z
        .number()
        .min(1900, 'validation_year_min_1900')
        .max(new Date().getFullYear() + 1, 'validation_year_max_future')
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
        .positive('validation_price_positive')
        .max(1000000, 'validation_price_max_1000000')
    ),
  description: z
    .string()
    .min(10, 'validation_description_min_10')
    .max(2000, 'validation_description_max_2000')
    .optional(),
  location: z
    .string()
    .min(2, 'validation_location_min_2')
    .max(100, 'validation_location_max_100'),
  type: z
    .enum(['road', 'mountain', 'hybrid', 'cruiser', 'bmx', 'electric'])
    .optional(),
  frame_size: z
    .string()
    .max(20, 'validation_frame_size_max_20')
    .optional(),
  frame_material: z
    .string()
    .max(50, 'validation_frame_material_max_50')
    .optional(),
  seller_phone: z
    .string()
    .max(20, 'validation_seller_phone_max_20')
    .optional()
    .nullable(),
  seller_telegram: z
    .string()
    .max(100, 'validation_seller_telegram_max_100')
    .optional()
    .nullable(),
  seller_whatsapp: z
    .string()
    .max(20, 'validation_seller_whatsapp_max_20')
    .optional()
    .nullable(),
  seller_email: z
    .string()
    .email('validation_email_invalid')
    .max(255, 'validation_seller_email_max_255')
    .optional()
    .nullable(),
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
  minYear: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1900))
    .optional(),
  maxYear: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().max(new Date().getFullYear() + 1))
    .optional(),
  material: z.string().optional(),
  wheelSize: z.string().optional(),
  frameSize: z.string().optional(),
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
