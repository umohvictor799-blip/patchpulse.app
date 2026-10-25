/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#090D16",
        panel: "#0F1624",
        slateline: "#1E293B",
        secure: "#10B981",
        critical: "#EF4444",
        warn: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glowEmerald: "0 0 0 1px rgba(16,185,129,.35), 0 0 24px -4px rgba(16,185,129,.45)",
        glowCrimson: "0 0 0 1px rgba(239,68,68,.35), 0 0 24px -4px rgba(239,68,68,.45)",
        glowAmber: "0 0 0 1px rgba(245,158,11,.35), 0 0 24px -4px rgba(245,158,11,.4)",
      },
    },
  },
  plugins: [],
};
