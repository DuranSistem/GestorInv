"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// Sc.4: usuario nuevo - registro con datos de Google pre-cargados desde URL
function RegisterGoogleContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Leer datos que vienen desde el callback de Google en la URL
  const email = searchParams.get("email") ?? session?.user?.email ?? "";
  const nombre = searchParams.get("nombre") ?? session?.user?.name ?? "";
  const avatar = searchParams.get("avatar") ?? session?.user?.image ?? "";
  const googleId = searchParams.get("googleId") ?? "";

  useEffect(() => {
    if (status === "unauthenticated" && !email) {
      router.push("/login");
    }
  }, [status, router, email]);

  if (status === "loading") return null;

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      setError(null);

      // Llamar a la API que crea el usuario en Supabase
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre: nombre || null,
          avatar_url: avatar || null,
          google_id: googleId || null,
        }),
      });

      if (!res.ok) throw new Error("Error al registrar");

      router.push("/dashboard");
    } catch {
      setError("No se pudo completar el registro. Intenta nuevamente.");
      setIsRegistering(false);
    }
  };

  const handleCancel = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Datos a mostrar: vienen de la URL o de la sesion
  const displayName = nombre || session?.user?.name || email;
  const displayEmail = email || session?.user?.email || "";
  const displayAvatar = avatar || session?.user?.image || "";

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F8FAFC", padding: "1.5rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ background: "#ffffff", border: "1px solid #E2E8F0",
        borderRadius: "16px", width: "100%", maxWidth: "420px" }}>

        <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0",
          padding: "1.5rem 2rem" }}>
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#1D4ED8",
            fontSize: "0.75rem", fontWeight: 500, padding: "0.25rem 0.75rem",
            borderRadius: "100px", marginBottom: "0.75rem" }}>
            Nuevo usuario
          </span>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#0F172A",
            margin: "0 0 0.375rem" }}>
            Completa tu registro
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0 }}>
            No encontramos una cuenta asociada a este correo. Confirma tus datos para continuar.
          </p>
        </div>

        <div style={{ padding: "1.75rem 2rem 2rem" }}>
          {/* Datos pre-cargados de Google */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem",
            background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px",
            padding: "0.875rem 1rem", marginBottom: "1.25rem" }}>
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName}
                style={{ width: 40, height: 40, borderRadius: "50%",
                  border: "2px solid #E2E8F0" }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%",
                background: "#0F172A", color: "#E2E8F0", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "0.875rem", fontWeight: 600 }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#1E293B", margin: 0 }}>
                {displayName}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: 0 }}>
                {displayEmail}
              </p>
            </div>
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: "8px", padding: "0.75rem 1rem", color: "#B91C1C",
              fontSize: "0.8125rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <button onClick={handleRegister} disabled={isRegistering}
            style={{ width: "100%", padding: "0.6875rem 1rem",
              background: isRegistering ? "#F1F5F9" : "#0F172A",
              color: isRegistering ? "#94A3B8" : "#F8FAFC",
              border: "none", borderRadius: "8px", fontSize: "0.9375rem",
              fontWeight: 500, cursor: isRegistering ? "not-allowed" : "pointer",
              marginBottom: "0.75rem", fontFamily: "inherit" }}>
            {isRegistering ? "Registrando..." : "Crear cuenta y continuar"}
          </button>

          <button onClick={handleCancel}
            style={{ width: "100%", padding: "0.6875rem 1rem",
              background: "transparent", color: "#64748B",
              border: "1px solid #E2E8F0", borderRadius: "8px",
              fontSize: "0.9375rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit" }}>
            Cancelar
          </button>
        </div>
      </div>
    </main>
  );
}

export default function RegisterGooglePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }} />
    }>
      <RegisterGoogleContent />
    </Suspense>
  );
}
