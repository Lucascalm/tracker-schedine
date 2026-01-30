/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0f", // Very Dark Blue/Black
                surface: "#111827",    // Slate 900 like
                surfaceHighlight: "#1f2937", // Slate 800 like
                primary: "#10b981",    // Emerald 500 (Profit)
                danger: "#ef4444",     // Red 500 (Loss)
                accent: "#6366f1",     // Indigo 500 (Neutral/Brand)
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
            },
        },
    },
    plugins: [],
}
