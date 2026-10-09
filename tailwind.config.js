/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          chocolate: '#3D2314',
          cocoa: '#5C3826',
          caramel: '#8C5338',
          rose: '#E86A8D',
          roseLight: '#FBE8EE',
          roseDark: '#C73866',
          cream: '#FFF9F4',
          vanilla: '#F7EFE5',
          gold: '#E5A93B'
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(92, 56, 38, 0.08)',
        'glow': '0 0 25px rgba(232, 106, 141, 0.25)',
      }
    },
  },
  plugins: [],
}
