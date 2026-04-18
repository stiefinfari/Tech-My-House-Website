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
        rust: '#FF4A1C',
        bone: '#F2EEE5',
        smoke: 'rgba(255,255,255,0.62)',
        // @deprecated - retrocompatibilità
        neon: '#CCFF00',
        // @deprecated - retrocompatibilità
        dark: '#0A0A0A',
      },
      fontFamily: {
        sans: ['Space Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        accent: ['MadeSoulmaze', '"Segoe Script"', '"Bradley Hand"', 'cursive'],
        grotesk: ['Space Grotesk', 'sans-serif'],
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
