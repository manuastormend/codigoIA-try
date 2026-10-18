/** @type {import('tailwindcss').Config} */
// Tokens del Sistema de Identidad Visual de Código.IA.
// Los nombres viejos (verde, violeta, negro, blanco, azul-oscuro) se mantienen
// como alias para no tocar cada componente, pero ahora apuntan a la paleta oficial.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Títulos: Diagramm. Cuerpo: IBM Plex Sans. Etiquetas /SLASH: IBM Plex Mono.
        display: ['"Diagramm"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // Paleta oficial
        azul: '#2400FF',
        naranja: '#FF6B3B',
        lima: '#C4FD36',
        lila: '#C172FF',
        noche: '#1A1A30', // "Azul oscuro"
        gris: '#FAFAFA',
        // Alias (compatibilidad con clases existentes)
        verde: '#C4FD36',
        violeta: '#C172FF',
        negro: '#1A1A30',
        blanco: '#FAFAFA',
        'azul-oscuro': '#1A1A30',
      },
      // Esquinas suaves: radios chicos en controles, grandes en tarjetas.
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        full: '9999px',
      },
      boxShadow: {
        suave: '0 18px 40px -22px rgba(26, 26, 48, 0.35)',
        'suave-lg': '0 28px 60px -28px rgba(26, 26, 48, 0.45)',
      },
    },
  },
  plugins: [],
}
