import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicit aliases so esbuild resolves nested requires from within the
// linked packages (e.g. code inside @xeplr/ui-schema-handler that does
// require('@xeplr/schema-handler')).
const XEPLR = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  server: { port: 5273 },
  resolve: {
    alias: {
      '@xeplr/schema-handler':    path.join(XEPLR, 'xeplr-schema-handler'),
      '@xeplr/ui-schema-handler': path.join(XEPLR, 'xeplr-ui-schema-handler')
    }
  },
  optimizeDeps: {
    include: ['@xeplr/schema-handler', '@xeplr/ui-schema-handler']
  }
});
