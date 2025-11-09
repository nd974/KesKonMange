export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        softBeige: "#f3e6d9",
        cardBeige: "#e9dccb",
        accentGreen: "#6b926f",
        lightGreen: "#cfe3d1"
      },
      fontFamily: {
        display: ["'Poppins', system-ui, sans-serif"]
      },
      boxShadow: {
        soft: "10px 10px 20px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6)"
      }
    }
  },
  plugins: []
}
