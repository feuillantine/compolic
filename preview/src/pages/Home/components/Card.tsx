import type * as React from 'react';
import type { DataRow } from '@/types';

/**
 * 一覧テーブルの1行分を描画する。
 */
export type HomeCardProps = {
  /** 行データ */
  row: DataRow;
};

export const HomeCard: React.FC<HomeCardProps> = ({ row }) => {
  return (
    <tr>
      <Td className="font-medium">
        <span className="block">{row.title ?? ''}</span>
      </Td>
      <Td>
        <span className="block">{row.artist ?? ''}</span>
      </Td>
      <Td>
        <span className="block whitespace-nowrap">{row.releaseDate ?? '-'}</span>
      </Td>
      <Td className="font-mono text-xs hidden md:table-cell">
        <span className="block truncate">{row.isrc ?? '-'}</span>
      </Td>
      <Td>
        {row.spotifyUrl ? (
          <a className="underline" href={row.spotifyUrl} target="_blank" rel="noreferrer">
            Spotify
          </a>
        ) : (
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${row.artist ?? ''} ${row.title ?? ''}`)}`}
          >
            YouTube
          </a>
        )}
      </Td>
    </tr>
  );
};

const Td: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <td className={`p-2 md:px-3 md:py-2 border-t border-border align-top ${className ?? ''}`}>
    {children}
  </td>
);
