/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        accent: "#10B981",
        background: "#F9FAFB",
        border: "#E5E7EB",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
