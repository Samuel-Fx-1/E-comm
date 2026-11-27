import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

const REJECTS_PATH = path.resolve(import.meta.dirname, 'data', 'image-rejects.json');

function readRejects(): string[] {
  try {
    const data = JSON.parse(readFileSync(REJECTS_PATH, 'utf8'));
    return Array.isArray(data?.photoIds) ? data.photoIds.map(String) : [];
  } catch {
    return [];
  }
}

function addReject(photoId: unknown): { photoIds: string[]; added: boolean } {
  const id = String(photoId ?? '');
  if (!/^\d{1,15}$/.test(id)) throw new Error('A numeric Pexels photo id is required');
  const photoIds = readRejects();
  const added = !photoIds.includes(id);
  if (added) photoIds.push(id);
  writeFileSync(REJECTS_PATH, `${JSON.stringify({ photoIds }, null, 2)}\n`, 'utf8');
  return { photoIds, added };
}

/** Development-only reject endpoint. It is not included in `vite build`. */
function devImageRejectEndpoint(): Plugin {
  return {
    name: 'soko-dev-image-reject-endpoint',
    configureServer(server) {
      server.middlewares.use('/dev-api/image-rejects', (req, res, next) => {
        res.setHeader('content-type', 'application/json');
        if (req.method === 'GET') {
          res.end(JSON.stringify({ photoIds: readRejects() }));
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const result = addReject(parsed.photoId);
            res.statusCode = result.added ? 201 : 200;
            res.end(JSON.stringify(result));
          } catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const devEndpointEnabled = command === 'serve' && process.env.NODE_ENV !== 'production';
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(devEndpointEnabled ? [devImageRejectEndpoint()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Phase 4: same-origin API in production; proxied during `npm run dev`.
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  };
});
