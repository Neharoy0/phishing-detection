import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/phishing-detection/',  // Add this line for GitHub Pages

  server: {
    hmr: {
      overlay: false, // Disable the error overlay to avoid further issues
    },
  },
});
