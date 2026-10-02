export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0e6f7e', dark: '#0a4f5b', light: '#e6f6f8', mist: '#f2fbfc' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
