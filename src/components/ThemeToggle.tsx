import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("resumeiq-theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("resumeiq-theme", theme);
  }, [theme]);

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 ml-2 rounded-md transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-200 dark:border-slate-800"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
      )}
    </button>
  );
}
