import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    async configureServer(server: any) {
      const { handleLocalApi, initBackgroundServices } = await import('./server/apiRouter.js');
      initBackgroundServices();
      server.middlewares.use((req: any, res: any, next: any) => {
        handleLocalApi(req, res, next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const _env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3003,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3003,
      host: '0.0.0.0',
    }
  };
});
