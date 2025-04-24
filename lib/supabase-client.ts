// lib/supabase-client.js
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// For server components and non-browser environments
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// For client components (browser)
// Let Supabase handle cookie naming automatically based on project reference
export const browserClient = createClientComponentClient();