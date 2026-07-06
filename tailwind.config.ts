import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#1A222B",
        "green-start": "#8FC603",
        "green-end": "#1E9E3D",
        "dark-green-start": "#1A3A26",
        "dark-green-end": "#0F2419",
        "light-surface": "#F8F6F6",
        "dark-green": "#1A3A26",
        brand: {
          graphite: "#1A222B",
          "green-light": "#8FC603",
          "green-dark": "#1E9E3D",
          "surface-dark": "#1A3A26",
          "surface-darker": "#0F2419",
          "surface-light": "#F8F6F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      backgroundImage: {
        "green-gradient": "linear-gradient(135deg, #8FC603, #1E9E3D)",
        "dark-green-gradient": "linear-gradient(135deg, #1A3A26, #0F2419)",
      },
      aspectRatio: {
        "16/10": "16 / 10",
        "4/3": "4 / 3",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
