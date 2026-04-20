import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

const devImageProxy = (): Plugin => ({
  name: 'dev-image-proxy',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/image', async (req, res, next) => {
      try {
        const requestUrl = new URL(req.originalUrl ?? req.url ?? '', 'http://localhost');
        const target = requestUrl.searchParams.get('url');
        if (!target) {
          res.statusCode = 400;
          res.end('Missing url');
          return;
        }

        const parsed = new URL(target);
        const allowedHosts = new Set(['i1.sndcdn.com', 'i2.sndcdn.com', 'i3.sndcdn.com', 'i4.sndcdn.com']);
        if (!allowedHosts.has(parsed.hostname)) {
          res.statusCode = 403;
          res.end('Host not allowed');
          return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const upstream = await fetch(target, { signal: controller.signal });
        clearTimeout(timeout);

        if (!upstream.ok) {
          res.statusCode = upstream.status;
          res.end('Failed to fetch image');
          return;
        }

        const contentType = upstream.headers.get('content-type') ?? '';
        if (!contentType.startsWith('image/')) {
          res.statusCode = 400;
          res.end('Invalid content type');
          return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-store');
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.statusCode = 200;
        res.end(buffer);
      } catch {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'react-router-dom': ['react-router-dom'],
          'vendor': ['react', 'react-dom', 'zustand']
        }
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    devImageProxy(),
  ],
})
