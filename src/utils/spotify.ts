import SpotifyWebApi from 'spotify-web-api-node';
import { sleep } from './sleep';

/**
 * SpotifyWebApiインスタンスを作成するユーティリティ
 * @param clientId SpotifyアプリのクライアントID
 * @param clientSecret Spotifyアプリのクライアントシークレット
 * @param redirectUri 認証リダイレクトURI
 * @returns 初期化されたSpotifyWebApiインスタンス
 */
export const createSpotifyApi = (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): SpotifyWebApi => {
  return new SpotifyWebApi({ clientId, clientSecret, redirectUri });
};

/**
 * 環境変数からSpotifyの認証情報を取得しアクセストークンをリフレッシュして返す
 * @returns 有効なアクセストークン 取得できなければnull
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
 * 任意の検索クエリでトラックを検索し最初の結果のSpotifyURLを返す
 * @param query SpotifyAPIの検索クエリ
 * @param token 有効なアクセストークン
 * @returns 見つかったトラックの外部URL 見つからなければnull
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
 * 指定したプレイリストの全トラックURIを取得します
 * SpotifyAPIは1回の呼び出しで最大100件しか取得できないためページングで全件取得します
 *
 * @param spotifyApi 認証済みSpotifyWebApiインスタンス
 * @param playlistId プレイリストID（`spotify:playlist:`プレフィックスは除く）
 * @returns プレイリストに含まれるトラックURIのSet
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
 * 指定したプレイリストにトラックURIのバッチを追加します
 *
 * @param spotifyApi 認証済みSpotifyWebApiインスタンス
 * @param playlistId プレイリストID（`spotify:playlist:`プレフィックスは除く）
 * @param uris 追加したいトラックURIのSet（最大100件まで）
 */
export const addTracksToPlaylist = async (
  spotifyApi: SpotifyWebApi,
  playlistId: string,
  uris: Set<string>,
): Promise<void> => {
  const BATCH_LIMIT = 100;
  const INTERVAL_MS = 150;

  const uriArray = [...uris];
  for (let i = 0; i < uriArray.length; i += BATCH_LIMIT) {
    const batch = uriArray.slice(i, i + BATCH_LIMIT);
    await spotifyApi.addTracksToPlaylist(playlistId, batch);
    await sleep(INTERVAL_MS);
  }
};
