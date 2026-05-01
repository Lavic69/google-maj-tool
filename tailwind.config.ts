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
        ink: "#0F1115",
        ink2: "#15181F",
        ink3: "#1C2029",
        line: "#252A36",
        line2: "#2F3542",
        accent: "#2563EB",
        accent2: "#3B82F6",
        ok: "#10B981",
        warn: "#F59E0B",
        bad: "#EF4444",
        mute: "#8A93A6",
        mute2: "#5A6273",
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
