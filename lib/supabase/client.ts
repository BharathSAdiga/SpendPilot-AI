/**
 * lib/supabase/client.ts
 *
 * Singleton Supabase clients — browser-safe (anon key) and server-side
 * (service-role key for trusted API routes).
 *
 * Usage:
 *   import { supabase }        from "@/lib/supabase/client";        // browser / RSC
 *   import { supabaseAdmin }   from "@/lib/supabase/client";        // API routes only
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ─── Environment validation ───────────────────────────────────────────────────

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!;  // server-only

if (!supabaseUrl || !anonKey) {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Database features will not work until you configure them."
  );
}

// ─── Browser / RSC client (anon key, respects RLS) ───────────────────────────

export const supabase = supabaseUrl && anonKey 
  ? createClient<Database>(supabaseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as unknown as Database);

// ─── Server-only admin client (service-role key, bypasses RLS) ───────────────
// NEVER import this in Client Components or expose it to the browser.

export const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient<Database>(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })
  : null;
