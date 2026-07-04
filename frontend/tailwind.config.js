/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1B2A4A", light: "#2C4066", dark: "#101B30" },
        paper: { DEFAULT: "#F6F1E4", soft: "#FBF8F1", line: "#E3DAC4" },
        income: { DEFAULT: "#2E6F4E", soft: "#E6F0E9" },
        expense: { DEFAULT: "#B8483C", soft: "#F5E7E4" },
        gold: { DEFAULT: "#C9A13B", soft: "#F3E9CE" },
        dark: { bg: "#12182B", surface: "#1B2338", line: "#2A3350", text: "#E7E2D3" },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
