interface GaugeProps {
  stars: number;
}

export default function Gauge({ stars }: GaugeProps) {
  return (
    <>
      {"▮".repeat(stars)}
      <s>{"▮".repeat(5 - stars)}</s>
    </>
  );
}
