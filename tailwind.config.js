/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                canvas: "#F8F8F8",
                ink: "#0A0A0A",
                panel: "#FFFFFF",
                panelDark: "#111111",
                line: "rgba(10, 10, 10, 0.08)",
            },
            boxShadow: {
                subtle: "0 1px 0 rgba(10, 10, 10, 0.06)",
            },
        },
    },
    plugins: [],
}
