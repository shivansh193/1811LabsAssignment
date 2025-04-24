// In supabase-client.ts, ensure proper client setup:
import { createBrowserClient } from '@supabase/ssr';

export const browserClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name) {
        return document.cookie
          .split('; ')
          .find((c) => c.startsWith(`${name}=`))
          ?.split('=')[1];
      },
      set(name, value, options) {
        document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 31536000}; SameSite=${options.sameSite || 'Lax'}`;
      },
      remove(name, options) {
        document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      },
    },
  }
);