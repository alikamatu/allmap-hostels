export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'text-fade': 'textFade 3s ease-in-out infinite',
      },
      keyframes: {
        textFade: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}