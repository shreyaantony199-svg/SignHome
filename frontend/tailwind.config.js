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
          blue: '#2563EB',
          'blue-light': '#60A5FA',
          'blue-subtle': '#EFF6FF',
          lavender: '#8B5CF6',
          'lavender-light': '#EDE9FE',
          purple: '#7C3AED',
          'purple-accent': '#C084FC',
          navy: '#0F172A',
          'navy-light': '#334155',
          'bg-light': '#F8FAFC',
          'bg-ice': '#F0F7FF',
          success: '#059669',
          'success-light': '#D1FAE5',
          warning: '#D97706',
          'warning-light': '#FEF3C7',
          emergency: '#DC2626',
          'emergency-light': '#FEE2E2',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'card': '0 8px 30px rgba(37, 99, 235, 0.06)',
        'hover': '0 14px 35px rgba(37, 99, 235, 0.12)',
        'emergency': '0 0 25px rgba(220, 38, 38, 0.25)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
