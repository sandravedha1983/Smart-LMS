export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      boxShadow: {
        soft: '0 20px 40px rgba(2,6,23,0.6)',
        glow: '0 8px 30px rgba(99,102,241,0.18)',
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#06B6D4',
        background: '#0F172A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CBD5E1'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        poppins: ['Poppins', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
        script: ['"Dancing Script"', 'cursive']
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: []
};
