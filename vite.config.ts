import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100, // check for changes every 100ms
    },
    hmr: {
      overlay: true, // show error overlay in browser if there's an issue
    },
  },
});
