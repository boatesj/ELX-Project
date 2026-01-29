export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        brand: ["Montserrat", "sans-serif"],
      },
      colors: {
        elx: {
          accent: "#FFA500",
          deep: "#1A2930",
          charcoal: "#42353B",
          plum: "#53435A",
          paper: "#EDECEC",
          neutral: "#9A9EAB",
        },
      },
    },
  },
  plugins: [],
};
