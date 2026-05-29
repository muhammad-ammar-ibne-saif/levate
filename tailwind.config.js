/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#7ED957",
        },
        bg: {
          DEFAULT: "#0D0D0D",
          2: "#161616",
          3: "#1E1E1E",
          4: "#2A2A2A",
        },
        muted: {
          DEFAULT: "#9A9A9A",
          2: "#5A5A5A",
        },
        blue: "#5B9CF6",
        orange: "#F97316",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};