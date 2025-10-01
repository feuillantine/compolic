import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { loadConfig } from '../config';
import {
  addTracksToPlaylist,
  createSpotifyApi,
  getAccessToken,
  getAllPlaylistTrackUris,
} from '../utils/spotify';

export const syncTracksToPlaylistCommand = new Command('sync-tracks-to-playlist')
  .description('data内の全JSONからspotifyUrlを取得し、指定したSpotifyプレイリストに同期します')
  .action(async () => {
    const DATA_DIR = 'data';

    const config = loadConfig();

    const playlistId = config.SPOTIFY_PLAYLIST_ID;
    if (!playlistId) {
      throw new Error('プレイリストIDが設定されていません');
    }

    const token = await getAccessToken(
      config.SPOTIFY_CLIENT_ID ?? '',
      config.SPOTIFY_CLIENT_SECRET ?? '',
      config.SPOTIFY_REFRESH_TOKEN ?? '',
    );
    if (!token) {
      throw new Error('Spotifyのアクセストークンを取得できませんでした');
    }

    const spotifyApi = createSpotifyApi(
      config.SPOTIFY_CLIENT_ID ?? '',
      config.SPOTIFY_CLIENT_SECRET ?? '',
      '',
    );
    spotifyApi.setAccessToken(token);

    // データからトラックIDを収集
    const files = await fs.readdir(DATA_DIR);
    const trackUris: string[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(DATA_DIR, file);
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(raw);
        if (Array.isArray(json.tracks)) {
          for (const track of json.tracks) {
            const uri: string | undefined = track.spotifyUrl;
            const prefix = 'https://open.spotify.com/track/';
            if (uri && typeof uri === 'string' && uri.startsWith(prefix)) {
              trackUris.push(uri.replace(prefix, 'spotify:track:'));
            }
          }
        }
      } catch (e) {
        console.warn(`${file}の読み取りに失敗しました:`, e);
      }
    }
    console.log(`${trackUris.length}曲の楽曲が見つかりました`);

    // プレイリスト登録済のトラックIDを収集
    const existingUris = await getAllPlaylistTrackUris(spotifyApi, playlistId);
    console.log(`${existingUris.size}曲がプレイリストに登録されています`);

    const uniqueTrackUris = trackUris.filter((uri) => !existingUris.has(uri));
    if (uniqueTrackUris.length === 0) {
      console.log('未追加の曲はありませんでした');
      return;
    }

    console.log(`合計${uniqueTrackUris.length}曲をプレイリストに追加します`);
    try {
      await addTracksToPlaylist(spotifyApi, playlistId, uniqueTrackUris);
      console.log(`全${uniqueTrackUris.length}曲をプレイリストに追加しました`);
    } catch (e) {
      console.error('トラック追加に失敗しました:', e);
    }

    console.log('全曲の追加が完了しました');
  });
