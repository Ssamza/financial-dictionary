import type { Metric } from "../../data/metrics";

interface FormulasViewProps {
  metrics: Metric[];
  onOpen: (id: string) => void;
}

export default function FormulasView({ metrics, onOpen }: FormulasViewProps) {
  const list = metrics.filter((m) => m.formula);
  const groups: Record<string, Metric[]> = {};
  list.forEach((m) => {
    (groups[m.cats] = groups[m.cats] || []).push(m);
  });

  return (
    <>
      <section className="mast">
        <span className="tag lbl">Referencia rápida</span>
        <h1>
          Índice de <em>fórmulas</em>
        </h1>
        <p>Las {list.length} métricas del libro que se calculan con una fórmula explícita.</p>
      </section>
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <div className="grp">
            <h2>{cat}</h2>
            <span className="ln" />
            <span className="lbl">{items.length}</span>
          </div>
          <div className="fgrid">
            {items.map((m) => (
              <button key={m.id} className="fit" onClick={() => onOpen(m.id)}>
                <span className="fn">{m.disp}</span>
                <span className="fb">{m.formula}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
