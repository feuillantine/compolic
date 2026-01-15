import type * as React from 'react';
import { SpotifyIcon } from '@/components/icons/SpotifyIcon';
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import type { DataRow } from '@/types';

/**
 * 一覧テーブルの1行分を描画する。
 */
export type HomeCardProps = {
  /** 行データ */
  row: DataRow;
  /** 作曲者名も表示するか */
  showComposer: boolean;
};

export const HomeCard: React.FC<HomeCardProps> = ({ row, showComposer }) => {
  return (
    <tr>
      <Td className="font-medium">
        <span className="block">{row.title ?? ''}</span>
      </Td>
      <Td>
        <span className="block">
          {showComposer && row.composer && row.artist !== row.composer
            ? `${row.artist}（${row.composer}）`
            : (row.artist ?? '')}
        </span>
      </Td>
      <Td>
        <span className="block whitespace-nowrap">{row.releaseDate ?? '-'}</span>
      </Td>
      <Td className="w-px md:pt-[7px] md:pb-[6px] leading-none">
        {row.spotifyUrl ? (
          <a
            className="inline-flex items-center justify-center transition-colors duration-200"
            href={row.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Spotifyで開く"
          >
            <SpotifyIcon className="size-4 md:size-5 text-gray-500 hover:text-[#1DB954] dark:text-gray-400 dark:hover:text-[#1DB954]" />
          </a>
        ) : (
          <a
            className="inline-flex items-center justify-center transition-colors duration-200"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${row.artist ?? ''} ${row.title ?? ''}`)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTubeで開く"
          >
            <YouTubeIcon className="size-4 md:size-5 text-gray-500 hover:text-[#C4302B] dark:text-gray-400 dark:hover:text-[#C4302B]" />
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
