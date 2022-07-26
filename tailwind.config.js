module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px'
      },
      colors: {
        'indigodye': '#274060ff',
        'bdazzledblue': "#335c81ff",
        'frenchskyblue': "#65afffff",
        'spacecadet': "#1b2845ff",
        'bluegray': "#5899e2ff",
      },
    },
  },
  plugins: [],
}
