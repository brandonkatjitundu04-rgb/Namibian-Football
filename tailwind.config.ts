import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: 'hsl(225, 83%, 41%)', // #1E5CD6
        },
        accent: {
          400: 'hsl(214, 100%, 64%)', // #5CB3FF
        },
        gold: {
          500: 'hsl(43, 96%, 56%)', // #FCD34D
        },
        bg: 'hsl(240, 30%, 5%)', // #0A0D1A
        card: 'hsl(240, 25%, 8%)', // #111318
        'secondary-surface': 'hsl(240, 20%, 15%)', // #1F2332
        foreground: '#FFFFFF',
        muted: 'hsl(225, 25%, 65%)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config

