import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7EE",
        warmbrown: "#5B4636",
        softblue: "#3E6E8E",
        gentlegreen: "#4C7A5E",
        blush: "#D98C7A",
      },
      fontSize: {
        base: "1.125rem",
      },
    },
  },
  plugins: [],
};
export default config;
