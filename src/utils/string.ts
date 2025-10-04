import * as wanakana from 'wanakana';

/**
 * ローマ字をカタカナに変換する
 * - カンマとスペースを削除
 * - ローマ字/英語をカタカナに変換
 * - 数字はそのまま保持
 * @param text ローマ字テキスト
 * @returns カタカナ変換後の文字列
 */
export const convertRomajiToKatakana = (text: string): string => {
  // カンマとスペースを削除
  const cleaned = text.replace(/[,\s]/g, '');

  // ローマ字をカタカナに変換
  // IMEモードを使用して、より自然な変換を行う
  const katakana = wanakana.toKatakana(cleaned, { IMEMode: true });

  return katakana;
};
