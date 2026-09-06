import { fold } from "../lib/search";

interface HighlightProps {
  text: string;
  query: string;
}

export default function Highlight({ text, query }: HighlightProps) {
  const words = query ? fold(query).split(/\s+/).filter((w) => w.length > 1) : [];
  if (!words.length) return <>{text}</>;

  const pattern = new RegExp(
    "(" + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")",
    "gi",
  );
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}
