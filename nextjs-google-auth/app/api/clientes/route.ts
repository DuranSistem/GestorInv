import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/clientes?q=texto  — buscar clientes del asesor logueado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  // Obtener el id del asesor logueado
  const { data: usuario, error: userErr } = await supabaseAdmin
    .from("usuarios")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (userErr || !usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  let query = supabaseAdmin
    .from("clientes")
    .select("id, nombre, apellido, rut, email, tipo, ejecutivo_id, ejecutivo_usuario:usuarios!ejecutivo_id ( nombre ), patrimonio")
    .eq("usuario_id", usuario.id)
    .order("creado_en", { ascending: false });

  if (q) {
    query = query.or(
      `nombre.ilike.%${q}%,apellido.ilike.%${q}%,rut.ilike.%${q}%`
    );
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clientes = (data ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    ejecutivo: (c.ejecutivo_usuario as { nombre?: string } | null)?.nombre ?? null,
    ejecutivo_usuario: undefined,
  }));

  return NextResponse.json({ clientes });
}

// POST /api/clientes  — crear nuevo cliente
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { nombre, apellido, rut, email, telefono, fecha_nacimiento, tipo, ejecutivo_id, perfil_riesgo, segmento, observaciones } = body as Record<string, string>;

  // Validaciones básicas
  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  if (!apellido || typeof apellido !== "string" || apellido.trim().length === 0) {
    return NextResponse.json({ error: "El apellido es requerido" }, { status: 400 });
  }
  if (!rut || typeof rut !== "string" || rut.trim().length === 0) {
    return NextResponse.json({ error: "El RUT es requerido" }, { status: 400 });
  }

  // Obtener usuario_id del asesor
  const { data: usuario, error: userErr } = await supabaseAdmin
    .from("usuarios")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (userErr || !usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { data: cliente, error } = await supabaseAdmin
    .from("clientes")
    .insert({
      usuario_id: usuario.id,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rut: rut.trim(),
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
      fecha_nacimiento: fecha_nacimiento || null,
      tipo: tipo || "Persona Natural",
      ejecutivo_id: ejecutivo_id || null,
      perfil_riesgo: perfil_riesgo || "Moderado",
      segmento: segmento || "Personas",
      observaciones: observaciones?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cliente }, { status: 201 });
}
