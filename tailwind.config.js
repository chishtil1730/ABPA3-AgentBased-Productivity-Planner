/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ["AltoneTrial", "sans-serif"],
                indicator: ["Epilogue", "sans-serif"],
                card: ["CardFont", "sans-serif"],
                epilogue: ["Epilogue", "sans-serif"],
            },


        },
    },
    plugins: [],
};



