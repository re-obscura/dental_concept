        tailwind.config = {
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
                            gold: '#C5A986',   // Gold accent
                            goldDark: '#A68968', // Darker Gold for hover
                            text: '#374151',   // Darker text for WCAG (gray-700)
                            primary: '#5D8AA8', // Air Force Blue
                            primaryDark: '#3A6380',
                            accent: '#81C7D4'   // Pastel blue
                        }
                    },
                    boxShadow: {
                        'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
                        'glow': '0 0 20px rgba(197, 169, 134, 0.3)',
                        'ios': '0 8px 30px rgba(0,0,0,0.04)',
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