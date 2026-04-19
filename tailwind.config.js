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
        acid: '#CCFF00',
        'acid-deep': '#9CC200',
        'acid-wash': '#E9FF66',
        ink: '#0A0A0A',
        'ink-raise': '#141414',
        concrete: '#1E1E1E',
        cement: '#2A2A2A',
        'cement-light': '#6B6B6B',
        plaster: '#E8E6E1',
        teal: '#7FE8D5',
        smoke: 'rgba(255,255,255,0.62)',
      },
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        accent: ['MadeSoulmaze', '"Segoe Script"', '"Bradley Hand"', 'cursive'],
        grotesk: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      }
    },
  },
  plugins: [],
}
