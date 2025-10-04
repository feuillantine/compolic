import * as wanakana from 'wanakana';

/**
 * ソート名をカタカナに変換する
 * - カンマを削除
 * - ローマ字/英語をカタカナに変換
 * - 数字はそのまま保持
 * @param sortName MusicBrainzから取得したsort-name
 * @returns カタカナ変換後の文字列
 */
export const convertSortNameToKatakana = (sortName: string): string => {
  // カンマを削除してスペースに置き換え
  const withoutCommas = sortName.replace(/,/g, ' ').trim();

  // ローマ字をカタカナに変換
  // IMEモードを使用して、より自然な変換を行う
  const katakana = wanakana.toKatakana(withoutCommas, { IMEMode: true });

  return katakana;
};
