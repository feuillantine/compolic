import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import {
  getAllWorks,
  getArtistIdByName,
  getArtistNameById,
  getRecording,
  type Recording,
  type RecordingRelation,
} from '@/utils/music-brainz';
import { sleep } from '@/utils/sleep';
import { loadConfig } from '../config';
import { getAccessToken, searchTrack } from '../utils/spotify';

interface ComposerTrack {
  id: string;
  title: string;
  artist: string;
  isrc: string;
  releaseDate: string;
  spotifyUrl: string;
  isFallback: boolean;
}
interface ComposerData {
  name: string;
  sortName?: string;
  otherNames?: string[];
  tracks: ComposerTrack[];
}

export const getTracksCommand = new Command('get-tracks')
  .description('指定したアーティストの楽曲リストを取得します')
  .option('-a, --artist <artist>', 'アーティスト名')
  .option('--arid <arid>', 'アーティストID')
  .action(async (options) => {
    const DATA_DIR = 'data';
    const FETCH_INTERVAL_MS = 1_200;

    // ------------------------------------------------------------
    // オプション相関チェック
    // ------------------------------------------------------------
    if (!options.arid && !options.artist) {
      throw new Error('`--artist`または`--arid`で作曲者を指定してください');
    } else if (options.arid && options.artist) {
      throw new Error('`--artist`と`--arid`はどちらかを指定してください');
    }

    // ------------------------------------------------------------
    // 環境設定のロード
    // ------------------------------------------------------------
    const config = loadConfig();
    console.log('環境設定をロードしました');

    // ------------------------------------------------------------
    // Spotifyアクセストークン取得
    // ------------------------------------------------------------
    const spotifyToken = await getAccessToken(
      config.SPOTIFY_CLIENT_ID ?? '',
      config.SPOTIFY_CLIENT_SECRET ?? '',
      config.SPOTIFY_REFRESH_TOKEN ?? '',
    );
    if (!spotifyToken) {
      throw new Error('Spotifyのアクセストークンが取得できませんでした');
    }

    // ------------------------------------------------------------
    // アーティスト（ID)の取得
    // ------------------------------------------------------------
    let artistId: string = options.arid;
    let artistName: string = options.artist;
    if (artistId) {
      artistName = await getArtistNameById(artistId);
      if (!artistName) {
        throw new Error(`アーティストIDが無効です: ${artistId}`);
      }
      console.log(`アーティストが見つかりました: ${artistName}`);
    } else if (artistName) {
      artistId = await getArtistIdByName(artistName);
      if (!artistId) {
        throw new Error(`アーティストが見つかりませんでした: ${artistId}`);
      }
      console.log(`アーティストIDが見つかりました: ${artistId}`);
    }

    // ------------------------------------------------------------
    // 保存済トラックデータをロード
    // ------------------------------------------------------------
    const savedTracksFile = path.join(DATA_DIR, `${artistId}.json`);
    let data: string | undefined;
    try {
      data = await fs.readFile(savedTracksFile, 'utf-8');
    } catch {}
    const parsedData: ComposerData = data ? JSON.parse(data) : { name: artistName, tracks: [] };
    const savedTracks: ComposerTrack[] = parsedData.tracks;

    console.log(`${savedTracks.length}個のトラックが保存されています`);
    const savedTrackIds = new Set(savedTracks.map((r) => r.id));

    // ------------------------------------------------------------
    // アーティストの全Worksを取得
    // ------------------------------------------------------------
    const works = (await getAllWorks(artistId))
      // composerとして参加しているWorksに限定する
      .filter((work) => {
        return work.relations.find(
          (relation) =>
            'artist' in relation && relation.type === 'composer' && relation.artist.id === artistId,
        );
      });
    console.log(`${works.length}個のWorksが見つかりました`);

    // ------------------------------------------------------------
    // Workから標準バージョンのRecordingを取得し、詳細情報を取得して保存
    // ------------------------------------------------------------
    for (const work of works) {
      // 明確な標準の定義がないため、対象の可能性が高い性質を持つ候補が優先されるようにソート
      const relations = (
        work.relations?.filter(
          (relation) => 'recording' in relation && relation.recording && !relation.recording.video,
        ) as RecordingRelation[]
      )?.sort((a, b) => {
        // attributesの数が少ない方が先（オフボーカル、TVサイズ、ライブなど）
        const attributeCompare = a.attributes.length - b.attributes.length;
        if (attributeCompare !== 0) {
          return attributeCompare;
        }
        // 曲名が短い方が先（Instrumental, Remixなどを後置）
        const titleCompare = a.recording.title.length - b.recording.title.length;
        if (titleCompare !== 0) {
          return titleCompare;
        }
        // 再生時間が指定されているものが先
        if (a.recording.length !== null && b.recording.length === null) {
          return -1;
        }
        if (a.recording.length === null && b.recording.length !== null) {
          return 1;
        }
        return 0;
      });
      const recording = relations[0]?.recording;
      // Recordingが見つからない場合はスキップ
      if (!recording) {
        continue;
      }

      const recordingId = recording.id;
      // 保存済であればスキップ
      if (savedTrackIds.has(recordingId)) {
        continue;
      }

      // ------------------------------------------------------------
      // Recording の詳細情報を取得
      // ------------------------------------------------------------
      let recordDetail: Recording | undefined;
      try {
        recordDetail = await getRecording(recordingId);
      } catch (e) {
        console.log(e);
      }
      if (!recordDetail) {
        continue;
      }
      const title = recordDetail.title ?? '';
      const artist = recordDetail['artist-credit']?.[0]?.name ?? '';

      let isrc: string | undefined = recordDetail.isrcs?.[0];
      let spotifyUrl: string | undefined = (recordDetail.relations ?? [])
        .map((r) => r.url?.resource)
        .filter((u) => typeof u === 'string' && u.startsWith('https://open.spotify.com'))[0];
      let isFallback = false;

      // ------------------------------------------------------------
      // Spotify APIから不足情報を補完
      // ------------------------------------------------------------
      if (!spotifyUrl) {
        // ISRC検索から行う
        if (isrc) {
          const result = await searchTrack(`isrc:${isrc}`, spotifyToken);
          spotifyUrl = result?.url;
        }
        // 見つからない場合、タイトルとアーティスト名で検索
        if (!spotifyUrl && title && artist) {
          const result = await searchTrack(`track:${title} artist:${artist}`, spotifyToken);
          spotifyUrl = result?.url;
          if (!isrc && result?.isrc) {
            isrc = result?.isrc;
          }
        }
        // いずれかで見つかった時に判別用フラグを有効化
        if (spotifyUrl) {
          isFallback = true;
        }
      }

      // ------------------------------------------------------------
      // 取得した情報を保存リストに追加
      // ------------------------------------------------------------
      savedTracks.push({
        id: recordingId,
        title,
        artist,
        isrc: isrc ?? '',
        releaseDate: recordDetail['first-release-date'] ?? '',
        spotifyUrl: spotifyUrl ?? '',
        isFallback,
      });
      savedTrackIds.add(recordingId);
      console.log(`追加： ${recording.title}`);

      await sleep(FETCH_INTERVAL_MS);
    }

    // ------------------------------------------------------------
    // JSONファイルを更新
    // ------------------------------------------------------------
    const output = { ...parsedData, tracks: savedTracks };
    await fs.writeFile(savedTracksFile, `${JSON.stringify(output, null, 2)}\n`, 'utf-8');
    console.log(`${artistName}の楽曲取得が完了しました`);
  });
