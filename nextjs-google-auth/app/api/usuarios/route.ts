import { NextRequest, NextResponse } from "next/server";
import { crearUsuario, obtenerUsuarioPorEmail } from "@/lib/usuarios";

export async function POST(req: NextRequest) {
  try {
    const { email, nombre, avatar_url, google_id } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Verificar que no exista ya (doble check)
    const existente = await obtenerUsuarioPorEmail(email);
    if (existente) {
      return NextResponse.json({ usuario: existente }, { status: 200 });
    }

    // Crear usuario en Supabase
    const usuario = await crearUsuario({ email, nombre, avatar_url, google_id });

    return NextResponse.json({ usuario }, { status: 201 });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 500 }
    );
  }
}
