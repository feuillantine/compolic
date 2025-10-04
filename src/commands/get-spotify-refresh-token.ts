import { Command } from 'commander';
import express from 'express';
import type SpotifyWebApi from 'spotify-web-api-node';
import { loadConfig } from '../config';
import { createSpotifyApi } from '../utils/spotify';

const LOGIN_URL = 'http://127.0.0.1:8888/login';
const REDIRECT_URL = 'http://127.0.0.1:8888/callback';
const REQUIRED_SCOPES = ['user-library-read', 'playlist-modify-public', 'playlist-modify-private'];

// サーバー管理
class AuthServer {
  private server: ReturnType<express.Application['listen']> | null = null;
  private static readonly TIMEOUT_MS = 5 * 60 * 1000;
  private readonly app: express.Application;

  constructor() {
    this.app = express();
    this.setupSignalHandlers();
  }

  start(spotifyApi: SpotifyWebApi): void {
    this.setupRoutes(spotifyApi);
    this.server = this.app.listen(8888, () => {
      console.log('\nアカウントの認証サーバーを起動中...');
      console.log(`${LOGIN_URL} にアクセスしてください`);
    });
    this.setupTimeout();
  }

  private setupRoutes(spotifyApi: SpotifyWebApi): void {
    this.app.get('/login', (_req, res) => {
      const authorizeURL = spotifyApi.createAuthorizeURL(REQUIRED_SCOPES, 'state');
      console.log('\nSpotify認証ページへリダイレクトします...');
      res.redirect(authorizeURL);
    });

    this.app.get('/callback', async (req, res) => {
      const { code } = req.query;

      if (!code) {
        res.status(400).send('認証コードが見つかりません');
        this.stop();
        return;
      }

      try {
        const data = await spotifyApi.authorizationCodeGrant(code as string);
        const { refresh_token } = data.body;

        console.log('\n--- 認証成功 ---');
        console.log('リフレッシュトークン:', refresh_token);
        console.log('-----------------');
        console.log(
          '\n上記のリフレッシュトークンを.envファイルのSPOTIFY_REFRESH_TOKENにコピーしてください',
        );

        res.send('アカウントの認証が完了しました\nこのウィンドウを閉じてください');
      } catch (error) {
        console.error('\n認証コードの取得中にエラーが発生:', error);
        res.status(500).send('認証中にエラーが発生しました');
      } finally {
        this.stop();
      }
    });
  }

  private setupTimeout(): void {
    setTimeout(() => {
      if (this.server?.listening) {
        console.error('\n認証がタイムアウトしました\nサーバーを停止します');
        this.stop();
      }
    }, AuthServer.TIMEOUT_MS);
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      console.log('\nCtrl+Cが押されました\nサーバーを停止します...');
      this.stop();
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close(() => {
        console.log('サーバーを停止しました');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

export const getSpotifyRefreshTokenCommand = new Command('get-spotify-refresh-token')
  .description('SpotifyのRefreshトークンを発行します')
  .action(async () => {
    const config = loadConfig();
    const spotifyApi = createSpotifyApi(
      config.SPOTIFY_CLIENT_ID ?? '',
      config.SPOTIFY_CLIENT_SECRET ?? '',
      REDIRECT_URL,
    );
    const server = new AuthServer();
    server.start(spotifyApi);
  });
