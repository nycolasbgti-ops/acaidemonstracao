/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Tema Açaí Premium ──────────────────────────────────
        // Cores base - Dark Mode
        'acai-dark':       '#0A0806',  // Preto profundo
        'acai-bg':         '#1a0f2e',  // Fundo principal (roxo muito escuro)
        'acai-surface':    '#2a1a47',  // Superfícies de componentes
        'acai-raised':     '#3d2561',  // Elementos elevados
        'acai-border':     '#5a3a7d',  // Bordas
        
        // Cores primárias - Roxo Açaí Profundo
        'acai-primary':    '#6B21A8',  // Roxo premium vibrante
        'acai-primary-lt': '#9333EA',  // Roxo claro (hover)
        'acai-primary-dk': '#4C0A63',  // Roxo escuro (active)
        
        // Cores de Destaque - Verde Menta (conversão e ações)
        'acai-accent':     '#10B981',  // Verde menta vibrante
        'acai-accent-lt':  '#34D399',  // Verde menta claro (hover)
        'acai-accent-dk':  '#059669',  // Verde menta escuro (active)
        
        // Cores Complementares - Dourado Vibrante (premium, preços)
        'acai-gold':       '#F59E0B',  // Dourado vibrante
        'acai-gold-lt':    '#FBBF24',  // Dourado claro (hover)
        'acai-gold-dk':    '#D97706',  // Dourado escuro (active)
        
        // Cores de Status e Feedback
        'acai-success':    '#10B981',  // Sucesso (verde menta)
        'acai-warning':    '#F59E0B',  // Aviso (dourado)
        'acai-error':      '#EF4444',  // Erro (vermelho)
        'acai-info':       '#06B6D4',  // Info (cyan)
        
        // Cores Neutras
        'acai-text':       '#F3F4F6',  // Texto principal (cinza claro)
        'acai-text-muted': '#9CA3AF',  // Texto secundário (cinza médio)
        'acai-text-dim':   '#6B7280',  // Texto terciário (cinza escuro)
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':  { transform: 'translateX(-8px)' },
          '40%':  { transform: 'translateX(8px)' },
          '60%':  { transform: 'translateX(-8px)' },
          '80%':  { transform: 'translateX(8px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        shake:   'shake 0.4s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn:  'fadeIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        pulse:   'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        // Sombras elevation-based
        'sm-premium':  '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'md-premium':  '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'lg-premium':  '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'xl-premium':  '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        
        // Sombras coloridas
        'accent-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'primary-glow': '0 0 20px rgba(107, 33, 168, 0.3)',
        'gold-glow':   '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      backdropBlur: {
        'xl': '20px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
}
