export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep navy brand pair — deliberately restrained (not a bright
                // consumer-app gradient) since the site handles sensitive
                // personal data and needs to read as serious/institutional.
                primary: '#1E3A5F',
                secondary: '#13253B',
                success: '#0F766E',
                info: '#0369A1',
                warning: '#B45309',
                danger: '#B91C1C',
                // Top navbar gradient — kept separate from primary/secondary
                // since it's specific to the header, not the general brand pair.
                headerFrom: '#667eea',
                headerTo: '#764ba2',
            },
            fontFamily: {
                rubik: ['Rubik', 'sans-serif'],
            }
        },
    },
    plugins: [],
}