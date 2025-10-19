# Compolic
MusicBrainzを組み合わせて、特定の作曲者の提供楽曲情報を収集し、  
一覧ページやSpotifyプレイリストへ同期するためのCLIツール＋GitHub Actionsワークフロー群です

## 主な特徴
- MusicBrainzからcomposerとして紐付くWorkを全取得し、代表Recordingを推定して保存
- Recording詳細からISRC/Spotify URLを取得（無い場合はSpotify API検索でフォールバック）
- 複数アーティスト一括取得、取得済作曲者の新規差分一括再取得コマンド搭載
- 取得データを閲覧するためのプレビュー用ページ
- Spotifyプレイリストへの同期コマンド

## ディレクトリ構成 (抜粋)
```
.github/             自動更新用ワークフロー
data/                収集した{artistId}.jsonを格納
preview/             プレビュー用ページ
src/commands/        各CLIサブコマンド
src/utils/           機能別ユーティリティ
```

## 必要要件
- Node.js 22+
- Spotify開発者アプリのクレデンシャル(Client ID/Secret)
- 同期用Spotifyプレイリスト（2つ）

## セットアップ（GitHub Actions）
GitHub Actionsで自動更新を利用する場合、以下のSecretsを設定する必要があります。

### 必須Secrets
1. **PAT_TOKEN**: Personal Access Token
   - 作成方法:
     - **Fine-grained tokens**: Settings → Developer settings → Personal access tokens → Fine-grained tokens
       - Repository access: Only select repositories（このリポジトリのみ選択）
       - Permissions:
         - Contents: Read and write
         - Metadata: Read-only（自動的に設定される）
         - Workflows: Read and write
   - 用途: 自動更新時にデプロイワークフローをトリガーするために使用
   - 注意: 通常のGITHUB_TOKENでは他のワークフローをトリガーできないため、PATが必要
2. **SPOTIFY_CLIENT_ID**: Spotify開発者アプリのClient ID
3. **SPOTIFY_CLIENT_SECRET**: Spotify開発者アプリのClient Secret
4. **SPOTIFY_REFRESH_TOKEN**: Spotifyリフレッシュトークン
   - ローカルで`npm run start get-spotify-refresh-token`を実行して取得
5. **SPOTIFY_MAIN_PLAYLIST_ID**: メインプレイリストID（作曲者以外がアーティストの楽曲用）
6. **SPOTIFY_SUB_PLAYLIST_ID**: サブプレイリストID（作曲者本人がアーティストの楽曲用）

## セットアップ（ローカル）
1. 依存インストール
   ```bash
   npm ci
   ```
2. `.env`を作成
   ```env
   # Spotify開発者アプリを作成して取得
   SPOTIFY_CLIENT_ID=xxxxx
   SPOTIFY_CLIENT_SECRET=xxxxx
   # `npm run start get-spotify-refresh-token`で取得
   SPOTIFY_REFRESH_TOKEN=xxxxx
   # Spotifyでプレイリストを2つ作成して取得
   # メインプレイリスト: 作曲者以外がアーティストの楽曲
   SPOTIFY_MAIN_PLAYLIST_ID=xxxxxxxxxxxxxxxxxxxxxx
   # サブプレイリスト: 作曲者本人がアーティストの楽曲
   SPOTIFY_SUB_PLAYLIST_ID=xxxxxxxxxxxxxxxxxxxxxx
   ```

## 利用方法 (主要コマンド)
```
npm run start <command> -- [options]
```

| コマンド | 説明 | 主なオプション |
|----------|------|----------------|
| `get-tracks` | 単一アーティストの楽曲収集 | `--artist <name>` or `--arid <musicbrainz_id>` |
| `get-multiple-tracks` | 複数アーティスト一括収集 | `--artists "A,B,C"` |
| `update-tracks` | 既存`data/*.json`の全再取得 | なし |
| `generate-index` | `data/files.json`を生成 | なし |
| `sync-tracks-to-playlist` | `spotifyUrl`を2つのSpotifyプレイリストへ差分追加（作曲者本人/それ以外で分類） | なし |
| `get-spotify-refresh-token` | リフレッシュトークン取得(ローカルでOAuth) | なし |

### 例: アーティスト名で収集
```bash
npm run start get-tracks -- --artist "Example Artist"
```

### 例: MusicBrainzアーティストIDで収集
```bash
npm run start get-tracks -- --arid 12345678-abcd-ef01-2345-6789abcdef01
```

### 例: 複数アーティスト
```bash
npm run start get-multiple-tracks -- --artists "ArtistA,ArtistB"
```

### 例: プレイリスト同期
```bash
npm run start sync-tracks-to-playlist
```

## JSON フォーマット (例)

```json
{
  "name": "作曲者 名前",
  "sortName": "サッキョクシャナマエ",
  "tracks": [
    {
      "id": "12345678-abcd-ef01-2345-6789abcdef01",
      "title": "Song Title",
      "artist": "Example Artist",
      "isrc": "JPAB01234567",
      "releaseDate": "2024-03-01",
      "spotifyUrl": "https://open.spotify.com/track/xxxxx",
      "isFallback": false
    }
  ]
}
```

※`isFallback`はSpotify URLをMusicBrainzではなくSpotify検索から補完した場合にtrue

## ライセンス
MIT
