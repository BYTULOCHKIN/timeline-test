import { z } from 'zod';

export type EnvSchema = z.infer<typeof envSchema>;
export const envSchema = z.object({
    VITE_API_URL: z.string(),
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),
    VITE_TURNSTILE_SITE_KEY: z.string().min(1),
});
