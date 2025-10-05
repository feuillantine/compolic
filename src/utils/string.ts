import * as wanakana from 'wanakana';

/**
 * ローマ字をカタカナに変換する
 * @param text ローマ字テキスト
 * @returns カタカナ変換後の文字列
 */
export const convertRomajiToKatakana = (text: string): string => {
  // カンマとスペースを削除
  let cleaned = text.replace(/[,\s]/g, '');

  // マクロン（長音符号）を対応する母音列に変換
  cleaned = cleaned
    .replace(/ā/g, 'aa')
    .replace(/Ā/g, 'Aa')
    .replace(/ī/g, 'ii')
    .replace(/Ī/g, 'Ii')
    .replace(/ū/g, 'uu')
    .replace(/Ū/g, 'Uu')
    .replace(/ē/g, 'ei')
    .replace(/Ē/g, 'Ei')
    .replace(/ō/g, 'ou')
    .replace(/Ō/g, 'Ou');

  // "ya", "yu", "yo"の直前の子音+"o"を"ou"に変換（例: Ryota -> Ryouta）
  cleaned = cleaned.replace(/([bdfghkmnprstvwyz])o([yt][auo])/gi, '$1ou$2');

  // ローマ字をカタカナに変換
  return wanakana.toKatakana(cleaned, { IMEMode: true });
};
