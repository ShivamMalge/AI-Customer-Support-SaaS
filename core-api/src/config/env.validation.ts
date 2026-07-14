import { z } from 'zod';

export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379/0'),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  AI_SERVICE_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envValidationSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envValidationSchema.safeParse(config);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}
