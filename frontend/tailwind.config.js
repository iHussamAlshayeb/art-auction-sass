/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // اللون الفيروزي/الأزرق
          light: "#4DB6AC",
          DEFAULT: "#009688",
          dark: "#00796B",
        },
        secondary: {
          // اللون البرتقالي/الأحمر
          light: "#FF8A65",
          DEFAULT: "#FF6F61",
          dark: "#E64A19",
        },
        neutral: {
          // ألوان محايدة جديدة
          100: "#F5F5F5",
          200: "#EEEEEE",
          700: "#616161",
          900: "#212121",
        },
      },
      fontFamily: {
        sans: ["Cairo", "sans-serif"],
        heading: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
};
