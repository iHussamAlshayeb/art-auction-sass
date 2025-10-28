import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#009F9D", // تركوازي فنان
          light: "#5CC3E2",
          dark: "#007C7A",
        },
        secondary: {
          DEFAULT: "#E94F37", // برتقالي محمر فنان
          light: "#FF816D",
          dark: "#C23624",
        },
        neutral: {
          50: "#F7F5F2", // خلفية عامة فاتحة
          100: "#F3F4F6",
          700: "#374151",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Cairo", "sans-serif"],
        heading: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        fanan: {
          primary: "#009F9D",
          "primary-focus": "#007C7A",
          "primary-content": "#ffffff",

          secondary: "#E94F37",
          "secondary-focus": "#C23624",
          "secondary-content": "#ffffff",

          accent: "#5CC3E2",
          neutral: "#374151",
          "base-100": "#F7F5F2",
          "base-200": "#ffffff",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
};
