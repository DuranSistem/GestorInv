"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  LineController,
  BarController,
} from "chart.js";

Chart.register(
  ArcElement, LineElement, BarElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
  DoughnutController, LineController, BarController
);

type DashTab = "overview" | "inversiones" | "inmobiliario" | "seguros" | "planificacion";

interface Props {
  activeTab: DashTab;
  onTabChange: (t: DashTab) => void;
  clienteNombre?: string | null;
}

const C = { navy: "#1a3460", gold: "#c9a84c", teal: "#2a8a87", red: "#c0392b", green: "#27ae60" };

// ── Helper components ──────────────────────────────────
function KPI({ label, val, sub }: { label: string; val: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#1a3460,#1e4080)", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,.15)", overflow: "hidden" }}>
      <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{val}</div>
      <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,.45)" }}>{sub}</div>
    </div>
  );
}

function OCard({ title, sub, children, borderColor }: { title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode; borderColor?: string }) {
  return (
    <div className="o-card" style={borderColor ? { borderTop: `3px solid ${borderColor}` } : undefined}>
      <div className="o-card-hdr">
        <span className="o-card-title">{title}</span>
        {sub && <span className="o-card-sub">{sub}</span>}
      </div>
      <div className="o-card-body">{children}</div>
    </div>
  );
}

function PortRow({ label, val }: { label: string; val: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #e8edf5" }}>
      <span style={{ color: "#4a6080" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{val}</span>
    </div>
  );
}

function AlertItem({ icon, type, text, sub }: { icon: string; type: "danger" | "warn" | "info"; text: string; sub: string }) {
  const bg = type === "danger" ? "#fce8e8" : type === "warn" ? "#fff3e0" : "#e8f5fe";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: "1px solid #e8edf5" }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#0f2240" }}>{text}</div>
        <div style={{ fontSize: 10, color: "#7a90b0", marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

function EvItem({ icon, bg, name, date }: { icon: string; bg: string; name: string; date: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #e8edf5" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "#4a6080" }}>{name}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f2240" }}>{date}</div>
      </div>
    </div>
  );
}

function PlanRow({ color, name, statusClass, statusLabel }: { color: string; name: string; statusClass: string; statusLabel: string }) {
  const styles: Record<string, string> = {
    "status-active":  "background:#e8f4ee;color:#2a7a4a;",
    "status-pending": "background:#fff3e0;color:#b45309;",
    "status-review":  "background:#fce8e8;color:#c0392b;",
  };
  const s = styles[statusClass] ?? "";
  const [bg, col] = s.split(";").map(x => x.split(":")[1]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #e8edf5" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{name}</span>
      <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: bg, color: col }}>{statusLabel}</span>
    </div>
  );
}

function EvCard({ icon, name, date, statusClass, label }: { icon: string; name: string; date: string; statusClass: string; label: string }) {
  const styles: Record<string, { bg: string; col: string }> = {
    "status-active":  { bg: "#e8f4ee", col: "#2a7a4a" },
    "status-pending": { bg: "#fff3e0", col: "#b45309" },
    "status-review":  { bg: "#fce8e8", col: "#c0392b" },
  };
  const s = styles[statusClass] ?? { bg: "#e8edf5", col: "#4a6080" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5, padding: 10, background: "#e8edf5", borderRadius: 8 }}>
      <div style={{ fontSize: 14 }}>{icon}</div>
      <div style={{ fontSize: 10, color: "#4a6080" }}>{name}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f2240" }}>{date}</div>
      <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: s.bg, color: s.col }}>{label}</span>
    </div>
  );
}

function AssetRow({ name, tipo, chipBg, chipColor, val, rend }: { name: string; tipo: string; chipBg: string; chipColor: string; val: string; rend: string }) {
  return (
    <tr>
      <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}><strong>{name}</strong></td>
      <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}><span style={{ background: chipBg, color: chipColor, padding: "2px 7px", borderRadius: 20, fontSize: 9, fontWeight: 500 }}>{tipo}</span></td>
      <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}>{val}</td>
      <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5", color: "#27ae60", fontWeight: 600 }}>{rend}</td>
    </tr>
  );
}

