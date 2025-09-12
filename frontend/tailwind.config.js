/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: {
          50:  "#eaf6ff",
          100: "#d6edff",
          200: "#aeddff",
          300: "#7bcbff",
          400: "#49b5ff",
          500: "#0ea5e9",   // primary
          600: "#0a86c0",
          700: "#076792",
          800: "#064d6e",
          900: "#053750"
        }
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: {
        card: "0 10px 30px rgba(2,8,20,0.08)",
        glow: "0 0 0 1px rgba(14,165,233,.35), 0 10px 30px rgba(14,165,233,.25)"
      },
    },
  },
  plugins: [],
};
