import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente para usar en componentes del navegador ("use client")
// Usa la ANON KEY - solo tiene permisos que definas en RLS
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
