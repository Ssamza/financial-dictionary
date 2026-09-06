import { useCallback, useEffect, useMemo, useState } from "react";
import { metrics, CATS, type Metric } from "./data/metrics";
import { usePersistentSet } from "./hooks/usePersistentSet";
import { useTheme } from "./hooks/useTheme";
import { poolMetrics } from "./lib/search";
import TopBar from "./components/TopBar";
import Rail from "./components/Rail";
import StatusBar from "./components/StatusBar";
import CommandPalette from "./components/CommandPalette";
import ListView from "./components/views/ListView";
import FormulasView from "./components/views/FormulasView";
import ReaderView from "./components/views/ReaderView";
import ValuationView from "./components/views/ValuationView";
import "./App.css";

type ViewMode = "list" | "read" | "formulas" | "valuation";

interface Filters {
  view: ViewMode;
  cat: string;
  sec: string | null;
  q: string;
  stars: boolean;
  pinned: boolean;
  id: string | null;
}

const initialFilters: Filters = {
  view: "list",
  cat: "all",
  sec: null,
  q: "",
  stars: false,
  pinned: false,
  id: null,
};

function App() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [railOpen, setRailOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const { set: saved, toggle: togglePin } = usePersistentSet("saved");
  const { set: read, add: markRead } = usePersistentSet("read");
  const { toggleTheme } = useTheme();

  const byId = useMemo(() => {
    const map: Record<string, Metric> = {};
    metrics.forEach((m) => (map[m.id] = m));
    return map;
  }, []);

  const pool = useMemo(() => poolMetrics(metrics, filters, saved), [filters, saved]);

  const currentMetric = filters.id ? byId[filters.id] : undefined;
  const readerSeq = useMemo(() => {
    if (!currentMetric) return [];
    return pool.some((x) => x.id === currentMetric.id) ? pool : metrics;
  }, [pool, currentMetric]);

  const openMetric = useCallback((id: string) => {
    setFilters((f) => ({ ...f, id, view: "read" }));
    setRailOpen(false);
  }, []);

  const backToList = useCallback(() => setFilters((f) => ({ ...f, view: "list" })), []);

  const goHome = useCallback(() => setFilters(initialFilters), []);

  const toggleFormulas = useCallback(
    () => setFilters((f) => ({ ...f, view: f.view === "formulas" ? "list" : "formulas" })),
    [],
  );

  const toggleValuation = useCallback(
    () => setFilters((f) => ({ ...f, view: f.view === "valuation" ? "list" : "valuation" })),
    [],
  );

  const setCat = useCallback(
    (cat: string) => setFilters((f) => ({ ...f, cat, sec: null, view: "list" })),
    [],
  );

  const selectSec = useCallback((sec: string) => {
    setFilters((f) => ({ ...f, sec: f.sec === sec ? null : sec, view: "list", q: "" }));
    setRailOpen(false);
  }, []);

  const toggleStars = useCallback(() => setFilters((f) => ({ ...f, stars: !f.stars })), []);

  const togglePinnedFilter = useCallback(
    () => setFilters((f) => ({ ...f, pinned: !f.pinned, view: "list" })),
    [],
  );

  const clearFilters = useCallback(() => setFilters((f) => ({ ...f, sec: null, q: "" })), []);

  const fullTextSearch = useCallback(
    (q: string) => setFilters((f) => ({ ...f, q, view: "list", sec: null })),
    [],
  );

  useEffect(() => {
    function onScroll() {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      setProgress(max > 0 ? (d.scrollTop / max) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      const active = document.activeElement;
      if (e.key === "/" && !(active && /^(INPUT|TEXTAREA)$/.test(active.tagName))) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setRailOpen(false);
        return;
      }
      if (paletteOpen) return;
      if (filters.view === "read" && filters.id) {
        const idx = readerSeq.findIndex((x) => x.id === filters.id);
        if (e.key === "ArrowRight") {
          const nextM = idx >= 0 ? readerSeq[idx + 1] : undefined;
          if (nextM) openMetric(nextM.id);
        }
        if (e.key === "ArrowLeft") {
          const prevM = idx > 0 ? readerSeq[idx - 1] : undefined;
          if (prevM) openMetric(prevM.id);
        }
        if (e.key === "Backspace") backToList();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, filters.view, filters.id, readerSeq, openMetric, backToList]);

  const filterLabelBase = filters.q
    ? `"${filters.q}"`
    : filters.sec
      ? filters.sec
      : filters.pinned
        ? "GUARDADAS"
        : filters.stars
          ? "ESENCIALES"
          : filters.cat === "all"
            ? "TODAS"
            : CATS[filters.cat];

  let filterLabel: string;
  let countLabel: string;
  if (filters.view === "read" && currentMetric) {
    filterLabel = String(currentMetric.num).padStart(3, "0");
    countLabel = `FICHA ${String(currentMetric.num).padStart(3, "0")} / 199`;
  } else if (filters.view === "formulas") {
    const n = metrics.filter((m) => m.formula).length;
    filterLabel = filterLabelBase.toUpperCase();
    countLabel = `${n} REGISTRO${n === 1 ? "" : "S"}`;
  } else if (filters.view === "valuation") {
    filterLabel = "VALORACIÓN";
    countLabel = "CALCULADORA DE ESCENARIOS";
  } else {
    filterLabel = filterLabelBase.toUpperCase();
    countLabel = `${pool.length} REGISTRO${pool.length === 1 ? "" : "S"}`;
  }

  return (
    <>
      <div className="prog" style={{ width: `${progress}%` }} />
      <TopBar
        cmdText={filters.q || "buscar métrica, fórmula o concepto…"}
        pinnedActive={filters.pinned}
        pinnedCount={saved.size}
        formulasActive={filters.view === "formulas"}
        valuationActive={filters.view === "valuation"}
        onBurgerClick={() => setRailOpen((o) => !o)}
        onHomeClick={goHome}
        onSeekClick={() => setPaletteOpen(true)}
        onPinClick={togglePinnedFilter}
        onFormulasClick={toggleFormulas}
        onValuationClick={toggleValuation}
        onThemeClick={toggleTheme}
      />
      <div className="app">
        <Rail metrics={metrics} activeSec={filters.sec} open={railOpen} onSelectSec={selectSec} />
        <main className="stage">
          {filters.view === "read" && currentMetric ? (
            <ReaderView
              metric={currentMetric}
              byId={byId}
              seq={readerSeq}
              saved={saved.has(currentMetric.id)}
              onTogglePin={() => togglePin(currentMetric.id)}
              onOpen={openMetric}
              onBack={backToList}
              onSelectSec={selectSec}
              onMarkRead={markRead}
            />
          ) : filters.view === "formulas" ? (
            <FormulasView metrics={metrics} onOpen={openMetric} />
          ) : filters.view === "valuation" ? (
            <ValuationView />
          ) : (
            <ListView
              metrics={metrics}
              pool={pool}
              cat={filters.cat}
              sec={filters.sec}
              q={filters.q}
              stars={filters.stars}
              pinned={filters.pinned}
              saved={saved}
              readIds={read}
              readCount={read.size}
              onOpen={openMetric}
              onSetCat={setCat}
              onToggleStars={toggleStars}
              onTogglePinned={togglePinnedFilter}
              onClear={clearFilters}
              onTogglePin={togglePin}
            />
          )}
        </main>
      </div>
      <StatusBar filterLabel={filterLabel} countLabel={countLabel} />
      <CommandPalette
        open={paletteOpen}
        metrics={metrics}
        initialQuery={filters.q}
        onOpenMetric={openMetric}
        onFullTextSearch={fullTextSearch}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}

export default App;
