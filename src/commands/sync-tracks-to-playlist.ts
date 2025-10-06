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

    const playlistIdVocal = config.SPOTIFY_PLAYLIST_ID_VOCAL ?? config.SPOTIFY_PLAYLIST_ID;
    const playlistIdInstrumental =
      config.SPOTIFY_PLAYLIST_ID_INSTRUMENTAL ?? config.SPOTIFY_PLAYLIST_ID;

    if (!playlistIdVocal || !playlistIdInstrumental) {
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

    // データからトラックIDを収集（歌あり/なしで分類）
    const files = await fs.readdir(DATA_DIR);
    const vocalTrackUris = new Set<string>();
    const instrumentalTrackUris = new Set<string>();

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
              const spotifyUri = uri.replace(prefix, 'spotify:track:');
              if (track.isInstrumental) {
                instrumentalTrackUris.add(spotifyUri);
              } else {
                vocalTrackUris.add(spotifyUri);
              }
            }
          }
        }
      } catch (e) {
        console.warn(`${file}の読み取りに失敗しました:`, e);
      }
    }

    console.log(
      `歌あり: ${vocalTrackUris.size}曲、歌なし: ${instrumentalTrackUris.size}曲の楽曲が見つかりました`,
    );

    // 歌ありプレイリストの同期
    const existingVocalUris = await getAllPlaylistTrackUris(spotifyApi, playlistIdVocal);
    console.log(`歌ありプレイリストに${existingVocalUris.size}曲が登録されています`);

    const uniqueVocalUris = vocalTrackUris.difference(existingVocalUris);
    if (uniqueVocalUris.size > 0) {
      console.log(`合計${uniqueVocalUris.size}曲を歌ありプレイリストに追加します`);
      try {
        await addTracksToPlaylist(spotifyApi, playlistIdVocal, uniqueVocalUris);
        console.log(`全${uniqueVocalUris.size}曲を歌ありプレイリストに追加しました`);
      } catch (e) {
        console.error('歌ありプレイリストへの追加に失敗しました:', e);
      }
    } else {
      console.log('歌ありプレイリストに未追加の曲はありませんでした');
    }

    // 歌なしプレイリストの同期
    const existingInstrumentalUris = await getAllPlaylistTrackUris(
      spotifyApi,
      playlistIdInstrumental,
    );
    console.log(`歌なしプレイリストに${existingInstrumentalUris.size}曲が登録されています`);

    const uniqueInstrumentalUris = instrumentalTrackUris.difference(existingInstrumentalUris);
    if (uniqueInstrumentalUris.size > 0) {
      console.log(`合計${uniqueInstrumentalUris.size}曲を歌なしプレイリストに追加します`);
      try {
        await addTracksToPlaylist(spotifyApi, playlistIdInstrumental, uniqueInstrumentalUris);
        console.log(`全${uniqueInstrumentalUris.size}曲を歌なしプレイリストに追加しました`);
      } catch (e) {
        console.error('歌なしプレイリストへの追加に失敗しました:', e);
      }
    } else {
      console.log('歌なしプレイリストに未追加の曲はありませんでした');
    }

    console.log('全曲の追加が完了しました');
  });
