import type { Metric } from "../../data/metrics";
import { CATS } from "../../data/metrics";
import { pad } from "../../lib/search";
import Highlight from "../Highlight";
import Gauge from "../Gauge";

interface ListViewProps {
  metrics: Metric[];
  pool: Metric[];
  cat: string;
  sec: string | null;
  q: string;
  stars: boolean;
  pinned: boolean;
  saved: Set<string>;
  readIds: Set<string>;
  readCount: number;
  onOpen: (id: string) => void;
  onSetCat: (cat: string) => void;
  onToggleStars: () => void;
  onTogglePinned: () => void;
  onClear: () => void;
  onTogglePin: (id: string) => void;
}

export default function ListView({
  metrics,
  pool,
  cat,
  sec,
  q,
  stars,
  pinned,
  saved,
  readIds,
  readCount,
  onOpen,
  onSetCat,
  onToggleStars,
  onTogglePinned,
  onClear,
  onTogglePin,
}: ListViewProps) {
  const hero = !q && cat === "all" && !sec && !stars && !pinned;
  const groups: Record<string, Metric[]> = {};
  pool.forEach((m) => {
    (groups[m.sec] = groups[m.sec] || []).push(m);
  });
  const catEntries: [string, string][] = [["all", "Todas"], ...Object.entries(CATS)];

  return (
    <>
      {hero && (
        <section className="mast">
          <span className="tag lbl">Diccionario de análisis fundamental</span>
          <h1>
            Cada línea de un estado financiero, <em>descifrada</em>
          </h1>
          <p>
            Ciento noventa y nueve métricas de los tres estados financieros y los ratios que se
            construyen sobre ellos: qué mide cada una, cómo se lee y dónde están las trampas.
          </p>
          <div className="stat">
            <div>
              <b>199</b>
              <span className="lbl">Fichas</span>
            </div>
            <div>
              <b>25</b>
              <span className="lbl">Secciones</span>
            </div>
            <div>
              <b>{metrics.filter((m) => m.stars === 5).length}</b>
              <span className="lbl">Esenciales</span>
            </div>
            <div>
              <b>{metrics.filter((m) => m.formula).length}</b>
              <span className="lbl">Fórmulas</span>
            </div>
            <div>
              <b>{readCount}</b>
              <span className="lbl">Leídas</span>
            </div>
          </div>
        </section>
      )}
      <div className="bar2">
        {catEntries.map(([k, l]) => (
          <button key={k} className="f" aria-pressed={cat === k} onClick={() => onSetCat(k)}>
            {l}
            <u>{k === "all" ? metrics.length : metrics.filter((m) => m.cat === k).length}</u>
          </button>
        ))}
        <button className="f warn" aria-pressed={stars} onClick={onToggleStars}>
          ▮▮▮▮▮ Esenciales
        </button>
        <button className="f warn" aria-pressed={pinned} onClick={onTogglePinned}>
          Guardadas
          <u>{saved.size}</u>
        </button>
        {(sec || q) && (
          <button className="f" onClick={onClear}>
            ✕ Limpiar
          </button>
        )}
      </div>
      <div className="cols lbl">
        <span>Folio</span>
        <span>Métrica</span>
        <span>Fórmula</span>
        <span>Import.</span>
        <span />
      </div>
      {pool.length ? (
        Object.entries(groups).map(([secName, items]) => (
          <div key={secName}>
            <div className="grp">
              <h2>{secName}</h2>
              <span className="ln" />
              <span className="lbl">{items.length}</span>
            </div>
            {items.map((m) => (
              <button key={m.id} className="row" onClick={() => onOpen(m.id)}>
                <span className="fol">{pad(m.num)}</span>
                <span>
                  <span className="nm" style={readIds.has(m.id) ? { color: "var(--txt2)" } : undefined}>
                    <Highlight text={m.disp} query={q} />
                  </span>
                  <span className="bl">
                    <Highlight text={m.blurb} query={q} />
                  </span>
                </span>
                <span className="fx">
                  {m.formula ? (
                    <Highlight text={m.formula} query={q} />
                  ) : (
                    <span style={{ color: "var(--txt3)" }}>—</span>
                  )}
                </span>
                <span className="gauge" title={`Importancia ${m.stars}/5`}>
                  <Gauge stars={m.stars} />
                </span>
                <span
                  className="pin"
                  role="button"
                  aria-pressed={saved.has(m.id)}
                  title="Guardar"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(m.id);
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={saved.has(m.id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M6 3h12v18l-6-4.5L6 21z" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        ))
      ) : (
        <div className="void">
          <b>Sin registros</b>Prueba con otro término o quita los filtros.
        </div>
      )}
    </>
  );
}
