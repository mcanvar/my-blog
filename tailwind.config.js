module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          darker: "#252626",
          dark: "#35403A",
          medium: "#4C594F",
          light: "#A4A69C",
          lighter: "#BFBFB8",
        },
      },
    },
  },
  plugins: [],
}
