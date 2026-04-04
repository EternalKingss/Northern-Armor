/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        sm: "4px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      colors: {
        carbon: {
          DEFAULT: '#0d1117',
          50: '#161b22',
          100: '#1c2128',
        },
        slate: {
          DEFAULT: '#30363d',
          light: '#484f58',
          dark: '#21262d',
        },
        tactical: {
          DEFAULT: '#1f6feb',
          light: '#388bfd',
          dark: '#1158c7',
          glow: 'rgba(31,111,235,0.3)',
        },
        ghost: {
          DEFAULT: '#f0f6fc',
          muted: '#8b949e',
          dim: '#6e7681',
        },
        orange: {
          300: "#fed7aa",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        blue: {
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        green: {
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        cyan: {
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        teal: {
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      borderRadius: {
        tactical: '6px',
      },
    },
  },
  plugins: [],
};
