/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D14",
        surface: "#141826",
        surface2: "#1B2033",
        line: "#262C42",
        muted: "#8D93A8",
        accent: "#FF3B5C",
        gold: "#FFC94A",
        onair: "#3DDC84"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      borderRadius: {
        card: "18px"
      },
      boxShadow: {
        card: "0 8px 30px -10px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(255,59,92,0.4), 0 0 24px rgba(255,59,92,0.25)"
      }
    }
  },
  plugins: []
};
