import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { crearUsuario, obtenerUsuarioPorEmail } from "@/lib/usuarios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NOMBRE_LENGTH = 120;
const MAX_URL_LENGTH = 2048;

export async function POST(req: NextRequest) {
  try {
    // Solo permite crear usuarios a quien acaba de autenticarse con Google
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { email, nombre, avatar_url, google_id } = await req.json();

    // Validación de campos
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // El email del cuerpo debe coincidir con el de la sesión activa
    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (nombre !== null && nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim().length === 0 || nombre.length > MAX_NOMBRE_LENGTH) {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
      }
    }

    if (avatar_url !== null && avatar_url !== undefined) {
      if (typeof avatar_url !== "string" || avatar_url.length > MAX_URL_LENGTH) {
        return NextResponse.json({ error: "URL de avatar inválida" }, { status: 400 });
      }
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
