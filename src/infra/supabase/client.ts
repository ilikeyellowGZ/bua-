import { createClient } from '@supabase/supabase-js';

import { getPublicEnv } from '@/core/config/env';
import type { Database } from '@/infra/supabase/database.types';
import { supabaseSessionStorage } from '@/infra/supabase/session-storage';

let singleton: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (singleton) return singleton;
  const environment = getPublicEnv();
  singleton = createClient<Database>(
    environment.EXPO_PUBLIC_SUPABASE_URL,
    environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: supabaseSessionStorage,
      },
      global: {
        headers: { 'x-client-info': 'bua-expo/0.1.0' },
      },
    },
  );
  return singleton;
}
