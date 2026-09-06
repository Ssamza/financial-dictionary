import { useEffect, useMemo, useRef, useState } from "react";
import type { Metric } from "../../data/metrics";
import { pad } from "../../lib/search";
import Gauge from "../Gauge";

interface ReaderViewProps {
  metric: Metric;
  byId: Record<string, Metric>;
  seq: Metric[];
  saved: boolean;
  onTogglePin: () => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  onSelectSec: (sec: string) => void;
  onMarkRead: (id: string) => void;
}

export default function ReaderView({
  metric,
  byId,
  seq,
  saved,
  onTogglePin,
  onOpen,
  onBack,
  onSelectSec,
  onMarkRead,
}: ReaderViewProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const headsRef = useRef<HTMLElement[]>([]);
  const [activeToc, setActiveToc] = useState(0);

  const index = seq.findIndex((x) => x.id === metric.id);
  const prev = index > 0 ? seq[index - 1] : undefined;
  const next = index >= 0 && index < seq.length - 1 ? seq[index + 1] : undefined;
  const rel = useMemo(() => metric.rel.map((id) => byId[id]).filter(Boolean), [metric.rel, byId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    onMarkRead(metric.id);
  }, [metric.id, onMarkRead]);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;
    headsRef.current = Array.from(container.querySelectorAll("h4"));
    function onScroll() {
      const y = window.scrollY + 120;
      let c = 0;
      headsRef.current.forEach((h, i) => {
        if (h.offsetTop <= y) c = i;
      });
      setActiveToc(c);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [metric.id]);

  function handleBodyClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
    if (target?.dataset.go) onOpen(target.dataset.go);
  }

  return (
    <div className="reader">
      <article className="doc">
        <div className="crumb lbl">
          <button onClick={onBack}>← Índice</button>
          <span style={{ color: "var(--line)" }}>/</span>
          <button onClick={() => onSelectSec(metric.sec)}>{metric.sec}</button>
        </div>
        <header className="dhead">
          <span className="fol">Ficha {pad(metric.num)} / 199</span>
          <h1>{metric.disp}</h1>
          <div className="dsub">
            <span className="badge on">
              <Gauge stars={metric.stars} /> {metric.stars}/5
            </span>
            <span className="badge">{metric.cats}</span>
            <button className={`badge${saved ? " on" : ""}`} onClick={onTogglePin}>
              {saved ? "✓ Guardada" : "+ Guardar"}
            </button>
          </div>
        </header>
        <div
          className="body"
          ref={bodyRef}
          onClick={handleBodyClick}
          dangerouslySetInnerHTML={{ __html: metric.html }}
        />
        <nav className="pager">
          <button disabled={!prev} onClick={() => prev && onOpen(prev.id)}>
            <u>← Anterior</u>
            <i>{prev ? prev.disp : "—"}</i>
          </button>
          <button disabled={!next} onClick={() => next && onOpen(next.id)}>
            <u>Siguiente →</u>
            <i>{next ? next.disp : "—"}</i>
          </button>
        </nav>
      </article>
      <aside className="side">
        {metric.toc.length > 0 && (
          <div className="sbox">
            <h6>En esta ficha</h6>
            {metric.toc.map((t, i) => (
              <button
                key={i}
                className="tocit"
                aria-current={activeToc === i}
                onClick={() => headsRef.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {rel.length > 0 && (
          <div className="sbox">
            <h6>Relacionadas</h6>
            {rel.map((r) => (
              <button key={r.id} className="rel" onClick={() => onOpen(r.id)}>
                <u>{pad(r.num)}</u>
                <span>{r.disp}</span>
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
