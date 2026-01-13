tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Oswald', 'sans-serif'],
            },
            colors: {
                brand: {
                    light: '#FDFBF7',  // Milky background
                    beige: '#F2E8DA',  // Warm beige
                    gold: '#9A7B4F',   // High-contrast Gold (WCAG AA)
                    goldDark: '#7D6440', // Darker Gold for hover
                    text: '#374151',   // Darker text for WCAG (gray-700)
                    primary: '#3D6E8B', // High-contrast Blue
                    primaryDark: '#2C5168',
                    accent: '#2C8C99'   // High-contrast Teal/Blue
                },
                dark: {
                    bg: '#121212',
                    surface: '#1E1E1E',
                    border: '#2A2A2A',
                    text: '#E0E0E0',
                    accent: '#C5A986'
                }
            },
            boxShadow: {
                'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
                'glow': '0 0 20px rgba(197, 169, 134, 0.3)',
                'ios': '0 8px 30px rgba(0,0,0,0.04)',
                'premium': '0 10px 30px -10px rgba(0,0,0,0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blob': 'blob 7s infinite',
                'scroll': 'scroll 40s linear infinite', /* Slowed down for smoother read */
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        }
    }
}
