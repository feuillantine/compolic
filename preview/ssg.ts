import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routes } from './src/routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distDir = path.join(__dirname, 'dist');
const templatePath = path.join(distDir, 'index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

const mountPlaceholders = [
  '<div id="root" class="h-full"></div>',
];

const injectAppHtml = (source: string, appHtml: string) => {
  for (const placeholder of mountPlaceholders) {
    if (source.includes(placeholder)) {
      return source.replace(placeholder, placeholder.replace('</div>', `${appHtml}</div>`));
    }
  }
  throw new Error('root 要素が dist/index.html に見つかりませんでした');
};

const basePathEnv = process.env.VITE_BASE_PATH ?? '/';
const basename = basePathEnv === '/' ? undefined : basePathEnv.replace(/\/+$/, '');
const handlerOptions = basename ? { basename } : undefined;
const appendBaseToRequest = (route: string) => (basename ? `${basename}${route}` : route);
const toRouteDir = (route: string) => (route === '/' ? '' : route.replace(/^\/+/, ''));

const paths = ['/'];

const { query, dataRoutes } = createStaticHandler(routes, handlerOptions);

for (const p of paths) {
  const requestPath = appendBaseToRequest(p);
  const context = await query(new Request(`http://localhost${requestPath}`));
  if (context instanceof Response) {
    console.error('レスポンスが返却されたためスキップ:', p);
    continue;
  }
  const router = createStaticRouter(dataRoutes, context);
  const appHtml = renderToString(React.createElement(StaticRouterProvider, { router, context }));
  const html = injectAppHtml(template, appHtml);
  const outDir = path.join(distDir, toRouteDir(p));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`静的生成: ${p}`);
}

try {
  const repoRoot = path.resolve(__dirname, '..');
  const srcDataDir = path.join(repoRoot, 'data');
  const outDataDir = path.join(__dirname, 'dist', 'data');
  const files = await fs.promises.readdir(srcDataDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json') && f !== 'files.json');
  await fs.promises.mkdir(outDataDir, { recursive: true });
  // ファイルコピー
  await Promise.all(
    jsonFiles.map((f) => fs.promises.copyFile(path.join(srcDataDir, f), path.join(outDataDir, f))),
  );
  // files.json 生成
  const list = jsonFiles.map((f) => `/data/${f}`);
  await fs.promises.writeFile(path.join(outDataDir, 'files.json'), JSON.stringify(list), 'utf-8');
  console.log('データコピーと files.json 生成完了');
} catch (e) {
  console.error('データコピーに失敗しました', e);
}
