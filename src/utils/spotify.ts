import SpotifyWebApi from 'spotify-web-api-node';

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
