import React, { useEffect, useState } from "react";

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setIsDark((v) => !v)}
      className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

