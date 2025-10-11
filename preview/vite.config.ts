import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const basePath = env.VITE_BASE_PATH ?? '/';
  return {
    base: basePath,
    root: path.resolve(__dirname, 'src'),
    publicDir: path.resolve(__dirname, 'public'),
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, 'src'),
      },
    },
    server: {
      fs: {
        allow: [
          // ルート直上の data ディレクトリ参照を許可
          path.resolve(__dirname, '..'),
        ],
      },
      // /data をワークスペース直下から配信する簡易ミドルウェア
      // ブラウザから /data/files.json で一覧、/data/<file>.json で各ファイルへアクセス可能
      middlewareMode: false,
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'compolic-data-middleware',
        configureServer(server) {
          const repoRoot = path.resolve(__dirname, '..');
          const dataDir = path.join(repoRoot, 'data');
          server.middlewares.use('/data/files.json', async (_req, res) => {
            try {
              const files = await fs.promises.readdir(dataDir);
              const jsonFiles = files
                .filter((f) => f.endsWith('.json') && f !== 'files.json')
                .map((f) => `/data/${f}`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(jsonFiles));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'files.json の生成に失敗' }));
            }
          });
          server.middlewares.use('/data', async (req, res, next) => {
            const url = req.url || '';
            // mount ベース '/data' はすでに除去されているため dataDir を基点に結合
            const rel = url.replace(/^\/+/, '');
            const full = path.join(dataDir, rel);
            try {
              if (!full.startsWith(dataDir)) return next();
              const stat = await fs.promises.stat(full);
              if (stat.isFile()) {
                res.setHeader('Content-Type', 'application/json');
                fs.createReadStream(full).pipe(res);
                return;
              }
            } catch {
              // フォールスルー
            }
            next();
          });
        },
      },
    ],
  };
});