function CobBar({ name, val, pct, color }: { name: string; val: string; pct: number; color: string }) {
  return (
    <div style={{ margin: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ fontWeight: 500 }}>{name}</span>
        <span style={{ fontWeight: 600, color: "#0f2240" }}>{val}</span>
      </div>
      <div style={{ height: 5, background: "#d0d8e8", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}

function LegRow({ color, label, pct }: { color: string; label: string; pct: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a6080" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
        {label}
      </span>
      <span style={{ fontWeight: 600, color: "#0f2240" }}>{pct}</span>
    </div>
  );
}

// ── Donut chart ──────────────────────────────────────────
function DonutChart({ id, data, labels, colors }: { id: string; data: number[]; labels: string[]; colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: "#fff", hoverOffset: 6 }] },
      options: { cutout: "68%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` } } }, animation: { animateRotate: true, duration: 900 } },
    });
    return () => chartRef.current?.destroy();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} />;
}

function LineChart({ id, labels, datasets, height = 130 }: { id: string; labels: string[]; datasets: { label: string; data: number[]; color: string; dash?: boolean; fill?: boolean }[]; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: datasets.map(d => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.fill ? `${d.color}15` : "transparent",
          borderWidth: 2,
          fill: d.fill ?? false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: C.gold,
          ...(d.dash ? { borderDash: [4, 4] } : {}),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: "rgba(0,0,0,.05)" }, ticks: { font: { size: 10 }, callback: v => "$" + Math.round(Number(v) / 1000) + "K" } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div style={{ height }}><canvas ref={ref} /></div>;
}

function BarChart({ id, labels, datasets, height = 120, pct = false }: { id: string; labels: string[]; datasets: { label: string; data: number[]; color: string }[]; height?: number; pct?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: datasets.map(d => ({ label: d.label, data: d.data, backgroundColor: d.color, borderRadius: 4 })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 9 }, boxWidth: 8 } } },
        scales: {
          x: { ticks: { font: { size: 9 } }, grid: { display: false } },
          y: { ticks: { font: { size: 9 }, callback: v => pct ? `${v}%` : "$" + Math.round(Number(v) / 1000) + "K" }, grid: { color: "rgba(0,0,0,.04)" } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div style={{ height }}><canvas ref={ref} /></div>;
}

// ── Overview ─────────────────────────────────────────────
function Overview() {
  const months = ["Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb"];
  return (
    <div style={{ padding: "18px 22px 32px", display: "grid", gridTemplateColumns: "240px 1fr 220px", gap: 14, background: "#edf1f8" }}>
      <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <KPI label="Patrimonio Total" val="$4,750,000" sub={<span style={{ background: "rgba(39,174,96,.18)", color: "#2ecc71", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>▲ +7.8% YTD</span>} />
        <KPI label="Rentabilidad YTD" val={<span style={{ color: "#2ecc71" }}>+7.8%</span>} sub="Portafolio combinado" />
        <KPI label="Perfil de Riesgo" val={<><span style={{ color: "#c9a84c" }}>◆</span> Moderado</>} sub="Última revisión: Feb 2026" />
        <KPI label="Liquidez Disponible" val="$320,000" sub={<span style={{ background: "rgba(201,168,76,.18)", color: "#c9a84c", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>6.7% del patrimonio</span>} />
      </div>
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Distribución de Activos" sub="4 clases">
          <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto" }}>
            <DonutChart id="ov-donut" data={[45,30,15,10]} labels={["Inversiones","Inmobiliario","Liquidez","Seguros"]} colors={[C.navy,C.gold,C.teal,C.red]} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f2240" }}>100%</div>
              <div style={{ fontSize: 9, color: "#7a90b0", textTransform: "uppercase", letterSpacing: ".1em" }}>Total</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <LegRow color={C.navy} label="Inversiones" pct="45%" />
            <LegRow color={C.gold} label="Inmobiliario" pct="30%" />
            <LegRow color={C.teal} label="Liquidez" pct="15%" />
            <LegRow color={C.red} label="Seguros" pct="10%" />
          </div>
        </OCard>
        <OCard title="Portafolio de Inversiones">
          <PortRow label="Valor Actual" val="$2,150,000" />
          <PortRow label="Rentabilidad" val={<span style={{ color: "#27ae60" }}>+8.2% ▲</span>} />
          <PortRow label="Volatilidad" val={<span style={{ color: "#c9a84c" }}>7.5%</span>} />
          <PortRow label="Benchmark" val="S&P 500 +5.4%" />
          <PortRow label="Alpha" val={<span style={{ color: "#27ae60" }}>+2.8%</span>} />
        </OCard>
        <OCard title="Cobertura de Seguros">
          {[["🛡","Vida","$1,200,000"],["🏥","Salud Global","$800,000"],["🏛","Patrimonial","$600,000"]].map(([icon,name,val]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #e8edf5" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 8 }}>{icon}</div>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0f2240" }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <CobBar name="Vida" val="$1.2M" pct={92} color={C.navy} />
            <CobBar name="Salud" val="$800K" pct={62} color={C.teal} />
            <CobBar name="Patrimonial" val="$600K" pct={46} color={C.gold} />
          </div>
        </OCard>
      </div>
      {/* CENTER */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Resumen Inmobiliario" sub="2 propiedades">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "#e8edf5", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "#7a90b0", textTransform: "uppercase", letterSpacing: ".1em" }}>Valor</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f2240" }}>$1,430,000</div>
              <div style={{ fontSize: 10, color: "#4a6080" }}>30% patrimonio</div>
            </div>
            <div style={{ background: "#e8edf5", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "#7a90b0", textTransform: "uppercase", letterSpacing: ".1em" }}>Renta Anual</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#27ae60" }}>5.2%</div>
              <div style={{ fontSize: 10, color: "#4a6080" }}>2 propiedades</div>
            </div>
          </div>
          <div style={{ height: 6, background: "#d0d8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: "68%", height: "100%", background: `linear-gradient(90deg,${C.navy},${C.gold})`, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#7a90b0", marginTop: 4 }}><span>Miami $750K</span><span>Santiago $680K</span></div>
        </OCard>
        <OCard title="Evolución Portafolio 12M" sub={<span style={{ color: "#27ae60", fontWeight: 600 }}>+8.2%</span>}>
          <LineChart id="ov-line" labels={months} datasets={[
            { label: "Portafolio", data: [1980,2020,1990,2050,2080,2030,2100,2090,2130,2110,2140,2150], color: C.navy, fill: true },
            { label: "Benchmark", data: [1980,1995,1988,2005,2020,2010,2030,2025,2040,2035,2045,2050], color: C.gold, dash: true },
          ]} />
        </OCard>
        <OCard title="Detalle de Activos" sub="5 posiciones">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ background: "#0f2240" }}>
              {["Activo","Tipo","Valor","Rend."].map((h,i) => (
                <th key={h} style={{ padding: "7px 10px", color: "rgba(255,255,255,.7)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, textAlign: "left", borderRadius: i === 0 ? "6px 0 0 0" : i === 3 ? "0 6px 0 0" : 0 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <AssetRow name="Fondo Global Equity" tipo="Acciones" chipBg="#e8f5fe" chipColor="#1a6fad" val="$850,000" rend="+12.5%" />
              <AssetRow name="Fondo Renta Fija" tipo="Bono" chipBg="#fff3e0" chipColor="#b45309" val="$600,000" rend="+4.0%" />
              <AssetRow name="Depto Miami" tipo="Inmobiliario" chipBg="#e8f4ee" chipColor="#2a7a4a" val="$750,000" rend="+6.8%" />
              <AssetRow name="Oficina Santiago" tipo="Inmobiliario" chipBg="#e8f4ee" chipColor="#2a7a4a" val="$680,000" rend="+5.5%" />
              <AssetRow name="Cuenta Corriente" tipo="Liquidez" chipBg="#e8edf5" chipColor="#6a849e" val="$320,000" rend="+0.5%" />
            </tbody>
          </table>
        </OCard>
        <OCard title="Planificación Financiera">
          <PlanRow color="#27ae60" name="Plan Sucesorio" statusClass="status-active" statusLabel="Activo" />
          <PlanRow color="#c9a84c" name="Plan Tributario" statusClass="status-pending" statusLabel="En revisión" />
          <PlanRow color="#2a8a87" name="Educación Hijos" statusClass="status-active" statusLabel="Activo" />
          <PlanRow color="#c0392b" name="Seguro de Vida" statusClass="status-review" statusLabel="Insuficiente" />
        </OCard>
      </div>
      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title={<span style={{ color: "#c0392b" }}>🔔 Alertas & Recomendaciones</span>} borderColor="#c0392b">
          <AlertItem icon="⚠️" type="warn" text="Rebalanceo Recomendado" sub="Acciones sobreponderadas +3%" />
          <AlertItem icon="🚨" type="danger" text="Seguro de vida Insuficiente" sub="Cobertura recomendada: $2M USD" />
          <AlertItem icon="📋" type="warn" text="Revisión Fiscal Pendiente" sub="Plazo vencimiento: 30 Abril" />
        </OCard>
        <OCard title="📅 Próximos Eventos">
          <EvItem icon="📊" bg={C.navy} name="Reunión Anual" date="15 Agosto" />
          <EvItem icon="📄" bg={C.gold} name="Vencimiento Póliza" date="30 Agosto" />
          <EvItem icon="💰" bg={C.teal} name="Pago Dividendos" date="5 Septiembre" />
          <EvItem icon="🏛" bg="#1e4080" name="Revisión Tributaria" date="20 Octubre" />
        </OCard>
        <OCard title="Rendimientos vs. Benchmark">
          <BarChart id="ov-bar" labels={["Global Eq","Renta Fija","Miami","Stgo","Cta Cte"]} datasets={[
            { label: "Rendimiento", data: [12.5,4.0,6.8,5.5,0.5], color: C.navy },
            { label: "Benchmark", data: [9.7,3.2,5.0,4.5,0.4], color: "rgba(192,57,43,0.25)" },
          ]} pct />
        </OCard>
        <button onClick={() => alert("Acción registrada: Rebalanceo solicitado")} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#c9a84c,#e8c96d)", border: "none", borderRadius: 8, fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "#0f2240", cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase", boxShadow: "0 4px 16px rgba(201,168,76,.3)" }}>
          ⚖ Rebalancear Portafolio
        </button>
      </div>
    </div>
  );
}

// ── Inversiones ──────────────────────────────────────────
function Inversiones() {
  const m24 = ["Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb"];
  return (
    <div style={{ padding: "18px 22px 32px", display: "grid", gridTemplateColumns: "1fr 220px", gap: 14, background: "#edf1f8" }}>
      <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <KPI label="Valor Portafolio" val="$2,150,000" sub={<span style={{ background: "rgba(39,174,96,.18)", color: "#2ecc71", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>+8.2% YTD</span>} />
        <KPI label="Fondo Global Equity" val={<span style={{ color: "#2ecc71" }}>$850,000</span>} sub="+12.5%" />
        <KPI label="Fondo Renta Fija" val="$600,000" sub="+4.0%" />
        <KPI label="Volatilidad" val={<span style={{ color: "#c9a84c" }}>7.5%</span>} sub="Perfil Moderado" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Evolución 24 Meses">
          <LineChart id="inv-line" labels={m24} height={180} datasets={[
            { label: "Portafolio", data: [1750,1800,1780,1820,1860,1840,1900,1890,1930,1910,1950,1980,1980,2020,1990,2050,2080,2030,2100,2090,2130,2110,2140,2150], color: C.navy, fill: true },
          ]} />
        </OCard>
        <OCard title="Composición del Portafolio">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ background: "#0f2240" }}>
              {["Fondo","Clase","Valor","Peso","Rend."].map(h => (
                <th key={h} style={{ padding: "7px 10px", color: "rgba(255,255,255,.7)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                { n: "Fondo Global Equity", t: "Acciones", bg: "#e8f5fe", col: "#1a6fad", v: "$850,000", p: "39.5%", r: "+12.5%" },
                { n: "Fondo Renta Fija",    t: "Bono",     bg: "#fff3e0", col: "#b45309", v: "$600,000", p: "27.9%", r: "+4.0%" },
                { n: "Cuenta Corriente",    t: "Liquidez", bg: "#e8edf5", col: "#6a849e", v: "$320,000", p: "14.9%", r: "+0.5%" },
                { n: "Depto Miami",         t: "Inmobiliario", bg: "#e8f4ee", col: "#2a7a4a", v: "$750,000", p: "34.9%", r: "+6.8%" },
                { n: "Oficina Santiago",    t: "Inmobiliario", bg: "#e8f4ee", col: "#2a7a4a", v: "$680,000", p: "31.6%", r: "+5.5%" },
              ].map(row => (
                <tr key={row.n}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}><strong>{row.n}</strong></td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}><span style={{ background: row.bg, color: row.col, padding: "2px 7px", borderRadius: 20, fontSize: 9, fontWeight: 500 }}>{row.t}</span></td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}>{row.v}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5" }}>{row.p}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #e8edf5", color: "#27ae60", fontWeight: 600 }}>{row.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </OCard>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Distribución por Clase">
          <div style={{ height: 170 }}>
            <DonutChart id="inv-donut" data={[39.5,27.9,14.9,34.9]} labels={["Global Equity","Renta Fija","Liquidez","Inmobiliario"]} colors={[C.navy,C.gold,C.teal,C.green]} />
          </div>
        </OCard>
        <OCard title="Indicadores Clave">
          <PortRow label="Sharpe Ratio" val={<span style={{ color: "#27ae60" }}>1.42</span>} />
          <PortRow label="Alpha vs S&P" val={<span style={{ color: "#27ae60" }}>+2.8%</span>} />
          <PortRow label="Beta" val="0.78" />
          <PortRow label="Max Drawdown" val={<span style={{ color: "#c0392b" }}>-4.2%</span>} />
          <PortRow label="Horizonte" val="5+ años" />
        </OCard>
        <button onClick={() => alert("Rebalanceo solicitado")} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#c9a84c,#e8c96d)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#0f2240", cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase" }}>⚖ Rebalancear</button>
      </div>
    </div>
  );
}

// ── Inmobiliario ─────────────────────────────────────────
function Inmobiliario() {
  const months = ["Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb"];
  return (
    <div style={{ padding: "18px 22px 32px", display: "grid", gridTemplateColumns: "1fr 220px", gap: 14, background: "#edf1f8" }}>
      <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <KPI label="Valor Total Propiedades" val="$1,430,000" sub={<span style={{ background: "rgba(39,174,96,.18)", color: "#2ecc71", padding: "2px 8px", borderRadius: 20, fontSize: 10 }}>2 propiedades</span>} />
        <KPI label="Renta Anual" val={<span style={{ color: "#2ecc71" }}>5.2%</span>} sub="Cap rate promedio" />
        <KPI label="Depto Miami" val="$750,000" sub="+6.8% YTD" />
        <KPI label="Oficina Santiago" val="$680,000" sub="+5.5% YTD" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Valorización Propiedades – 12M">
          <BarChart id="inm-bar" labels={months} height={170} datasets={[
            { label: "Depto Miami",       data: [700,710,715,720,725,730,728,735,738,740,745,750], color: C.navy },
            { label: "Oficina Santiago",  data: [640,645,648,652,655,658,660,663,667,670,675,680], color: C.gold },
          ]} />
        </OCard>
        <OCard title="Detalle por Propiedad">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ background: "#0f2240" }}>
              {["Propiedad","Ubicación","Valor","Renta","Estado"].map(h => (
                <th key={h} style={{ padding: "7px 10px", color: "rgba(255,255,255,.7)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                { n: "Depto Miami Beach", ub: "🇺🇸 Miami, USA", v: "$750,000", r: "6.8%" },
                { n: "Oficina Las Condes", ub: "🇨🇱 Santiago, CL", v: "$680,000", r: "5.5%" },
              ].map(row => (
                <tr key={row.n}>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}><strong>{row.n}</strong></td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}>{row.ub}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}>{row.v}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5", color: "#27ae60", fontWeight: 600 }}>{row.r}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}><span style={{ background: "#e8f4ee", color: "#2a7a4a", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>Activo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </OCard>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Distribución Inmobiliaria">
          <div style={{ height: 140 }}>
            <DonutChart id="inm-donut" data={[750,680]} labels={["Depto Miami","Oficina Santiago"]} colors={[C.navy,C.gold]} />
          </div>
        </OCard>
        <OCard title="Métricas">
          <PortRow label="Cap Rate Prom." val={<span style={{ color: "#27ae60" }}>5.2%</span>} />
          <PortRow label="% del Patrimonio" val="30.1%" />
          <PortRow label="Deuda Asociada" val="$0" />
          <PortRow label="Divisa Exposición" val="USD / CLP" />
        </OCard>
      </div>
    </div>
  );
}

// ── Seguros ──────────────────────────────────────────────
function Seguros() {
  return (
    <div style={{ padding: "18px 22px 32px", display: "grid", gridTemplateColumns: "1fr 220px", gap: 14, background: "#edf1f8" }}>
      <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <KPI label="Cobertura Total" val="$2,600,000" sub={<span style={{ background: "rgba(201,168,76,.18)", color: "#c9a84c", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>3 pólizas activas</span>} />
        <KPI label="Seguro de Vida" val="$1,200,000" sub="USD – Planificación Sucesoria" />
        <KPI label="Salud Global" val="$800,000" sub="Sin fronteras" />
        <KPI label="Patrimonial" val="$600,000" sub="Rentas por Incapacidad" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title={<span style={{ color: "#c0392b" }}>⚠ Alerta: Seguro de Vida Insuficiente</span>} borderColor="#c0392b">
          <p style={{ fontSize: 12, color: "#4a6080", marginBottom: 10 }}>Cobertura recomendada: <strong>USD 2,000,000</strong>. Actual: $1,200,000 — brecha de <strong style={{ color: "#c0392b" }}>$800,000</strong>.</p>
          <div style={{ height: 8, background: "#d0d8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg,#c0392b,#c9a84c)", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#7a90b0", marginTop: 4 }}><span>Actual: $1.2M</span><span>Recomendada: $2.0M</span></div>
        </OCard>
        <OCard title="Detalle de Pólizas">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ background: "#0f2240" }}>
              {["Tipo","Cobertura","Prima Anual","Vencimiento","Estado"].map(h => (
                <th key={h} style={{ padding: "7px 10px", color: "rgba(255,255,255,.7)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                { t: "Vida USD",      c: "$1,200,000", p: "$18,000", v: "30 Ago 2026", bg: "#fff3e0", col: "#b45309", s: "Por renovar" },
                { t: "Salud Global",  c: "$800,000",   p: "$9,600",  v: "Dic 2026",   bg: "#e8f4ee", col: "#2a7a4a", s: "Vigente" },
                { t: "Patrimonial",   c: "$600,000",   p: "$7,200",  v: "Mar 2027",   bg: "#e8f4ee", col: "#2a7a4a", s: "Vigente" },
              ].map(row => (
                <tr key={row.t}>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}><strong>{row.t}</strong></td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}>{row.c}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}>{row.p}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}>{row.v}</td>
                  <td style={{ padding: "9px 10px", borderBottom: "1px solid #e8edf5" }}><span style={{ background: row.bg, color: row.col, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>{row.s}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </OCard>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OCard title="Distribución Coberturas">
          <div style={{ height: 140 }}>
            <DonutChart id="seg-donut" data={[1200,800,600]} labels={["Vida","Salud Global","Patrimonial"]} colors={[C.navy,C.teal,C.gold]} />
          </div>
        </OCard>
        <OCard title="Acciones Recomendadas">
          <AlertItem icon="🚨" type="danger" text="Ampliar Seguro de Vida" sub="+$800K para llegar a $2M" />
          <AlertItem icon="📄" type="warn" text="Renovar póliza vida" sub="Vence 30 Agosto 2026" />
        </OCard>
        <button onClick={() => alert("Solicitud de revisión enviada al asesor")} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#c9a84c,#e8c96d)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#0f2240", cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase" }}>📋 Solicitar Revisión</button>
      </div>
    </div>
  );
}

// ── Planificación ────────────────────────────────────────
function Planificacion() {
  return (
    <div style={{ padding: "18px 22px 32px", background: "#edf1f8", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <KPI label="Planes Activos" val="3 / 4" sub={<span style={{ background: "rgba(39,174,96,.18)", color: "#2ecc71", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>75% completado</span>} />
        <KPI label="Próximo Evento" val="15 Agosto" sub="Reunión Anual OKOMOS" />
        <KPI label="Revisión Tributaria" val={<span style={{ color: "#c9a84c" }}>Pendiente</span>} sub="Plazo: 30 Abril 2026" />
        <KPI label="Plan Sucesorio" val={<span style={{ color: "#2ecc71" }}>Activo</span>} sub="Actualizado Feb 2026" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <OCard title={<span style={{ color: "#27ae60" }}>✓ Plan Sucesorio</span>} sub={<span style={{ background: "#e8f4ee", color: "#2a7a4a", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>Activo</span>}>
          <PlanRow color="#27ae60" name="Testamento actualizado" statusClass="status-active" statusLabel="✓" />
          <PlanRow color="#27ae60" name="Sociedad de inversión" statusClass="status-active" statusLabel="✓" />
          <PlanRow color="#c9a84c" name="Fideicomiso hijos" statusClass="status-pending" statusLabel="Revisión" />
          <PlanRow color="#27ae60" name="Poderes notariales" statusClass="status-active" statusLabel="✓" />
        </OCard>
        <OCard title={<span style={{ color: "#c9a84c" }}>⚡ Plan Tributario</span>} sub={<span style={{ background: "#fff3e0", color: "#b45309", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>En revisión</span>}>
          <PlanRow color="#27ae60" name="Declaración renta 2025" statusClass="status-active" statusLabel="✓" />
          <PlanRow color="#c0392b" name="Optimización APV" statusClass="status-review" statusLabel="Pendiente" />
          <PlanRow color="#c9a84c" name="Holding familiar" statusClass="status-pending" statusLabel="En proceso" />
          <PlanRow color="#c0392b" name="Revisión fiscal anual" statusClass="status-review" statusLabel="Urgente" />
        </OCard>
        <OCard title={<span style={{ color: "#2a8a87" }}>🎓 Educación Hijos</span>} sub={<span style={{ background: "#e8f4ee", color: "#2a7a4a", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>Activo</span>}>
          <PlanRow color="#27ae60" name="Fondo educación universitaria" statusClass="status-active" statusLabel="✓" />
          <PlanRow color="#27ae60" name="APV a nombre de hijos" statusClass="status-active" statusLabel="✓" />
          <PlanRow color="#c9a84c" name="Postgrado internacional" statusClass="status-pending" statusLabel="Proyectado" />
          <PlanRow color="#2a8a87" name="Seguro educacional" statusClass="status-active" statusLabel="✓" />
        </OCard>
      </div>
      <OCard title="📅 Agenda de Eventos 2026">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          <EvCard icon="📋" name="Revisión Fiscal" date="30 Abril 2026" statusClass="status-review" label="Urgente" />
          <EvCard icon="📊" name="Reunión Anual OKOMOS" date="15 Agosto 2026" statusClass="status-pending" label="Confirmado" />
          <EvCard icon="📄" name="Vencimiento Póliza Vida" date="30 Agosto 2026" statusClass="status-review" label="Renovar" />
          <EvCard icon="💰" name="Pago Dividendos" date="5 Sept 2026" statusClass="status-active" label="Programado" />
        </div>
      </OCard>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────
export default function OKOMOSCharts({ activeTab, onTabChange, clienteNombre }: Props) {
  const tabs: { id: DashTab; label: string }[] = [
    { id: "overview", label: "Visión General" },
    { id: "inversiones", label: "Inversiones" },
    { id: "inmobiliario", label: "Inmobiliario" },
    { id: "seguros", label: "Seguros" },
    { id: "planificacion", label: "Planificación" },
  ];

  return (
    <div>
      {/* OKOMOS topbar */}
      <div className="okomos-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
            <ellipse cx="10" cy="14" rx="7" ry="11" stroke="white" strokeWidth="2" fill="none"/>
            <ellipse cx="18" cy="14" rx="7" ry="11" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
          <span style={{ fontFamily: "var(--font-b)", fontWeight: 600, letterSpacing: ".18em", fontSize: 12, color: "rgba(255,255,255,.9)", textTransform: "uppercase" }}>OKOMOS</span>
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#fff", fontWeight: 600 }}>Dashboard 360° — {clienteNombre ?? "Cliente"}</div>
        <span style={{ background: "rgba(201,168,76,.18)", border: "1px solid #c9a84c", color: "#c9a84c", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 500, letterSpacing: ".08em" }}>Global Access</span>
      </div>

      {/* OKOMOS tabs */}
      <div className="okomos-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`okomos-tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => onTabChange(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview"      && <Overview />}
      {activeTab === "inversiones"   && <Inversiones />}
      {activeTab === "inmobiliario"  && <Inmobiliario />}
      {activeTab === "seguros"       && <Seguros />}
      {activeTab === "planificacion" && <Planificacion />}
    </div>
  );
}
