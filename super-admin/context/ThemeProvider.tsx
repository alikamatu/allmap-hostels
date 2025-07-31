"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Style = "classic" | "web3";

interface ThemeContextType {
  theme: Theme;
  style: Style;
  toggleTheme: () => void;
  toggleStyle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [style, setStyle] = useState<Style>("classic");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Get saved preferences or use system defaults
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedStyle = localStorage.getItem("style") as Style | null;
    
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    
    // Set initial theme
    setTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));
    
    // Set initial style
    setStyle(savedStyle || "classic");
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Update document classes and localStorage
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-style", style);
    
    localStorage.setItem("theme", theme);
    localStorage.setItem("style", style);
    
    // Update CSS variables based on theme+style combination
    document.documentElement.className = `${theme} ${style}`;
  }, [theme, style, isMounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleStyle = () => {
    setStyle(prev => prev === "classic" ? "web3" : "classic");
  };

  if (!isMounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, style, toggleTheme, toggleStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}