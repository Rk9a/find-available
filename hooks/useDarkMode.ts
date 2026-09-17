"use client";

import { useEffect, useState } from "react";

// The <html> element persists across client-side navigations (it lives in
// the root layout), so if an earlier page already resolved the theme this
// mount can reuse it immediately instead of flashing back to light while
// the effect below re-resolves it. On the very first hydration of a
// session this attribute isn't set yet, so it falls back to `false`,
// matching the server-rendered markup.
function getInitialDarkMode(): boolean {
  if (typeof document === "undefined") return false;

  return document.documentElement.dataset.theme === "dark";
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;

      localStorage.setItem("theme", next ? "dark" : "light");

      return next;
    });
  };

  return { darkMode, toggleDarkMode };
}
