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
        lightGreen: "#cfe3d1",
        softPink: "#fb8985"
      },
      fontFamily: {
        display: ["'Poppins', system-ui, sans-serif"]
      },
      boxShadow: {
        soft: "10px 10px 20px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6)"
      }
    }
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        /* Firefox */
        "*": {
          "scrollbar-width": "thin",
          "scrollbar-color": `${theme("colors.accentGreen")} rgba(0, 0, 0, 0.1)`,
        },

        /* Chrome / Edge / Safari */
        "*::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: theme("colors.accentGreen"),
          borderRadius: "6px",
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      });
    },
  ]
}
