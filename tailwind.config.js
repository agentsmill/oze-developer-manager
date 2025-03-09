/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#b3d1ff',
          200: '#80b0ff',
          300: '#4d8fff',
          400: '#1a6eff',
          500: '#0050e6',
          600: '#0040b3',
          700: '#003080',
          800: '#00204d',
          900: '#00101a',
        },
        energy: {
          solar: '#FFB400',
          wind: '#1E88E5',
          storage: '#8E24AA',
        },
        status: {
          greenfield: '#4CAF50',
          environmental: '#FF9800',
          zoning: '#E91E63',
          grid: '#7B1FA2',
          construction: '#D32F2F',
          rtb: '#2E7D32',
        }
      },
      fontFamily: {
        sans: [
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      }
    },
  },
  plugins: [],
};
