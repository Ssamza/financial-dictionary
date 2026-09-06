interface TopBarProps {
  cmdText: string;
  pinnedActive: boolean;
  pinnedCount: number;
  formulasActive: boolean;
  valuationActive: boolean;
  onBurgerClick: () => void;
  onHomeClick: () => void;
  onSeekClick: () => void;
  onPinClick: () => void;
  onFormulasClick: () => void;
  onValuationClick: () => void;
  onThemeClick: () => void;
}

export default function TopBar({
  cmdText,
  pinnedActive,
  pinnedCount,
  formulasActive,
  valuationActive,
  onBurgerClick,
  onHomeClick,
  onSeekClick,
  onPinClick,
  onFormulasClick,
  onValuationClick,
  onThemeClick,
}: TopBarProps) {
  return (
    <header className="top">
      <button className="tbtn" aria-label="Índice" onClick={onBurgerClick}>
        ☰
      </button>
      <div className="logo" role="button" tabIndex={0} onClick={onHomeClick}>
        <span className="sq">M</span>
        <b>LIBRO MAYOR</b>
      </div>
      <button className="cmd" onClick={onSeekClick}>
        <span className="caret">&gt;</span>
        <span>{cmdText}</span>
        <span className="k">⌘K</span>
      </button>
      <button className="tbtn" aria-pressed={pinnedActive} onClick={onPinClick}>
        ▮<span className="hidesm">Guardadas</span>
        <u>{pinnedCount ? " " + pinnedCount : ""}</u>
      </button>
      <button className="tbtn" aria-pressed={formulasActive} onClick={onFormulasClick}>
        ƒ<span className="hidesm">Fórmulas</span>
      </button>
      <button className="tbtn" aria-pressed={valuationActive} onClick={onValuationClick}>
        %<span className="hidesm">Valoración</span>
      </button>
      <button className="tbtn" onClick={onThemeClick}>
        ◐
      </button>
    </header>
  );
}
