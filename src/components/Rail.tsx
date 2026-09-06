import { useMemo } from "react";
import type { Metric } from "../data/metrics";

interface RailProps {
  metrics: Metric[];
  activeSec: string | null;
  open: boolean;
  onSelectSec: (sec: string) => void;
}

export default function Rail({ metrics, activeSec, open, onSelectSec }: RailProps) {
  const groups = useMemo(() => {
    const g: Record<string, Record<string, number>> = {};
    metrics.forEach((m) => {
      g[m.cats] = g[m.cats] || {};
      g[m.cats][m.sec] = (g[m.cats][m.sec] || 0) + 1;
    });
    return g;
  }, [metrics]);

  return (
    <nav className={`rail${open ? " on" : ""}`}>
      <div className="railhd lbl">Índice general</div>
      <div>
        {Object.entries(groups).map(([cat, secs]) => (
          <div className="railgrp" key={cat}>
            <h3>{cat}</h3>
            {Object.entries(secs).map(([sec, n]) => (
              <button
                key={sec}
                className="rit"
                aria-current={activeSec === sec}
                onClick={() => onSelectSec(sec)}
              >
                <i>{sec}</i>
                <u>{n}</u>
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
