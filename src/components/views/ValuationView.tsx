import { useRef, useState } from "react";

interface Scenario {
  key: string;
  label: string;
  tone: "bad" | "warn" | "ok";
  eps: string;
  per: string;
}

const initialScenarios: Scenario[] = [
  { key: "pes", label: "Pesimista", tone: "bad", eps: "4.20", per: "15" },
  { key: "con", label: "Conservador", tone: "warn", eps: "5.12", per: "20" },
  { key: "opt", label: "Optimista", tone: "ok", eps: "9.14", per: "20" },
];

function fmtMoney(n: number): string {
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

function fmtPct(n: number): string {
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";
}

export default function ValuationView() {
  const [price, setPrice] = useState("90.06");
  const [scenarios, setScenarios] = useState(initialScenarios);
  const methodologyRef = useRef<HTMLDivElement>(null);

  const priceNum = parseFloat(price);

  function updateScenario(key: string, field: "eps" | "per", value: string) {
    setScenarios((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
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
        <h4>CALCULADORA DE ESCENARIOS</h4>
        <div className="tbl">
          <div className="th">Precio actual de la acción</div>
          <ul>
            <li className="calcRow">
              <span>Precio</span>
              <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </li>
          </ul>
        </div>

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
                      onChange={(e) => updateScenario(s.key, "eps", e.target.value)}
                    />
                  </li>
                  <li className="calcRow">
                    <span>PER</span>
                    <input
                      inputMode="decimal"
                      value={s.per}
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
