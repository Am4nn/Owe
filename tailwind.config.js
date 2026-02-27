module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6C63FF",   // Electric purple
          accent:  "#00F5D4",   // Neon teal
          danger:  "#FF4D6D",   // Debt red
          success: "#06D6A0",   // Settled green
        },
        dark: {
          bg:      "#0A0A0F",   // Deep background
          surface: "#131318",   // Card surface
          border:  "#1E1E2E",   // Subtle border
        },
      },
    },
  },
  plugins: [],
}
