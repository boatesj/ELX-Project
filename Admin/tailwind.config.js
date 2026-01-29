/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        brand: ["Montserrat", "sans-serif"],
      },
      colors: {
        elx: {
          accent: "#FFA500", // Ellcworth Orange
          deep: "#1A2930", // Primary dark base
          charcoal: "#42353B", // Dark neutral
          plum: "#53435A", // Supporting tone
          paper: "#EDECEC", // Light surfaces
          neutral: "#9A9EAB", // Muted text / dividers
        },
      },
    },
  },
  plugins: [],
};
