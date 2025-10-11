// データ型定義
// すべて日本語コメントで記述

export type Track = {
  id?: string;
  title?: string;
  artist?: string;
  releaseDate?: string;
  isrc?: string;
  spotifyUrl?: string;
};

export type ComposerFile = {
  name?: string;
  sortName?: string;
  otherNames?: string[];
  tracks?: Track[];
};

export type DataMap = Record<string, ComposerFile>;

export type DataRow = Track & {
  composer: string; // 作曲者の表示名
  composerOtherNames: string[]; // 別名
  composerKey: string; // JSONファイルのキー
  searchText: string; // 検索用に正規化した文字列
};

export type SortState = {
  column: 'title' | 'artist' | 'releaseDate';
  asc: boolean;
};

// メモ: DTO と ViewModel の使い分け
// - ComposerFile/Track は外部JSONの構造(DTO)
// - DataRow は画面表示のために加工した構造(ViewModel)
// 画面コンポーネントは極力 DataRow を受け取り、DTO への依存を避ける
