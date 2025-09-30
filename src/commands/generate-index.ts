import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

export const generateIndexCommand = new Command('generate-index')
  .description('dataディレクトリ内のJSONファイルリストを生成します')
  .action(async () => {
    const DATA_DIR = 'data';
    const OUTPUT_FILE = path.join(DATA_DIR, 'files.json');

    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
    const jsonFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => `./data/${entry.name}`);

    await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(jsonFiles, null, 2)}\n`, 'utf-8');
  });
