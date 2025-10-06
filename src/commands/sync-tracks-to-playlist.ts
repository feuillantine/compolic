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

interface ComposerData {
  name: string;
  sortName?: string;
  otherNames?: string[];
  tracks: Array<{
    spotifyUrl?: string;
    artist?: string;
  }>;
}

export const syncTracksToPlaylistCommand = new Command('sync-tracks-to-playlist')
  .description('data内の全JSONからspotifyUrlを取得し、指定したSpotifyプレイリストに同期します')
  .action(async () => {
    const DATA_DIR = 'data';

    const config = loadConfig();

    const playlistIdA = config.SPOTIFY_PLAYLIST_ID_A;
    const playlistIdB = config.SPOTIFY_PLAYLIST_ID_B;
    if (!playlistIdA || !playlistIdB) {
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

    // データからトラックIDを収集し、カテゴリーAとBに分類
    const files = await fs.readdir(DATA_DIR);
    const trackUrisA = new Set<string>();
    const trackUrisB = new Set<string>();
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(DATA_DIR, file);
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const json: ComposerData = JSON.parse(raw);
        if (Array.isArray(json.tracks)) {
          const composerNames = [json.name];
          if (json.sortName) {
            composerNames.push(json.sortName);
          }
          if (json.otherNames) {
            composerNames.push(...json.otherNames);
          }

          for (const track of json.tracks) {
            const uri: string | undefined = track.spotifyUrl;
            const prefix = 'https://open.spotify.com/track/';
            if (uri && typeof uri === 'string' && uri.startsWith(prefix)) {
              const trackUri = uri.replace(prefix, 'spotify:track:');
              const artist = track.artist;
              if (artist && composerNames.includes(artist)) {
                trackUrisB.add(trackUri);
              } else {
                trackUrisA.add(trackUri);
              }
            }
          }
        }
      } catch (e) {
        console.warn(`${file}の読み取りに失敗しました:`, e);
      }
    }
    console.log(`カテゴリーA（作曲者以外）: ${trackUrisA.size}曲`);
    console.log(`カテゴリーB（作曲者本人）: ${trackUrisB.size}曲`);

    // プレイリストA: カテゴリーA（作曲者以外）の楽曲を同期
    const existingUrisA = await getAllPlaylistTrackUris(spotifyApi, playlistIdA);
    console.log(`プレイリストAに${existingUrisA.size}曲が登録されています`);

    const uniqueTrackUrisA = trackUrisA.difference(existingUrisA);
    if (uniqueTrackUrisA.size > 0) {
      console.log(`プレイリストAに${uniqueTrackUrisA.size}曲を追加します`);
      try {
        await addTracksToPlaylist(spotifyApi, playlistIdA, uniqueTrackUrisA);
        console.log(`プレイリストAに全${uniqueTrackUrisA.size}曲を追加しました`);
      } catch (e) {
        console.error('プレイリストAへのトラック追加に失敗しました:', e);
      }
    } else {
      console.log('プレイリストAに未追加の曲はありませんでした');
    }

    // プレイリストB: カテゴリーB（作曲者本人）の楽曲を同期
    const existingUrisB = await getAllPlaylistTrackUris(spotifyApi, playlistIdB);
    console.log(`プレイリストBに${existingUrisB.size}曲が登録されています`);

    const uniqueTrackUrisB = trackUrisB.difference(existingUrisB);
    if (uniqueTrackUrisB.size > 0) {
      console.log(`プレイリストBに${uniqueTrackUrisB.size}曲を追加します`);
      try {
        await addTracksToPlaylist(spotifyApi, playlistIdB, uniqueTrackUrisB);
        console.log(`プレイリストBに全${uniqueTrackUrisB.size}曲を追加しました`);
      } catch (e) {
        console.error('プレイリストBへのトラック追加に失敗しました:', e);
      }
    } else {
      console.log('プレイリストBに未追加の曲はありませんでした');
    }

    console.log('全曲の追加が完了しました');
  });
