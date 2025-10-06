import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { loadConfig } from '../config';
import type { ComposerData } from '../types/composer-data';
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

    const mainPlaylistId = config.SPOTIFY_MAIN_PLAYLIST_ID;
    const subPlaylistId = config.SPOTIFY_SUB_PLAYLIST_ID;
    if (!mainPlaylistId || !subPlaylistId) {
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

    // データからトラックIDを収集し、メインとサブに分類
    const files = await fs.readdir(DATA_DIR);
    const mainTrackUris = new Set<string>();
    const subTrackUris = new Set<string>();
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
                subTrackUris.add(trackUri);
              } else {
                mainTrackUris.add(trackUri);
              }
            }
          }
        }
      } catch (e) {
        console.warn(`${file}の読み取りに失敗しました:`, e);
      }
    }
    console.log(`メインプレイリスト（作曲者以外）: ${mainTrackUris.size}曲`);
    console.log(`サブプレイリスト（作曲者本人）: ${subTrackUris.size}曲`);

    // プレイリストへの同期処理
    const playlists = [
      {
        id: mainPlaylistId,
        name: 'メインプレイリスト',
        trackUris: mainTrackUris,
      },
      {
        id: subPlaylistId,
        name: 'サブプレイリスト',
        trackUris: subTrackUris,
      },
    ];

    for (const playlist of playlists) {
      const existingUris = await getAllPlaylistTrackUris(spotifyApi, playlist.id);
      console.log(`${playlist.name}に${existingUris.size}曲が登録されています`);

      const uniqueTrackUris = playlist.trackUris.difference(existingUris);
      if (uniqueTrackUris.size > 0) {
        console.log(`${playlist.name}に${uniqueTrackUris.size}曲を追加します`);
        try {
          await addTracksToPlaylist(spotifyApi, playlist.id, uniqueTrackUris);
          console.log(`${playlist.name}に全${uniqueTrackUris.size}曲を追加しました`);
        } catch (e) {
          console.error(`${playlist.name}へのトラック追加に失敗しました:`, e);
        }
      } else {
        console.log(`${playlist.name}に未追加の曲はありませんでした`);
      }
    }

    console.log('全曲の追加が完了しました');
  });
