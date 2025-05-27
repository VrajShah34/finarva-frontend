/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
       colors: {
        primary: {
          DEFAULT: '#04457E',
          light: '#265a97',
          dark: '#03346a',
        },
        secondary: {
          DEFAULT: '#18FFAA',
          light: '#57ffbe',
          dark: '#00e598',
        },
      },
    
    },
  },
  plugins: [],
}

