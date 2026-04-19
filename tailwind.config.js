// tailwind.config.js
import figmaPlugin from "./src/design-system/figma-tokens.js";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    figmaPlugin,
  ],
};