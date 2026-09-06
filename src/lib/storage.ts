const memoryFallback: Record<string, unknown> = {};
let storageOk = true;
try {
  localStorage.setItem("__t", "1");
  localStorage.removeItem("__t");
} catch {
  storageOk = false;
}

export function getStored<T>(key: string, fallback: T): T {
  try {
    if (!storageOk) return (memoryFallback[key] as T) ?? fallback;
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T): void {
  try {
    if (storageOk) localStorage.setItem(key, JSON.stringify(value));
    else memoryFallback[key] = value;
  } catch {
    memoryFallback[key] = value;
  }
}
