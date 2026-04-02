/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: { max: '768px' },
        tablet: { min: '769px', max: '1024px' },
        desktop: { min: '1025px' },
      },
      colors: {
        neon: '#CCFF00',
        cyber: '#FF003C',
        dark: '#0A0A0A',
      },
      fontFamily: {
        sans: ['Space Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        marker: ['"Permanent Marker"', '"Comic Sans MS"', 'cursive'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
