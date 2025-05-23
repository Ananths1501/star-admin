/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8a36e1", // Purple
          light: "#a78bfa",
          dark: "#7c3aed",
          blue: "#00c6ff", // Blue from gradient
          purple: "#8a36e1", // Purple from gradient
          pink: "#e633a8", // Pink from gradient
        },
        gradient: {
          start: "#00c6ff",
          mid: "#8a36e1",
          end: "#e633a8",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #00c6ff, #8a36e1, #e633a8)",
        "gradient-primary-hover": "linear-gradient(to right, #00b8ff, #7c32c9, #d62e99)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-hover": "0 15px 35px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
}
