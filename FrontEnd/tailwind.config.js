/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        doku: {
          cream: '#FFF8EA',
          rose: '#9E7676',
          dusty: '#815B5B',
          chocolate: '#594545',
        },
      },
      fontFamily: {
        heading: ['"IBM Plex Sans"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        warm: '0 4px 24px rgba(89, 69, 69, 0.10)',
        card: '0 2px 8px rgba(89, 69, 69, 0.08)',
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
      },
    },
  },
  plugins: [],
}
