export const UI_PALETTE = Object.freeze({
  light: {
    primary: "#EA6B2F",
    primaryHover: "#FB923C",
    primarySoft: "#FDBA74",
    background: "#FFFFFF",
    section: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    textOnPrimary: "#FFFFFF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  dark: {
    primary: "#FB923C",
    primaryHover: "#F97316",
    primarySoft: "#FDBA74",
    background: "#0F172A",
    section: "#111827",
    surface: "#1E293B",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    textOnPrimary: "#FFFFFF",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#38BDF8",
  },
});

export const CHART_PALETTE = Object.freeze({
  light: [
    "#EA6B2F",
    "#FB923C",
    "#14B8A6",
    "#3B82F6",
    "#10B981",
    "#A855F7",
    "#0F172A",
  ],
  dark: [
    "#FB923C",
    "#FDBA74",
    "#2DD4BF",
    "#38BDF8",
    "#34D399",
    "#C084FC",
    "#F472B6",
  ],
});

export function getCurrentTheme() {
  if (typeof document !== "undefined") {
    const dataTheme = document.documentElement.getAttribute("data-theme");
    if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  }

  if (typeof localStorage !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  }

  return "light";
}

export function getChartColors() {
  const theme = getCurrentTheme();
  return CHART_PALETTE[theme] || CHART_PALETTE.light;
}

export function toRgba(hex, alpha = 1) {
  const value = (hex || "").replace("#", "");
  if (value.length !== 6) return hex;

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
