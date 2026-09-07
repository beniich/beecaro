/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#2424eb",
                "background-light": "#f6f6f8",
                "background-dark": "#0a0a14",
                "panel-dark": "#111121",
                // RosterFlow colors
                "surface-dark": "#1e293b",
                "accent-blue": "#60a5fa",
                "accent-emerald": "#34d399",
                "accent-amber": "#fbbf24",
                "accent-red": "#f87171",
            },
            fontFamily: { display: ["Inter", "sans-serif"] },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
