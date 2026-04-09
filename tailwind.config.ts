import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e8f0fe",
          100: "#c5d8fc",
          200: "#96b8f9",
          300: "#5f8ef5",
          400: "#3b6ef0",
          500: "#2952e3",
          600: "#1e3fc7",
          700: "#1630a0",
          800: "#0f2280",
          900: "#091660",
        },
        dark: {
          900: "#0a0d14",
          800: "#0f1421",
          700: "#141b2d",
          600: "#1a2340",
          500: "#1e2a4a",
          400: "#253258",
          300: "#2e3d6b",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
