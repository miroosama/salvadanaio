import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Italian coast — bright orange primary, vivid Vespa-mint secondary
        terracotta: {
          // primary / brand / action (inner-lining-of-a-leather-jacket orange)
          50: "#FDF1EA",
          100: "#FBDDCF",
          200: "#F6BBA0",
          300: "#F0926A",
          400: "#EC763F",
          500: "#E8622A",
          600: "#D1521F",
          700: "#B8461A",
          800: "#933A1A",
          900: "#7A3118",
        },
        peach: {
          // warm Amalfi surface — modals & the page canvas
          50: "#FEF6F0",
          100: "#FDEADF",
          200: "#F8D8C6",
          300: "#F2BFA3",
        },
        mint: {
          // positive / growth / secondary — vivid coastal-car green
          50: "#E7F8F2",
          100: "#C6EFE2",
          200: "#97E4CE",
          300: "#6FD9BE",
          400: "#38C9A4",
          500: "#17AC8B",
          600: "#0E8E72",
          700: "#0C7159",
          800: "#0C5B48",
          900: "#0B4A3C",
        },
        // warm sun-washed peach plaster — the Cinque Terre canvas the cards sit on
        canvas: "#F4DBCB",
        // light stucco surface for cards & header — floats above the peach canvas
        cream: "#FDFBF8",
        // warm modal surface — a touch creamier than the cards
        card: "#FCF8F1",
        ink: "#2B2420",
        warmGray: {
          50: "#faf9f7",
          100: "#f0eeea",
          200: "#e0dcd4",
          300: "#cbc5b9",
          400: "#b3aa9a",
          500: "#a19683",
          600: "#948774",
          700: "#7b6f61",
          800: "#463f38",
          900: "#2e2824",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },
      boxShadow: {
        // Warm-tinted, layered depth (toasted peach-brown, not neutral gray) —
        // reads premium on a warm palette. One tight layer + one diffuse.
        card: "0 1px 2px -1px rgba(123, 88, 66, 0.08), 0 8px 24px -8px rgba(123, 88, 66, 0.10)",
        modal:
          "0 2px 10px -3px rgba(123, 88, 66, 0.14), 0 20px 50px -14px rgba(123, 88, 66, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
