import { useState, useEffect, useCallback } from "react";

export type ThemeId = "midnight" | "forest" | "violet" | "ocean";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  background: string;
  card: string;
  border: string;
  secondary: string;
  muted: string;
  primary: string;
  ring: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "midnight",
    label: "Midnight",
    background: "222 47% 11%",
    card: "222 47% 13%",
    border: "217 33% 17%",
    secondary: "217 33% 17%",
    muted: "217 33% 17%",
    primary: "38 92% 50%",
    ring: "38 92% 50%",
  },
  {
    id: "forest",
    label: "Forest",
    background: "160 35% 8%",
    card: "160 35% 10%",
    border: "160 25% 16%",
    secondary: "160 25% 16%",
    muted: "160 25% 16%",
    primary: "142 65% 45%",
    ring: "142 65% 45%",
  },
  {
    id: "violet",
    label: "Violet",
    background: "250 40% 9%",
    card: "250 40% 11%",
    border: "250 30% 18%",
    secondary: "250 30% 18%",
    muted: "250 30% 18%",
    primary: "270 70% 68%",
    ring: "270 70% 68%",
  },
  {
    id: "ocean",
    label: "Ocean",
    background: "205 45% 9%",
    card: "205 45% 11%",
    border: "205 35% 16%",
    secondary: "205 35% 16%",
    muted: "205 35% 16%",
    primary: "195 85% 50%",
    ring: "195 85% 50%",
  },
];

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--popover", theme.card);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.muted);
  root.style.setProperty("--input", theme.muted);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--ring", theme.ring);
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem("themeId") as ThemeId) || "midnight";
  });

  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    applyTheme(theme);
    localStorage.setItem("themeId", themeId);
  }, [themeId]);

  const changeTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
  }, []);

  const currentTheme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  return { themeId, currentTheme, changeTheme, themes: THEMES };
}
