import { Command } from 'commander';
import { sleep } from '@/utils/sleep';
import { getTracksCommand } from './get-tracks';

export const getMultipleTracksCommand = new Command('get-multiple-tracks')
  .description('複数アーティストの楽曲リストを取得します')
  .requiredOption('-a, --artists <artists>', 'カンマ区切りのアーティスト名')
  .action(async (options) => {
    const FETCH_INTERVAL_MS = 2_000;

    const artists = options.artists
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      try {
        await getTracksCommand.parseAsync(['--artist', artist], { from: 'user' });
      } catch (e) {
        console.log(`${artist}の楽曲データ取得に失敗: ${e}`);
      }
      await sleep(FETCH_INTERVAL_MS);
    }
  });
