import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Express, type Request, type Response } from 'express';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use('/', express.static(path.resolve(currentDir)));
app.use('/data', express.static(path.resolve(currentDir, '..', 'data')));

app.get('/data/files.json', async (_req: Request, res: Response) => {
  try {
    const dataDir = path.resolve(currentDir, '..', 'data');
    const files = await fs.promises.readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json')).map((f) => `/data/${f}`);
    res.json(jsonFiles);
  } catch (err) {
    console.error('Error reading data directory:', err);
    res.status(500).json({ error: 'Failed to list data files' });
  }
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
