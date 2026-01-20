import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#00B074', // Mediso Primary
                    600: '#059669',
                    700: '#047857',
                },
                bg: {
                    main: '#F8F9FA',
                    surface: '#FFFFFF',
                }
            },
            borderRadius: {
                '2xl': '1rem', // Mediso Card Radius
            },
            boxShadow: {
                'soft': '0 2px 4px rgba(0,0,0,0.02)',
                'lifted': '0 10px 15px rgba(0,0,0,0.05)',
            }
        },
    },
    plugins: [],
};
export default config;
