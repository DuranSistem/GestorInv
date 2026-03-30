import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente para usar SOLO en el servidor (API routes, Server Components)
// Usa la SERVICE ROLE KEY - tiene acceso completo, ignora RLS
// NUNCA exponer esta clave al navegador
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
