import { NextRequest, NextResponse } from "next/server";

// Ruta intermediaria que recibe los datos del nuevo usuario desde el callback de NextAuth,
// los guarda en una cookie HTTP-only segura y redirige a /register-google sin exponer
// información personal (PII) en la URL.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") ?? "";
  const nombre = searchParams.get("nombre") ?? "";
  const avatar = searchParams.get("avatar") ?? "";
  const googleId = searchParams.get("googleId") ?? "";

  if (!email) {
    return NextResponse.redirect(new URL("/login?error=missing_data", req.url));
  }

  const response = NextResponse.redirect(new URL("/register-google", req.url));

  response.cookies.set("pending_registration", JSON.stringify({ email, nombre, avatar, googleId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutos
    path: "/",
  });

  return response;
}
