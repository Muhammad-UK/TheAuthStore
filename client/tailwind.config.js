/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg-blue": "#123",
        "light-bg-blue": "#234",
      },
    },
  },
  plugins: [],
};
