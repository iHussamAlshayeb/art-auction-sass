/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "sans-serif"],
        heading: ["Tajawal", "sans-serif"],
      },
      primary: {
        // اللون الفيروزي
        DEFAULT: "#4DB6AC", // لون فيروزي متوسط
        50: "#E0F2F1",
        100: "#B2DFDB",
        200: "#80CBC4",
        300: "#4DB6AC",
        400: "#26A69A",
        500: "#009688",
        600: "#00897B",
        700: "#00796B",
        800: "#00695C",
        900: "#004D40",
      },
      secondary: {
        // اللون البرتقالي المحمر
        DEFAULT: "#FF6F61", // لون برتقالي محمر متوسط
        50: "#FFEBEE",
        100: "#FFCDD2",
        200: "#EF9A9A",
        300: "#E57373",
        400: "#EF5350",
        500: "#F44336",
        600: "#E53935",
        700: "#D32F2F",
        800: "#C62828",
        900: "#B71C1C",
      },
    },
  },
  plugins: [],
};
