import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase/client";
import {
  deleteValuation,
  fetchValuations,
  insertValuation,
  updateValuation,
  type SavedValuation,
  type Scenario,
} from "../../lib/supabase/valuations";

const initialScenarios: Scenario[] = [
  { key: "pes", label: "Pesimista", tone: "bad", eps: "", per: "" },
  { key: "con", label: "Conservador", tone: "warn", eps: "", per: "" },
  { key: "opt", label: "Optimista", tone: "ok", eps: "", per: "" },
];

const hasBackend = isSupabaseConfigured();

function fmtMoney(n: number): string {
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

function fmtPct(n: number): string {
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";
}

function sanitizeNumeric(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

export default function ValuationView() {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedValuation[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const methodologyRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmOpen(false);
      }
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [confirmOpen]);

  const priceNum = parseFloat(price);

  useEffect(() => {
    if (!hasBackend) return;
    fetchValuations()
      .then(setSaved)
      .catch(() => setStatus("No se pudieron cargar las valoraciones guardadas."));
  }, []);

  function updateScenario(key: string, field: "eps" | "per", value: string) {
    setScenarios((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: sanitizeNumeric(value) } : s)),
    );
  }

  function loadValuation(v: SavedValuation) {
    setActiveId(v.id);
    setTicker(v.ticker);
    setPrice(v.price);
    setScenarios(v.scenarios);
    setStatus(null);
    setConfirmOpen(false);
  }

  function newValuation() {
    setActiveId(null);
    setTicker("");
    setPrice("");
    setScenarios(initialScenarios);
    setStatus(null);
    setConfirmOpen(false);
  }

  const numbersComplete = [price, ...scenarios.flatMap((s) => [s.eps, s.per])].every(
    (v) => v.trim() !== "" && parseFloat(v) !== 0,
  );

  async function handleSave() {
    if (!ticker.trim()) {
      setStatus("Ingresa un ticker para guardar");
      return;
    }
    const payload = { id: activeId ?? crypto.randomUUID(), ticker: ticker.trim(), price, scenarios };
    try {
      if (activeId) {
        await updateValuation(payload);
      } else {
        await insertValuation(payload);
        setActiveId(payload.id);
      }
      const fresh = await fetchValuations();
      setSaved(fresh);
      setStatus(activeId ? "Valoración actualizada." : "Valoración guardada.");
    } catch {
      setStatus("No se pudo guardar. Intenta de nuevo.");
    }
  }

  async function handleDelete() {
    if (!activeId) return;
    setConfirmOpen(false);
    try {
      await deleteValuation(activeId);
      setSaved((prev) => prev.filter((v) => v.id !== activeId));
      newValuation();
      setStatus("Valoración eliminada.");
    } catch {
      setStatus("No se pudo eliminar. Intenta de nuevo.");
    }
  }

  return (
    <>
      <section className="mast">
        <span className="tag lbl">Metodología de valoración</span>
        <h1>
          Valoración por <em>múltiplos</em> (PER)
        </h1>
        <p>
          Cómo estimar si una acción está cara o barata comparando su precio con los beneficios
          que genera, y cuánto margen de error tolera tu inversión antes de perder dinero.
        </p>
      </section>

      <div className="body" style={{ padding: "26px 22px 60px" }}>
        {!hasBackend && (
          <div className="tbl note">
            <div className="th">Sin conexión a Supabase</div>
            <ul>
              <li>Faltan las variables de entorno. Las valoraciones no se van a guardar.</li>
            </ul>
          </div>
        )}

        <h4>VALORACIONES GUARDADAS</h4>
        <p style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="xref" onClick={newValuation}>
            + Nueva
          </button>
          {saved.map((v) => (
            <button
              key={v.id}
              className="xref"
              onClick={() => loadValuation(v)}
              style={v.id === activeId ? { fontWeight: 700 } : undefined}
            >
              {v.ticker}
            </button>
          ))}
          {hasBackend && saved.length === 0 && <span>Todavía no hay valoraciones guardadas.</span>}
        </p>

        <h4>CALCULADORA DE ESCENARIOS</h4>
        <div className="tbl">
          <div className="th">Precio actual de la acción</div>
          <ul>
            <li className="calcRow">
              <span>Ticker</span>
              <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="AAPL" />
            </li>
            <li className="calcRow">
              <span>Precio</span>
              <input
                inputMode="decimal"
                value={price}
                placeholder="0"
                onChange={(e) => setPrice(sanitizeNumeric(e.target.value))}
              />
            </li>
          </ul>
        </div>

        {hasBackend && (
          <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="xref" onClick={handleSave} disabled={!numbersComplete}>
              {activeId ? "Actualizar" : "Guardar"}
            </button>
            {activeId && (
              <span ref={confirmRef} style={{ position: "relative", display: "inline-block" }}>
                <button className="xref" onClick={() => setConfirmOpen((o) => !o)}>
                  Eliminar
                </button>
                {confirmOpen && (
                  <span
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 10,
                      background: "var(--panel2)",
                      border: "1px solid var(--line)",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>¿Eliminar "{ticker}"?</span>
                    <span style={{ display: "flex", gap: 8 }}>
                      <button className="xref" onClick={handleDelete}>
                        Sí, eliminar
                      </button>
                      <button className="xref" onClick={() => setConfirmOpen(false)}>
                        Cancelar
                      </button>
                    </span>
                  </span>
                )}
              </span>
            )}
            {status && <span>{status}</span>}
          </p>
        )}

        <div className="scengrid">
          {scenarios.map((s) => {
            const eps = parseFloat(s.eps);
            const per = parseFloat(s.per);
            const vi = eps * per;
            const potencial = ((vi - priceNum) / priceNum) * 100;
            const margen = ((vi - priceNum) / vi) * 100;
            const breakeven = priceNum / per;
            const tolerancia = ((eps - breakeven) / eps) * 100;

            return (
              <div className={`tbl ${s.tone}`} key={s.key}>
                <div className="th">{s.label}</div>
                <ul>
                  <li className="calcRow">
                    <span>EPS proyectado</span>
                    <input
                      inputMode="decimal"
                      value={s.eps}
                      placeholder="0"
                      onChange={(e) => updateScenario(s.key, "eps", e.target.value)}
                    />
                  </li>
                  <li className="calcRow">
                    <span>PER</span>
                    <input
                      inputMode="decimal"
                      value={s.per}
                      placeholder="0"
                      onChange={(e) => updateScenario(s.key, "per", e.target.value)}
                    />
                  </li>
                  <li className="calcRow">
                    <span>Valor intrínseco</span>
                    <b>{fmtMoney(vi)}</b>
                  </li>
                  <li className="calcRow">
                    <span>Potencial de ganancia</span>
                    <b>{fmtPct(potencial)}</b>
                  </li>
                  <li className="calcRow">
                    <span>Margen de seguridad</span>
                    <b>{fmtPct(margen)}</b>
                  </li>
                  <li className="calcRow">
                    <span>EPS breakeven</span>
                    <b>{fmtMoney(breakeven)}</b>
                  </li>
                  <li className="calcRow">
                    <span>Tolerancia al error</span>
                    <b>{fmtPct(tolerancia)}</b>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>

        <p>
          <button
            className="xref"
            onClick={() => methodologyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            ↓ Ver metodología completa
          </button>
        </p>

        <div ref={methodologyRef}>
          <h4>PRECIO VS. BENEFICIOS</h4>
          <p>
            El precio de una acción por sí solo no dice nada — $500 puede ser caro o barato según
            cuánto beneficio genere la empresa detrás. Los múltiplos relacionan el precio con los
            beneficios (EPS) para saber si estás pagando de más o de menos por cada dólar que la
            empresa gana.
          </p>

          <h4>VALOR INTRÍNSECO</h4>
          <p>
            Es el valor real de la empresa según sus fundamentales actuales y futuros — lo que
            debería valer la acción según los beneficios que genera, más allá de lo que hoy cotiza
            el mercado.
          </p>
          <div className="fml">
            <span>Fórmula</span>
            <code>Valor Intrínseco = EPS Proyectado × PER Conservador</code>
          </div>

          <h4>ENTERPRISE VALUE VS. MARKET CAP</h4>
          <p>
            El Market Cap solo mide cuánto valen las acciones en circulación. El Enterprise Value
            (EV) es el costo real de comprar el negocio completo: suma la deuda que heredarías y
            resta la caja disponible, que reduce el precio efectivo de la compra.
          </p>
          <div className="fml">
            <span>Fórmula</span>
            <code>Enterprise Value = Market Cap + Deuda Total − Caja y Equivalentes</code>
          </div>
          <div className="tbl note">
            <div className="th">Por qué importa</div>
            <ul>
              <li>
                Dos empresas con el mismo Market Cap pueden valer muy distinto en la práctica: la que
                tiene más deuda y menos caja es, en el fondo, más cara de comprar.
              </li>
              <li>
                Por eso conviene contrastar múltiplos "puros" sobre precio (como el PER) con
                múltiplos sobre EV (como EV/EBITDA) cuando la empresa tiene deuda relevante.
              </li>
            </ul>
          </div>

          <h4>GESTIÓN DE RIESGO: BREAKEVEN</h4>
          <p>
            El punto de equilibrio (breakeven) indica cuánto puede caer el EPS antes de que tu
            inversión empiece a perder valor frente al precio que pagaste.
          </p>
          <div className="fml">
            <span>EPS Breakeven</span>
            <code>EPS Breakeven = Precio de Compra / PER Conservador</code>
          </div>
          <div className="fml">
            <span>Tolerancia al error</span>
            <code>Tolerancia = [(EPS Proyectado − EPS Breakeven) / EPS Proyectado] × 100</code>
          </div>

          <h4>REGLA DE ORO</h4>
          <ul>
            <li>
              Si usas el <strong>precio de hoy</strong> como base → calculas tu{" "}
              <strong>Potencial de Ganancia</strong> (rentabilidad).
            </li>
            <li>
              Si usas el <strong>Valor Intrínseco</strong> como base → calculas tu{" "}
              <strong>Margen de Seguridad</strong> (protección).
            </li>
          </ul>

        </div>
      </div>
    </>
  );
}
