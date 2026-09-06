import { useEffect, useRef, useState } from "react";
import type { Metric } from "../data/metrics";
import { pad, searchPalette } from "../lib/search";
import Highlight from "./Highlight";

interface CommandPaletteProps {
  open: boolean;
  metrics: Metric[];
  initialQuery: string;
  onOpenMetric: (id: string) => void;
  onFullTextSearch: (query: string) => void;
  onClose: () => void;
}

export default function CommandPalette({
  open,
  metrics,
  initialQuery,
  onOpenMetric,
  onFullTextSearch,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setQuery(initialQuery);
  }

  const results = searchPalette(metrics, query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelected(0);
  }

  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }, [open]);

  useEffect(() => {
    const active = listRef.current?.children[selected] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  function move(delta: number) {
    if (!results.length) return;
    setSelected((s) => (s + delta + results.length) % results.length);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[selected]) {
        onOpenMetric(results[selected].id);
        onClose();
      } else {
        onFullTextSearch(query);
        onClose();
      }
    }
  }

  return (
    <>
      <div className={`veil${open ? " on" : ""}`} onClick={onClose} />
      <div className={`pal${open ? " on" : ""}`} role="dialog" aria-modal="true">
        <div className="palin">
          <span className="caret">&gt;</span>
          <input
            ref={inputRef}
            placeholder="nombre de métrica o concepto"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="plist" ref={listRef}>
          {results.length ? (
            results.map((m, i) => (
              <button
                key={m.id}
                className="pit"
                data-sel={i === selected}
                onClick={() => {
                  onOpenMetric(m.id);
                  onClose();
                }}
              >
                <span className="fol">{pad(m.num)}</span>
                <i>
                  <Highlight text={m.disp} query={query} />
                </i>
                <u>{m.sec}</u>
              </button>
            ))
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "var(--txt3)", fontSize: 13 }}>
              Sin coincidencias en los nombres.
              <button
                style={{ color: "var(--amber)" }}
                onClick={() => {
                  onFullTextSearch(query);
                  onClose();
                }}
              >
                Buscar en el texto completo →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
