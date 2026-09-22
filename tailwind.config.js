/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      colors: {
        brand: {
          50: "#f4f4f5",
          100: "#e4e4e7",
          500: "#71717a",
          900: "#18181b",
          accent: "#6366f1",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
