
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f26b38", /* Galaxy-like orange */
          50: "#fff4ee",
          100: "#ffe7db",
          600: "#f26b38",
          700: "#d95d2f"
        }
      }
    },
  },
  plugins: [],
}
