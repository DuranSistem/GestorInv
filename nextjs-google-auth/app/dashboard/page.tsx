import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

// Sc.3: ruta protegida - requiere sesion activa
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userName = session.user?.name ?? "Gestor";
  const userEmail = session.user?.email ?? "";
  const userImage = session.user?.image;
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #E2E8F0",
        position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0.875rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem",
            fontSize: "0.9375rem", fontWeight: 600, color: "#0F172A" }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#0F172A"/>
              <path d="M10 24L18 12L26 24" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5 20H23.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Gestor de Inversiones
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem",
              background: "#F1F5F9", borderRadius: "100px",
              padding: "0.25rem 0.875rem 0.25rem 0.25rem" }}>
              {userImage ? (
                <img src={userImage} alt={userName}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0F172A",
                  color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 600 }}>
                  {initials}
                </div>
              )}
              <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#334155" }}>
                {userName}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0F172A",
            margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
            Bienvenido, {userName.split(" ")[0]}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0 }}>
            Sesion iniciada con <strong style={{ color: "#1E293B" }}>{userEmail}</strong>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Portafolio total", value: "$0" },
            { label: "Rendimiento mensual", value: "0%" },
            { label: "Activos", value: "0" },
            { label: "Alertas", value: "0" },
          ].map((m) => (
            <div key={m.label} style={{ background: "#ffffff", border: "1px solid #E2E8F0",
              borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748B",
                margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {m.label}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0F172A",
                margin: 0, letterSpacing: "-0.02em" }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div style={{ background: "#ffffff", border: "1px dashed #CBD5E1",
          borderRadius: "12px", padding: "3rem 2rem", textAlign: "center",
          color: "#475569", fontSize: "0.9375rem" }}>
          Aun no tienes activos configurados.
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginTop: "0.5rem", marginBottom: 0 }}>
            Agrega tu primer activo para comenzar a gestionar tu portafolio.
          </p>
        </div>
      </div>
    </main>
  );
}
