import type * as React from 'react';

/**
 * エラー発生時に内容を伝えるメッセージ行。
 */
export type ErrorViewProps = {
  /** ユーザーに伝えるメッセージ */
  message: string;
};

export const ErrorView: React.FC<ErrorViewProps> = ({ message }) => (
  <tr>
    <td className="px-3 py-3 text-destructive" colSpan={5}>
      {message}
    </td>
  </tr>
);
