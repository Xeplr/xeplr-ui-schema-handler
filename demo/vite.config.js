import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5273 },
  optimizeDeps: {
    // Ensure Vite resolves the local file: links freshly each dev run.
    include: ['@xeplr/schema-handler', '@xeplr/ui-schema-handler']
  }
});
