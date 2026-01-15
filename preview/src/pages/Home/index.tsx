import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';
import { useData, useRows } from '@/hooks/useData';
import { useHomeQuery } from '@/hooks/useHomeQuery';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { List } from './components/List';
import { Nav } from './components/Nav';
import { Toolbar } from './components/Toolbar';

export default function Home() {
  // クエリパラメータでアーティスト選択とモーダル状態を保持
  const [params, setParams] = useSearchParams();
  // 初期の 'id' は useHomeQuery 内で参照
  const { q, setQ, currentFilter, setCurrentFilter, excludeOwn, setExcludeOwn, sort, toggleSort } =
    useHomeQuery();
  const { dataMap, loading, error } = useData();
  const queryTokens = React.useMemo(() => {
    const normalized = q.trim().toLowerCase();
    if (!normalized) return [] as string[];
    return normalized.split(/\s+/).filter(Boolean);
  }, [q]);

  // アーティスト一覧
  const artistKeys = React.useMemo(() => {
    return Object.keys(dataMap).sort((a, b) => {
      const nameA = dataMap[a].sortName || dataMap[a].name || a;
      const nameB = dataMap[b].sortName || dataMap[b].name || b;
      return nameA.localeCompare(nameB);
    });
  }, [dataMap]);

  // 行データ + 検索
  const rowsAll = useRows(dataMap, { currentFilter, excludeOwn, sort });
  const rows = React.useMemo(() => {
    if (queryTokens.length === 0) return rowsAll;
    return rowsAll.filter((r) => {
      const hay = r.searchText || '';
      return queryTokens.every((t) => hay.includes(t));
    });
  }, [rowsAll, queryTokens]);

  const [showAllRows, setShowAllRows] = React.useState(false);
  React.useEffect(() => {
    if (currentFilter !== undefined) {
      setShowAllRows(false);
    }
  }, [currentFilter]);
  const PREVIEW_LIMIT = 300;
  const isAllSelected = currentFilter === null;
  const shouldLimitRows = isAllSelected && !showAllRows && rows.length > PREVIEW_LIMIT;
  const displayedRows = React.useMemo(
    () => (shouldLimitRows ? rows.slice(0, PREVIEW_LIMIT) : rows),
    [rows, shouldLimitRows],
  );
  const handleShowAllRows = React.useCallback(() => {
    setShowAllRows(true);
  }, []);

  // パラメータ更新
  const updateIdParam = React.useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params);
      if (id) next.set('id', id);
      else next.delete('id');
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  // アーティスト選択
  const handleSelect = (val: string) => {
    const v = val || null;
    setShowAllRows(false);
    setCurrentFilter(v);
    updateIdParam(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // モーダル
  const isAboutOpen = params.get('modal') === 'about';
  const closeAbout = () => {
    const next = new URLSearchParams(params);
    next.delete('modal');
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 bg-card md:rounded-lg p-3 md:p-4 shadow-sm">
      {/* サイドバー */}
      <aside className="hidden md:block sticky top-4 self-start">
        <Nav>
          <button
            type="button"
            className={`w-full text-left px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-primary-10 ${!currentFilter ? 'bg-primary-20' : ''}`}
            onClick={() => handleSelect('')}
          >
            All
          </button>
          {artistKeys.map((key) => {
            const name = dataMap[key].name || key;
            const active = currentFilter === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-primary-10 ${active ? 'bg-primary-20' : ''}`}
              >
                {name}
              </button>
            );
          })}
        </Nav>
      </aside>

      {/* コンテンツ */}
      <section className="space-y-4">
        <StatusBar loading={loading} error={error} />
        <Toolbar
          artistKeys={artistKeys}
          currentFilter={currentFilter}
          onSelect={handleSelect}
          q={q}
          onQueryChange={setQ}
          excludeOwn={excludeOwn}
          onToggleExcludeOwn={setExcludeOwn}
          dataMap={dataMap}
        />
        <List
          loading={loading}
          error={error}
          rows={displayedRows}
          sort={sort}
          onToggleSort={toggleSort}
          currentFilter={currentFilter}
        />
        <Footer
          total={displayedRows.length}
          overall={rows.length}
          showAllButton={shouldLimitRows}
          onShowAll={handleShowAllRows}
        />
      </section>

      {/* about モーダル */}
      <AboutModal open={isAboutOpen} onClose={closeAbout} />
    </div>
  );
}

// テーブルセル/ヘッダーは List/Card に移譲
