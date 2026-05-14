import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', 
  build: {
    // Vercel expects 'dist' by default, which is Vite's default
    outDir: 'dist',
  }
});
