import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/ejecutivos — lista usuarios con rol='Ejecutivo'
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Primero obtener el id del rol 'Ejecutivo'
  const { data: rol, error: rolErr } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("nombre", "Ejecutivo")
    .single();

  if (rolErr || !rol) {
    return NextResponse.json({ ejecutivos: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, email")
    .eq("rol_id", rol.id)
    .order("nombre");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ejecutivos: data ?? [] });
}
