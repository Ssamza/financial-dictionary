import { useState } from "react";
import { getStored, setStored } from "../lib/storage";

function fmtNum(n: number): string {
  return Number.isFinite(n) ? n.toFixed(1) : "—";
}

export default function RuleOf20Calculator() {
  const [pe, setPe] = useState(() => getStored("ruleof20_pe", "27.5"));
  const [cpi, setCpi] = useState(() => getStored("ruleof20_cpi", "2.9"));

  const sum = parseFloat(pe) + parseFloat(cpi);

  function updatePe(v: string) {
    setPe(v);
    setStored("ruleof20_pe", v);
  }

  function updateCpi(v: string) {
    setCpi(v);
    setStored("ruleof20_cpi", v);
  }

  const tone = Number.isFinite(sum) && sum < 15 ? "ok" : Number.isFinite(sum) && sum < 20 ? "warn" : "";
  const message = !Number.isFinite(sum)
    ? null
    : sum < 15
      ? "🟢 Oportunidad histórica — es raro que el mercado llegue por debajo de 15; casi todos los pisos de mercado desde 1935 ocurrieron en esta zona."
      : sum < 20
        ? "🟡 Posible piso — por debajo de 20 es razonable empezar a pensar en un fondo de mercado."
        : null;

  return (
    <div className="body" style={{ padding: "0 22px 26px" }}>
      <div className="tbl">
        <div className="th">Calculadora — Rule of 20</div>
        <ul>
          <li className="calcRow">
            <span>P/E trailing del S&amp;P 500</span>
            <input inputMode="decimal" value={pe} onChange={(e) => updatePe(e.target.value)} />
          </li>
          <li className="calcRow">
            <span>CPI interanual (US, %)</span>
            <input inputMode="decimal" value={cpi} onChange={(e) => updateCpi(e.target.value)} />
          </li>
          <li className="calcRow">
            <span>P/E + CPI</span>
            <b>{fmtNum(sum)}</b>
          </li>
        </ul>
      </div>
      {message && (
        <div className={`tbl ${tone}`} style={{ marginTop: 0 }}>
          <div className="th">{message}</div>
        </div>
      )}
    </div>
  );
}
