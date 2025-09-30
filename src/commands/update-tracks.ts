import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { sleep } from '@/utils/sleep';
import { getTracksCommand } from './get-tracks';

export const updateTracksCommand = new Command('update-tracks')
  .description('全作曲者の楽曲リストを再取得します')
  .action(async () => {
    const DATA_DIR = 'data';
    const FETCH_INTERVAL_MS = 2_000;

    const files = (await fs.readdir(DATA_DIR)).filter((file) => file.endsWith('.json'));
    for (const file of files) {
      const artistId = path.basename(file, '.json');
      try {
        await getTracksCommand.parseAsync(['--arid', artistId], { from: 'user' });
      } catch {
        // 失敗を許容
      }
      await sleep(FETCH_INTERVAL_MS);
    }
  });
