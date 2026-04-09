"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import LogoutButton from "./LogoutButton";

const OKOMOSCharts = dynamic(() => import("./OKOMOSCharts"), { ssr: false });

type Screen = "home" | "crear" | "buscar" | "dashboard360";
type DashTab = "overview" | "inversiones" | "inmobiliario" | "seguros" | "planificacion";

interface ClienteRow {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  email: string | null;
  tipo: string;
  ejecutivo: string | null;
  patrimonio: number | null;
}

interface UserInfo {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function OKOMOSDashboard({ user }: { user: UserInfo }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [dashTab, setDashTab] = useState<DashTab>("overview");
  const [clienteNombre, setClienteNombre] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // búsqueda
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<ClienteRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // crear cliente
  const [creating, setCreating] = useState(false);
  const [tipoActivo, setTipoActivo] = useState("Persona Natural");
  const [ejecutivos, setEjecutivos] = useState<{ id: string; nombre: string }[]>([]);

  // form refs
  const fNombre     = useRef<HTMLInputElement>(null);
  const fApellido   = useRef<HTMLInputElement>(null);
  const fRut        = useRef<HTMLInputElement>(null);
  const fEmail      = useRef<HTMLInputElement>(null);
  const fTelefono   = useRef<HTMLInputElement>(null);
  const fNacimiento = useRef<HTMLInputElement>(null);
  const fEjecutivo  = useRef<HTMLSelectElement>(null);
  const fRiesgo     = useRef<HTMLSelectElement>(null);
  const fSegmento   = useRef<HTMLSelectElement>(null);
  const fObs        = useRef<HTMLTextAreaElement>(null);

  // ── Clock ──────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Búsqueda ───────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/clientes?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json.clientes ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(searchQ), 300);
    return () => clearTimeout(t);
  }, [searchQ, runSearch]);

  // ── Cargar ejecutivos al abrir formulario crear ────────
  useEffect(() => {
    if (screen !== "crear") return;
    fetch("/api/ejecutivos")
      .then(r => r.json())
      .then(j => setEjecutivos(j.ejecutivos ?? []));
  }, [screen]);

  // ── Crear cliente ──────────────────────────────────────
  const saveCliente = async () => {
    const nombre   = fNombre.current?.value.trim() ?? "";
    const apellido = fApellido.current?.value.trim() ?? "";
    const rut      = fRut.current?.value.trim() ?? "";
    if (!nombre || !apellido || !rut) {
      showToast("⚠ Nombre, apellido y RUT son obligatorios");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, apellido, rut,
          email:            fEmail.current?.value.trim() || null,
          telefono:         fTelefono.current?.value.trim() || null,
          fecha_nacimiento: fNacimiento.current?.value || null,
          tipo:             tipoActivo,
          ejecutivo_id:     fEjecutivo.current?.value || null,
          perfil_riesgo:    fRiesgo.current?.value || "Moderado",
          segmento:         fSegmento.current?.value || "Personas",
          observaciones:    fObs.current?.value.trim() || null,
        }),
      });
      if (res.ok) {
        // reset form
        [fNombre, fApellido, fRut, fEmail, fTelefono, fNacimiento].forEach(r => { if (r.current) r.current.value = ""; });
        if (fObs.current) fObs.current.value = "";
        setTipoActivo("Persona Natural");
        showToast("✦ Cliente guardado exitosamente en OKOMOS");
        setScreen("home");
      } else {
        const j = await res.json();
        showToast(`⚠ Error: ${j.error}`);
      }
    } catch {
      showToast("⚠ Error al conectar con el servidor");
    } finally {
      setCreating(false);
    }
  };

  const chipClass = (t: string) =>
    t === "Empresa" ? "chip chip-empresa" : t === "Inversionista" ? "chip chip-inv" : "chip chip-persona";

  const userName  = user.name ?? "Asesor";
  const initials  = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // ── TOPBAR ─────────────────────────────────────────────
  const Topbar = (
    <div className="topbar">
      <div className="tb-logo" style={{ cursor: "pointer" }} onClick={() => setScreen("home")}>
        <svg viewBox="0 0 28 28" fill="none">
          <ellipse cx="10" cy="14" rx="7" ry="11" stroke="white" strokeWidth="2" fill="none"/>
          <ellipse cx="18" cy="14" rx="7" ry="11" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        <span className="tb-logo-name">OKOMOS</span>
      </div>

      {/* breadcrumb */}
      <span className="tb-title">
        {screen === "home"       && "Portal Asesor"}
        {screen === "crear"      && "Portal Asesor · Nuevo Cliente"}
        {screen === "buscar"     && "Portal Asesor · Buscar Cliente"}
        {screen === "dashboard360" && "Portal Asesor · Dashboard 360°"}
      </span>

      <div className="tb-right">
        <span className="tb-badge">Asesor</span>
        <span className="tb-clock">{clock}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", borderRadius: 100, padding: "4px 12px 4px 4px" }}>
          {user.image ? (
            <img src={user.image} alt={userName} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initials}</div>
          )}
          <span style={{ fontSize: 12, color: "var(--text)" }}>{userName.split(" ")[0]}</span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // PANTALLA: HOME — 3 opciones
  // ══════════════════════════════════════════════════════
  if (screen === "home") return (
    <>
      {Topbar}
      <div style={{ minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 48 }}>

        {/* Bienvenida */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--teal-l)", marginBottom: 10, fontFamily: "var(--font-h)" }}>OKOMOS · Sistema de Asesoría</div>
          <h1 style={{ fontFamily: "var(--font-h)", fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: ".01em" }}>
            Bienvenido, {userName.split(" ")[0]}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>¿Qué deseas hacer hoy?</p>
        </div>

        {/* Tarjetas de acción */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 20 }}>

          {/* Crear Cliente */}
          <button
            onClick={() => setScreen("crear")}
            style={{ background: "linear-gradient(135deg,#0d2a1e,#142a20)", border: "2px solid var(--green)", borderRadius: 16, padding: "32px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", display: "flex", flexDirection: "column", gap: 16 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(39,174,96,.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = ""; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(39,174,96,.15)", border: "1px solid rgba(39,174,96,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✦</div>
            <div>
              <div style={{ fontFamily: "var(--font-h)", fontSize: 18, fontWeight: 700, color: "var(--green-l)", marginBottom: 6 }}>Crear Cliente</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Registra un nuevo cliente con sus datos personales y perfil comercial.</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--green-l)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Abrir formulario →</div>
          </button>

          {/* Buscar Cliente */}
          <button
            onClick={() => { setScreen("buscar"); setSearchQ(""); setSearchResults(null); }}
            style={{ background: "linear-gradient(135deg,#0d2228,#112830)", border: "2px solid var(--teal)", borderRadius: 16, padding: "32px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", display: "flex", flexDirection: "column", gap: 16 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(42,138,135,.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = ""; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(42,138,135,.15)", border: "1px solid rgba(42,138,135,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>◈</div>
            <div>
              <div style={{ fontFamily: "var(--font-h)", fontSize: 18, fontWeight: 700, color: "var(--teal-l)", marginBottom: 6 }}>Buscar Cliente</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Busca clientes existentes por nombre o RUT y accede a su ficha.</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--teal-l)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Ir al buscador →</div>
          </button>

          {/* Dashboard 360° */}
          <button
            onClick={() => setScreen("dashboard360")}
            style={{ background: "linear-gradient(135deg,#180e3a,#1e1246)", border: "2px solid var(--purple)", borderRadius: 16, padding: "32px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", display: "flex", flexDirection: "column", gap: 16 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(108,92,231,.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = ""; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(108,92,231,.15)", border: "1px solid rgba(108,92,231,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⬡</div>
            <div>
              <div style={{ fontFamily: "var(--font-h)", fontSize: 18, fontWeight: 700, color: "#b8a9ff", marginBottom: 6 }}>Dashboard 360°</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Visión completa del portafolio: inversiones, inmobiliario, seguros y planificación.</div>
            </div>
            <div style={{ fontSize: 11, color: "#b8a9ff", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Ver dashboard →</div>
          </button>

        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  // ══════════════════════════════════════════════════════
  // PANTALLA: CREAR CLIENTE
  // ══════════════════════════════════════════════════════
  if (screen === "crear") return (
    <>
      {Topbar}
      <div style={{ minHeight: "calc(100vh - 54px)", background: "var(--bg)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Back + Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-b)" }}>← Volver</button>
            <div>
              <h1 style={{ fontFamily: "var(--font-h)", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Nuevo Cliente</h1>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0" }}>Registrar cliente en el sistema OKOMOS</p>
            </div>
          </div>

          {/* Form card */}
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

            {/* Section: Datos Personales */}
            <div style={{ padding: "24px 28px 0" }}>
              <div className="form-section-title" style={{ marginBottom: 16 }}>Datos Personales</div>
              <div className="form-grid">
                <div className="field"><label>Nombre *</label><input ref={fNombre} type="text" placeholder="Ej: Juan Carlos" /></div>
                <div className="field"><label>Apellido *</label><input ref={fApellido} type="text" placeholder="Ej: Pérez García" /></div>
                <div className="field"><label>RUT *</label><input ref={fRut} type="text" placeholder="Ej: 12.345.678-9" /></div>
                <div className="field"><label>Fecha de Nacimiento</label><input ref={fNacimiento} type="date" /></div>
                <div className="field"><label>Correo Electrónico</label><input ref={fEmail} type="email" placeholder="Ej: juan@correo.cl" /></div>
                <div className="field"><label>Teléfono</label><input ref={fTelefono} type="tel" placeholder="Ej: +56 9 1234 5678" /></div>
              </div>
            </div>

            {/* Section: Perfil Comercial */}
            <div style={{ padding: "24px 28px 0" }}>
              <div className="form-section-title" style={{ marginBottom: 16 }}>Perfil Comercial</div>
              <div className="form-grid">
                <div className="field">
                  <label>Tipo de Cliente *</label>
                  <div className="type-chips" style={{ marginTop: 6 }}>
                    {["Persona Natural", "Empresa", "Inversionista"].map(t => (
                      <div key={t} className={`type-chip${tipoActivo === t ? " active" : ""}`} onClick={() => setTipoActivo(t)}>{t}</div>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Ejecutivo Asignado</label>
                  <select ref={fEjecutivo}>
                    <option value="">Seleccionar...</option>
                    {ejecutivos.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Perfil de Riesgo</label>
                  <select ref={fRiesgo} defaultValue="Moderado">
                    <option>Conservador</option>
                    <option>Moderado</option>
                    <option>Agresivo</option>
                  </select>
                </div>
                <div className="field">
                  <label>Segmento</label>
                  <select ref={fSegmento}>
                    <option>Personas</option>
                    <option>Empresas</option>
                    <option>Pyme</option>
                    <option>Family Office</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Observaciones */}
            <div style={{ padding: "24px 28px" }}>
              <div className="form-section-title" style={{ marginBottom: 16 }}>Observaciones</div>
              <div className="field">
                <textarea ref={fObs} rows={3} placeholder="Ej: Cliente referido por asesor Rodríguez. Interés en productos de inversión internacional..." />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 28px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setScreen("home")}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: "var(--green)", minWidth: 160 }} onClick={saveCliente} disabled={creating}>
                {creating ? "Guardando..." : "✦ Guardar Cliente"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  // ══════════════════════════════════════════════════════
  // PANTALLA: BUSCAR CLIENTE
  // ══════════════════════════════════════════════════════
  if (screen === "buscar") return (
    <>
      {Topbar}
      <div style={{ minHeight: "calc(100vh - 54px)", background: "var(--bg)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Back + Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-b)" }}>← Volver</button>
            <div>
              <h1 style={{ fontFamily: "var(--font-h)", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Buscar Cliente</h1>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0" }}>Búsqueda por nombre o RUT en la base de datos</p>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Nombre o RUT del cliente</label>
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Ej: Juan Pérez  ó  12.345.678-9"
                  autoFocus
                  style={{ fontSize: 14, padding: "12px 16px" }}
                />
              </div>
              <button className="btn btn-secondary" onClick={() => { setSearchQ(""); setSearchResults(null); }} style={{ height: 44, whiteSpace: "nowrap" }}>
                Limpiar
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {searchLoading && (
              <div className="search-empty" style={{ padding: "48px 24px" }}>Buscando...</div>
            )}
            {!searchLoading && searchResults === null && (
              <div className="search-empty" style={{ padding: "56px 24px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                Ingresa un nombre o RUT para comenzar la búsqueda
              </div>
            )}
            {!searchLoading && searchResults !== null && searchResults.length === 0 && (
              <div className="search-empty" style={{ padding: "48px 24px" }}>No se encontraron clientes con esos criterios</div>
            )}
            {!searchLoading && searchResults && searchResults.length > 0 && (
              <>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--muted)" }}>
                  {searchResults.length} cliente{searchResults.length > 1 ? "s" : ""} encontrado{searchResults.length > 1 ? "s" : ""}
                </div>
                <table className="result-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>RUT</th>
                      <th>Tipo</th>
                      <th>Ejecutivo</th>
                      <th>Patrimonio</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(c => (
                      <tr key={c.id}>
                        <td>
                          <strong style={{ color: "#fff" }}>{c.nombre} {c.apellido}</strong>
                          {c.email && <><br /><span style={{ fontSize: 11, color: "var(--muted)" }}>{c.email}</span></>}
                        </td>
                        <td>{c.rut}</td>
                        <td><span className={chipClass(c.tipo)}>{c.tipo}</span></td>
                        <td style={{ fontSize: 12 }}>{c.ejecutivo ?? "—"}</td>
                        <td style={{ color: "var(--green-l)", fontWeight: 600 }}>
                          {c.patrimonio ? `$${c.patrimonio.toLocaleString("es-CL")}` : "—"}
                        </td>
                        <td>
                          <button className="action-btn" onClick={() => { setClienteNombre(`${c.nombre} ${c.apellido}`); setScreen("dashboard360"); }}>
                            Ver Ficha →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  // ══════════════════════════════════════════════════════
  // PANTALLA: DASHBOARD 360°
  // ══════════════════════════════════════════════════════
  return (
    <>
      {Topbar}
      <div style={{ minHeight: "calc(100vh - 54px)" }}>
        {/* Sub-topbar con botón volver */}
        <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "10px 28px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-b)" }}>← Volver</button>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Vista completa del portafolio del cliente</span>
        </div>
        <OKOMOSCharts activeTab={dashTab} onTabChange={setDashTab} clienteNombre={clienteNombre} />
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
