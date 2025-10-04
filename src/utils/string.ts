import * as wanakana from 'wanakana';

/**
 * ローマ字をカタカナに変換する
 * @param text ローマ字テキスト
 * @returns カタカナ変換後の文字列
 */
export const convertRomajiToKatakana = (text: string): string => {
  // カンマとスペースを削除
  const cleaned = text.replace(/[,\s]/g, '');
  // ローマ字をカタカナに変換
  return wanakana.toKatakana(cleaned, { IMEMode: true });
};
