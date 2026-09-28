import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm Italian-inspired palette
        terracotta: {
          50: "#fef7f0",
          100: "#fdecd8",
          200: "#fad5b0",
          300: "#f6b87d",
          400: "#f19248",
          500: "#ed7624",
          600: "#de5d1a",
          700: "#b84617",
          800: "#93381a",
          900: "#773118",
        },
        olive: {
          50: "#f7f8f0",
          100: "#edf0dd",
          200: "#dae0bc",
          300: "#c0cb91",
          400: "#a5b46a",
          500: "#889a4c",
          600: "#6a7b3a",
          700: "#525f2f",
          800: "#434d2a",
          900: "#3a4227",
        },
        cream: "#faf8f4",
        warmGray: {
          50: "#faf9f7",
          100: "#f0eeea",
          200: "#e0dcd4",
          300: "#cbc5b9",
          400: "#b3aa9a",
          500: "#a19683",
          600: "#948774",
          700: "#7b6f61",
          800: "#655c52",
          900: "#534d44",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
