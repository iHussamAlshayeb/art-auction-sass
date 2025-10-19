/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // اللون الفيروزي/الأزرق
          light: "#4DB6AC", // درجة فاتحة
          DEFAULT: "#009688", // اللون الأساسي
          dark: "#00796B", // درجة داكنة
        },
        secondary: {
          // اللون البرتقالي/الأحمر
          light: "#FF8A65",
          DEFAULT: "#FF6F61",
          dark: "#E64A19",
        },
        neutral: {
          // ألوان محايدة جديدة
          100: "#F5F5F5", // خلفية
          200: "#EEEEEE", // حدود
          300: "#E0E0E0",
          700: "#616161", // نصوص
          900: "#212121", // عناوين
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
