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
        accent: ['MadeSoulmaze', '"Segoe Script"', '"Bradley Hand"', 'cursive'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'glow-pulse': 'glowPulse 3.8s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 10px rgba(204, 255, 0, 0.24), 0 0 24px rgba(204, 255, 0, 0.16)' },
          '50%': { textShadow: '0 0 14px rgba(204, 255, 0, 0.38), 0 0 34px rgba(204, 255, 0, 0.22)' },
        },
      }
    },
  },
  plugins: [],
}
