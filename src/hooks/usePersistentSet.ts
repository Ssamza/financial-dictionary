import { useCallback, useState } from "react";
import { getStored, setStored } from "../lib/storage";

export function usePersistentSet(key: string) {
  const [set, setSet] = useState<Set<string>>(() => new Set(getStored<string[]>(key, [])));

  const toggle = useCallback((id: string) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStored(key, [...next]);
      return next;
    });
  }, [key]);

  const add = useCallback((id: string) => {
    setSet((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      setStored(key, [...next]);
      return next;
    });
  }, [key]);

  return { set, toggle, add };
}
