import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "ocean";

const themes: Theme[] = ["light", "dark", "ocean"];

interface ThemeContextType {
  themeName: Theme;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return themes.includes(saved) ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  const cycleTheme = () => {
    setThemeName((prev) => {
      const index = themes.indexOf(prev);
      const nextIndex = (index + 1) % themes.length;
      return themes[nextIndex];
    });
  };

  return (
    <ThemeContext.Provider value={{ themeName, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};