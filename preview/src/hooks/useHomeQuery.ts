// Homeページ用のクエリ状態管理
// URLクエリ(artist id)は後方互換のため 'id' のみ同期
// それ以外はクライアント状態で保持

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortState } from '@/types';

/**
 * Homeページで使用する検索・フィルタ系のクエリ状態。
 */
export type HomeQueryState = {
  // 検索語
  q: string;
  setQ: (v: string) => void;
  // アーティストフィルタ
  currentFilter: string | null;
  setCurrentFilter: (v: string | null) => void;
  // 自身/別名義の除外
  excludeOwn: boolean;
  setExcludeOwn: (v: boolean) => void;
  // ソート
  sort: SortState;
  toggleSort: (col: SortState['column']) => void;
};

export function useHomeQuery(): HomeQueryState {
  const [params, setParams] = useSearchParams();

  // 初期 'id' を固定化して初期状態に使用
  const initialIdRef = React.useRef<string | null>(params.get('id'));
  const [currentFilter, setCurrentFilterState] = React.useState<string | null>(
    initialIdRef.current,
  );
  const [q, setQ] = React.useState('');
  const [excludeOwn, setExcludeOwn] = React.useState(false);
  const [sort, setSort] = React.useState<SortState>({ column: 'releaseDate', asc: false });

  const setCurrentFilter = React.useCallback(
    (v: string | null) => {
      setCurrentFilterState(v);
      const next = new URLSearchParams(params);
      if (v) next.set('id', v);
      else next.delete('id');
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const toggleSort = React.useCallback((col: SortState['column']) => {
    setSort((prev) =>
      prev.column === col ? { ...prev, asc: !prev.asc } : { column: col, asc: true },
    );
  }, []);

  return {
    q,
    setQ,
    currentFilter,
    setCurrentFilter,
    excludeOwn,
    setExcludeOwn,
    sort,
    toggleSort,
  };
}
