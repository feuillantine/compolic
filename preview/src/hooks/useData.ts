// データ取得用カスタムフック
// /original/index.html のロジックを移植

import { useEffect, useMemo, useState } from 'react';
import { withBasePath } from '@/lib/base-path';
import type { ComposerFile, DataMap, DataRow, SortState, Track } from '@/types';

async function fetchJsonFileList(): Promise<string[]> {
  try {
    const res = await fetch(withBasePath('data/files.json'));
    if (!res.ok) throw new Error('files.json の取得に失敗');
    return (await res.json()) as string[];
  } catch (e) {
    console.error('JSONファイル一覧の取得に失敗', e);
    return [];
  }
}

async function fetchJson(path: string): Promise<ComposerFile> {
  const res = await fetch(withBasePath(path));
  if (!res.ok) throw new Error(`JSON取得失敗: ${path}`);
  return (await res.json()) as ComposerFile;
}

export function useData() {
  const [dataMap, setDataMap] = useState<DataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const files = await fetchJsonFileList();
        const results = await Promise.all(files.map((p) => fetchJson(p).catch(() => null)));
        const map: DataMap = {};
        files.forEach((path, idx) => {
          const key = path.split('/').pop()?.replace('.json', '') ?? path;
          const val = results[idx] ?? undefined;
          if (val) map[key] = val;
        });
        if (active) setDataMap(map);
      } catch (_e) {
        if (active) setError('データの読み込みに失敗しました');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { dataMap, loading, error } as const;
}

export function useRows(
  dataMap: DataMap,
  options: {
    currentFilter: string | null;
    excludeOwn: boolean;
    sort: SortState;
  },
) {
  const { currentFilter, excludeOwn, sort } = options;

  return useMemo<DataRow[]>(() => {
    let rows: DataRow[] = [];
    const createSearchText = (t: Track, composerName: string) =>
      `${t.title ?? ''} ${t.artist ?? ''} ${composerName}`.toLowerCase();
    const toRows = (key: string, d: ComposerFile, t: Track): DataRow => {
      const composerName = d.name || key;
      return {
        ...t,
        composer: composerName,
        composerOtherNames: d.otherNames || [],
        composerKey: key,
        searchText: createSearchText(t, composerName),
      };
    };

    if (currentFilter) {
      const d = dataMap[currentFilter];
      const tracks = d?.tracks ?? [];
      rows = tracks.map((t) => toRows(currentFilter, d, t));
    } else {
      rows = Object.entries(dataMap).flatMap(([key, d]) =>
        (d.tracks ?? []).map((t) => toRows(key, d, t)),
      );
      // All 時の重複除去
      const seen = new Set<string>();
      rows = rows.filter((r) => {
        if (!r.id) return true;
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
    }

    // 自身/別名アーティストを除外
    if (excludeOwn) {
      if (currentFilter) {
        const d = dataMap[currentFilter];
        const selNames = [d?.name || currentFilter, ...(d?.otherNames || [])];
        rows = rows.filter((r) => !selNames.includes(r.artist ?? ''));
      } else {
        rows = rows.filter((r) => {
          const isSame = (r.artist ?? '') === r.composer;
          const isOther = r.composerOtherNames?.includes(r.artist ?? '') ?? false;
          return !(isSame || isOther);
        });
      }
    }

    // ソート
    rows.sort((a, b) => {
      const va = (a[sort.column] ?? '') as string;
      const vb = (b[sort.column] ?? '') as string;
      if (va < vb) return sort.asc ? -1 : 1;
      if (va > vb) return sort.asc ? 1 : -1;
      return 0;
    });

    return rows;
  }, [dataMap, currentFilter, excludeOwn, sort]);
}
