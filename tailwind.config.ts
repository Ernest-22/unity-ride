import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB", // <--- This line is what was missing!
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#007AFF",
          hover: "#0062CC",
        },
        text: {
          main: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        success: "#34C759",
        danger: "#FF3B30",
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
        'soft-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;