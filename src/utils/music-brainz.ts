import { sleep } from './sleep';

const USER_AGENT = 'song-finder/1.0.0 ( https://example.com )';
const MAX_LIMIT = 100;
const FETCH_INTERVAL_MS = 1_000;

interface Relation {
  type: string;
  attributes: string[];
}

export type RecordingRelation = Relation & {
  recording: {
    id: string;
    title: string;
    video: boolean;
    length: number | null;
  };
};

type ArtistRelation = Relation & {
  artist: {
    id: string;
    name: string;
  };
};

type UrlRelation = Relation & {
  url: {
    resource: string;
    id: string;
  };
};

interface Works {
  relations: (RecordingRelation | ArtistRelation)[];
}

export interface Recording {
  title: string;
  'first-release-date'?: string;
  'artist-credit': {
    name: string;
  }[];
  isrcs: string[];
  relations: UrlRelation[];
}

/**
 * アーティスト名からMusicBrainzのアーティストIDを取得する
 * @param name アーティスト名
 * @returns アーティストID
 */
export const getArtistIdByName = async (name: string): Promise<string> => {
  const searchUrl = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(name)}&limit=1&fmt=json`;
  const response = await fetch(searchUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`アーティストの検索に失敗しました: ${response.status}`);
  }

  const json = (await response.json()) as { artists?: { id: string }[] };
  return json.artists?.[0]?.id ?? '';
};

/**
 * MusicBrainzのアーティストIDからアーティスト名を取得する
 * @param name アーティスト名
 * @returns アーティストID
 */
export const getArtistNameById = async (id: string): Promise<string> => {
  const lookupUrl = `https://musicbrainz.org/ws/2/artist/${id}?fmt=json`;
  const response = await fetch(lookupUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`アーティストの取得に失敗しました（ID: ${id}）: ${response.status}`);
  }

  const json = (await response.json()) as { name: string };
  return json.name ?? '';
};

/**
 * 1ページ分の指定アーティストのWorksを取得する
 * @param artistId アーティストID
 * @param limit 1ページあたりの取得件数
 * @param offset 取得開始オフセット
 * @returns Worksの配列
 */
export const fetchWorksPage = async (
  artistId: string,
  limit: number,
  offset: number,
): Promise<Works[]> => {
  const searchUrl = `https://musicbrainz.org/ws/2/work?artist=${artistId}&inc=recording-rels+artist-rels&limit=${limit}&offset=${offset}&fmt=json`;
  const response = await fetch(searchUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    console.error(response);
    throw new Error(`Workの検索に失敗しました: ${response.status}`);
  }
  const json = (await response.json()) as { works: Works[] };
  return json.works ?? [];
};

/**
 * 指定アーティストの全Worksを取得する
 * @param artistId アーティストID
 * @returns 全Worksの配列
 */
export const getAllWorks = async (artistId: string): Promise<Works[]> => {
  let offset = 0;
  const all: Works[] = [];
  while (true) {
    const batch = await fetchWorksPage(artistId, MAX_LIMIT, offset);
    all.push(...batch);
    if (batch.length < MAX_LIMIT) {
      break;
    }
    offset += MAX_LIMIT;
    await sleep(FETCH_INTERVAL_MS);
  }
  return all;
};

/**
 * Recordingを取得する
 * @param recordingId Recording ID
 * @returns MusicBrainz の Recording JSON
 */
export const getRecording = async (recordingId: string): Promise<Recording> => {
  const lookupUrl = `https://musicbrainz.org/ws/2/recording/${recordingId}?inc=isrcs+url-rels+artists&fmt=json`;
  const response = await fetch(lookupUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Recordingの取得に失敗しました（ID: ${recordingId}）: ${response.status}`);
  }

  return (await response.json()) as Recording;
};
