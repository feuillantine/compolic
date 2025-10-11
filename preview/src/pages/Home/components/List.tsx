import type * as React from 'react';
import { CardContent, Card as UICard } from '@/components/ui/card';
import type { DataRow, SortState } from '@/types';
import { HomeCard } from './Card';
import { Empty } from './Empty';
import { ErrorView } from './Error';

/**
 * 楽曲一覧テーブルを描画し、ロード・エラー・空表示を切り替える。
 */
export type ListProps = {
  /** ローディング状態 */
  loading: boolean;
  /** エラー内容。nullなら正常 */
  error: string | null;
  /** テーブルに渡すデータ行 */
  rows: DataRow[];
  /** 現在のソート状態 */
  sort: SortState;
  /** ヘッダクリック時にソートを切り替える */
  onToggleSort: (col: SortState['column']) => void;
};

export const List: React.FC<ListProps> = ({ loading, error, rows, sort, onToggleSort }) => {
  return (
    <UICard>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full table-fixed table-zebra text-[10px] md:text-[12px]">
          <thead>
            <tr>
              <Th
                label="Title"
                active={sort.column === 'title'}
                asc={sort.asc}
                onClick={() => onToggleSort('title')}
                className="md:w-[40%]"
              />
              <Th
                label="Artist"
                active={sort.column === 'artist'}
                asc={sort.asc}
                onClick={() => onToggleSort('artist')}
              />
              <Th
                label="Release"
                active={sort.column === 'releaseDate'}
                asc={sort.asc}
                onClick={() => onToggleSort('releaseDate')}
                className="w-[9em]"
              />
              <th className="w-[10.5em] p-2 md:px-3 md:py-2 text-left hidden md:table-cell">
                ISRC
              </th>
              <th className="p-2 md:px-3 text-left w-[6.5em] md:w-[7em]">Link</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3" colSpan={5}>
                  読み込み中
                </td>
              </tr>
            )}
            {error && !loading && <ErrorView message={error} />}
            {!loading && !error && rows.length === 0 && <Empty />}
            {!loading &&
              !error &&
              rows.map((r, i) => <HomeCard key={`${r.id ?? 'row'}-${i}`} row={r} />)}
          </tbody>
        </table>
      </CardContent>
    </UICard>
  );
};

type ThProps = {
  label: string;
  active?: boolean;
  asc?: boolean;
  className?: string;
  onClick?: () => void;
};

const Th: React.FC<ThProps> = ({ label, active, asc, onClick, className }) => (
  <th
    onClick={onClick}
    className={`p-2 md:px-3 text-left select-none cursor-pointer ${className ?? ''}`}
    title="クリックでソート"
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {active && <span>{asc ? '▲' : '▼'}</span>}
    </span>
  </th>
);
