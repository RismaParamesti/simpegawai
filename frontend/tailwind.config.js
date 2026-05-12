/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#EA6B2F",
          "primary-focus": "#D85A17",
          "primary-content": "#FFFFFF",

          secondary: "#0F766E",
          "secondary-focus": "#115E59",
          "secondary-content": "#FFFFFF",

          accent: "#14B8A6",
          "accent-focus": "#0F766E",
          "accent-content": "#FFFFFF",

          neutral: "#0F172A",
          "neutral-focus": "#1E293B",
          "neutral-content": "#FFFFFF",

          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "base-content": "#0F172A",

          info: "#2563EB",
          "info-content": "#FFFFFF",
          success: "#2ECC71",
          warning: "#FACC15",
          "warning-content": "#0F172A",
          error: "#DC2626",
          "error-content": "#FFFFFF",
        },
      },
      {
        dark: {
          primary: "#FB923C",
          "primary-focus": "#EA6B2F",
          "primary-content": "#FFFFFF",

          secondary: "#2DD4BF",
          "secondary-focus": "#14B8A6",
          "secondary-content": "#0F172A",

          accent: "#38BDF8",
          "accent-focus": "#0EA5E9",
          "accent-content": "#0F172A",

          neutral: "#1E293B",
          "neutral-focus": "#0F172A",
          "neutral-content": "#FFFFFF",

          "base-100": "#0F172A",
          "base-200": "#111827",
          "base-300": "#1E293B",
          "base-content": "#E2E8F0",

          info: "#60A5FA",
          "info-content": "#0F172A",
          success: "#27AE60",
          warning: "#FACC15",
          "warning-content": "#0F172A",
          error: "#EF4444",
          "error-content": "#FFFFFF",
        },
      },
    ],
  },
};
