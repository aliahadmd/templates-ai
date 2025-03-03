/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-foreground': 'rgb(var(--color-success-foreground) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-foreground': 'rgb(var(--color-warning-foreground) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        'info-foreground': 'rgb(var(--color-info-foreground) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.25rem',
      },
      boxShadow: {
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}