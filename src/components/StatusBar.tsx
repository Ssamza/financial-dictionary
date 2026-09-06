interface StatusBarProps {
  filterLabel: string;
  countLabel: string;
}

export default function StatusBar({ filterLabel, countLabel }: StatusBarProps) {
  return (
    <div className="status">
      <div>
        <span className="dot" />
        LIBRO MAYOR
      </div>
      <div>{filterLabel}</div>
      <div>{countLabel}</div>
      <div className="hidesm">
        <b>⌘K</b> buscar · <b>←→</b> navegar · <b>ESC</b> salir
      </div>
    </div>
  );
}
