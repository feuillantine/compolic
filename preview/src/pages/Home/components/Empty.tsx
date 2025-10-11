import type * as React from 'react';

/**
 * データが存在しないケースのプレースホルダ行。
 */
export const Empty: React.FC = () => (
  <tr>
    <td className="px-3 py-3 border-t border-border" colSpan={5}>
      <span className="opacity-70">データがありません</span>
    </td>
  </tr>
);
