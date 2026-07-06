/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pgi: {
          bg: '#0a0e17',
          card: '#111827',
          border: '#1e293b',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
          gold: '#f59e0b',
          muted: '#64748b',
          text: '#f1f5f9',
          'text-muted': '#94a3b8',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
