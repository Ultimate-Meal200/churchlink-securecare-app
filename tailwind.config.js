/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0F4C81',
        brandDark: '#102033',
        brandSoft: '#DCEBFF',
        gold: '#C89B3C',
        mint: '#D7F5E9',
        surface: '#F7F4EE',
        slate: '#5A6B7D',
        danger: '#B93838',
      },
      boxShadow: {
        card: '0px 18px 48px rgba(16, 32, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
