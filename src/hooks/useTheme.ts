import { useCallback, useEffect, useState } from "react";
import { getStored, setStored } from "../lib/storage";

export function useTheme() {
  const [theme, setTheme] = useState<string>(() => getStored("theme", "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      setStored("theme", next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
