"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sc.3: si ya hay sesion activa, ir directo al dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Sc.5: mostrar mensaje de error, usuario permanece en login
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("No se pudo completar el inicio de sesion con Google.");
    }
  }, [searchParams]);

  // Sc.2: click inicia redireccion al flujo OAuth de Google
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn("google", { callbackUrl: "/dashboard", redirect: true });
    } catch {
      // Sc.5: error -> mensaje, permanece en login
      setError("No se pudo completar el inicio de sesion con Google.");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ width: 400, height: 280, background: "#fff",
          borderRadius: 16, border: "1px solid #E2E8F0" }} />
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F8FAFC", padding: "1.5rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ background: "#ffffff", border: "1px solid #E2E8F0",
        borderRadius: "16px", width: "100%", maxWidth: "400px" }}>

        {/* Header */}
        <div style={{ padding: "2.5rem 2rem 1.5rem", textAlign: "center",
          borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "inline-flex", marginBottom: "1rem" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#0F172A"/>
              <path d="M10 24L18 12L26 24" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5 20H23.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0F172A",
            margin: "0 0 0.375rem", letterSpacing: "-0.01em" }}>
            Gestor de Inversiones
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0 }}>
            Inicia sesion para acceder a tu portafolio
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "1.75rem 2rem 2rem", display: "flex",
          flexDirection: "column", gap: "1rem" }}>

          {/* Sc.5: banner de error */}
          {error && (
            <div role="alert" aria-live="polite" style={{ display: "flex",
              alignItems: "flex-start", gap: "0.5rem", background: "#FEF2F2",
              border: "1px solid #FECACA", borderRadius: "8px",
              padding: "0.75rem 1rem", color: "#B91C1C", fontSize: "0.8125rem" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Sc.1: boton visible y habilitado */}
          <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isLoading} />

          <p style={{ fontSize: "0.75rem", color: "#94A3B8", textAlign: "center",
            margin: 0, lineHeight: 1.5 }}>
            Al continuar, aceptas nuestros{" "}
            <a href="/terms" style={{ color: "#475569", textDecoration: "underline",
              textUnderlineOffset: "2px" }}>Terminos de Servicio</a>{" "}
            y{" "}
            <a href="/privacy" style={{ color: "#475569", textDecoration: "underline",
              textUnderlineOffset: "2px" }}>Politica de Privacidad</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F8FAFC" }} />
    }>
      <LoginContent />
    </Suspense>
  );
}
