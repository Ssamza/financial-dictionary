import type { Metric } from "../data/metrics";

export interface Filters {
  cat: string;
  sec: string | null;
  q: string;
  stars: boolean;
  pinned: boolean;
}

const DIACRITICS = /[̀-ͯ]/g;

export const fold = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(DIACRITICS, "");

export const pad = (n: number): string => String(n).padStart(3, "0");

export function poolMetrics(metrics: Metric[], f: Filters, saved: Set<string>): Metric[] {
  return metrics.filter((m) => {
    if (f.pinned && !saved.has(m.id)) return false;
    if (f.cat !== "all" && m.cat !== f.cat) return false;
    if (f.sec && m.sec !== f.sec) return false;
    if (f.stars && m.stars < 5) return false;
    if (!f.q) return true;
    const haystack = fold(m.disp + " " + m.blurb + " " + m.formula + " " + m.sec + " " + m.text);
    return fold(f.q).split(/\s+/).every((w) => haystack.includes(w));
  });
}

interface PaletteHit {
  m: Metric;
  s: number;
}

export function searchPalette(metrics: Metric[], q: string, limit = 60): Metric[] {
  const f = fold(q);
  if (!f) return metrics.slice(0, limit);
  const hits: PaletteHit[] = [];
  for (const m of metrics) {
    const n = fold(m.disp);
    const s = n.startsWith(f) ? 0 : n.includes(f) ? 1 : fold(m.blurb + " " + m.sec).includes(f) ? 3 : fold(m.text).includes(f) ? 5 : 9;
    if (s < 9) hits.push({ m, s });
  }
  hits.sort((a, b) => a.s - b.s || a.m.num - b.m.num);
  return hits.slice(0, limit).map((h) => h.m);
}
