import SpotifyWebApi from 'spotify-web-api-node';
import { sleep } from './sleep';

/**
 * SpotifyWebApi インスタンスを作成するユーティリティ
 * @param clientId Spotify アプリのクライアント ID
 * @param clientSecret Spotify アプリのクライアントシークレット
 * @param redirectUri 認証リダイレクト URI
 * @returns 初期化された SpotifyWebApi インスタンス
 */
export const createSpotifyApi = (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): SpotifyWebApi => {
  return new SpotifyWebApi({ clientId, clientSecret, redirectUri });
};

/**
 * 環境変数から Spotify の認証情報を取得し、アクセストークンをリフレッシュして返す。
 * @returns 有効なアクセストークン、取得できなければ null
 */
export const getAccessToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string | null> => {
  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    refreshToken,
  });

  try {
    const data = await spotifyApi.refreshAccessToken();
    return data.body.access_token ?? null;
  } catch {
    return null;
  }
};

/**
 * 任意の検索クエリでトラックを検索し、最初の結果の Spotify URL を返す。
 * @param query Spotify API の検索クエリ
 * @param token 有効なアクセストークン
 * @returns 見つかったトラックの外部 URL、見つからなければ null
 */
export const searchTrack = async (
  query: string,
  token: string,
): Promise<{ url?: string; isrc?: string } | null> => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  try {
    const result = await spotifyApi.searchTracks(query, {
      market: 'JP',
      limit: 1,
    });
    const track = result.body.tracks?.items?.[0];
    return track
      ? {
          url: track?.external_urls?.spotify,
          isrc: track?.external_ids?.isrc,
        }
      : null;
  } catch {
    return null;
  }
};

/**
 * 指定したプレイリストの全トラック URI を取得します。
 * Spotify API は 1 回の呼び出しで最大 100 件しか取得できないため、ページングで全件取得します。
 *
 * @param spotifyApi 認証済み SpotifyWebApi インスタンス
 * @param playlistId プレイリスト ID（`spotify:playlist:` プレフィックスは除く）
 * @returns プレイリストに含まれるトラック URI の Set
 */
export const getAllPlaylistTrackUris = async (
  spotifyApi: SpotifyWebApi,
  playlistId: string,
): Promise<Set<string>> => {
  const BATCH_LIMIT = 100;
  const INTERVAL_MS = 150;

  let offset = 0;
  const allUris = new Set<string>();

  while (true) {
    console.log(offset);
    const response = await spotifyApi.getPlaylistTracks(playlistId, {
      limit: BATCH_LIMIT,
      offset,
    });
    const items = response.body.items ?? [];
    for (const item of items) {
      const uri = item.track?.uri;
      if (uri) {
        allUris.add(uri);
      }
    }
    if (items.length < BATCH_LIMIT) {
      break;
    }
    offset += BATCH_LIMIT;
    await sleep(INTERVAL_MS);
  }

  return allUris;
};

/**
 * 指定したプレイリストにトラック URI のバッチを追加します。
 *
 * @param spotifyApi 認証済み SpotifyWebApi インスタンス
 * @param playlistId プレイリスト ID（`spotify:playlist:` プレフィックスは除く）
 * @param uris 追加したいトラック URI の配列（最大 100 件まで）
 */
export const addTracksToPlaylist = async (
  spotifyApi: SpotifyWebApi,
  playlistId: string,
  uris: string[],
): Promise<void> => {
  const BATCH_LIMIT = 100;
  const INTERVAL_MS = 150;

  for (let i = 0; i < uris.length; i += BATCH_LIMIT) {
    const batch = uris.slice(i, i + BATCH_LIMIT);
    await spotifyApi.addTracksToPlaylist(playlistId, batch);
    await sleep(INTERVAL_MS);
  }
};
