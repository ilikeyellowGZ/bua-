import { z } from 'zod';

export const publicEnvSchema = z
  .object({
    EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'test', 'production']),
    EXPO_PUBLIC_DEMO_MODE: z.enum(['true', 'false']),
  })
  .strict();

export const envSchema = publicEnvSchema;

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type PublicEnvKey = keyof PublicEnv;

const runtimePublicEnvironment: Readonly<Partial<Record<PublicEnvKey, string | undefined>>> = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE,
};

export class ConfigurationError extends Error {
  constructor(variableNames: readonly string[]) {
    super(`Bua configuration is invalid: ${variableNames.join(', ')}`);
    this.name = 'ConfigurationError';
  }
}

export function getPublicEnv(
  source: Readonly<Partial<Record<PublicEnvKey, string | undefined>>> = runtimePublicEnvironment,
): PublicEnv {
  const result = publicEnvSchema.safeParse(source);

  if (!result.success) {
    const variableNames = [
      ...new Set(
        result.error.issues.map((issue) => issue.path.at(0)?.toString() ?? 'public environment'),
      ),
    ].sort();

    throw new ConfigurationError(variableNames);
  }

  return result.data;
}
