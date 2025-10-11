import type * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { DataMap } from '@/types';

/**
 * Homeページ上部の検索/フィルタ操作をまとめたツールバー。
 */
export type ToolbarProps = {
  /** アーティストキー一覧 */
  artistKeys: string[];
  /** アクティブなフィルタ(アーティストID) */
  currentFilter: string | null;
  /** アーティスト選択ハンドラ */
  onSelect: (id: string) => void;
  /** 検索クエリ */
  q: string;
  /** 検索クエリ変更 */
  onQueryChange: (v: string) => void;
  /** 自身のグループ/別名義などを除外 */
  excludeOwn: boolean;
  /** 除外トグル変更 */
  onToggleExcludeOwn: (v: boolean) => void;
  /** 表示名解決用のデータマップ */
  dataMap: DataMap;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  artistKeys,
  currentFilter,
  onSelect,
  q,
  onQueryChange,
  excludeOwn,
  onToggleExcludeOwn,
  dataMap,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5">
      {/* スマホ向けセレクト */}
      <div className="flex-1 md:hidden">
        <Select
          value={currentFilter ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full"
        >
          <option value="">All</option>
          {artistKeys.map((key) => (
            <option key={key} value={key}>
              {dataMap[key]?.name || key}
            </option>
          ))}
        </Select>
      </div>

      {/* 検索 */}
      <div className="flex-1">
        <Input
          placeholder="検索: タイトル/アーティスト/作曲者"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {/* 除外トグル */}
      <div className="inline-flex items-center gap-2">
        <Switch
          id="exclude-own"
          checked={excludeOwn}
          onChange={(e) => onToggleExcludeOwn(e.currentTarget.checked)}
        />
        <label htmlFor="exclude-own" className="cursor-pointer">
          作曲者自身・所属グループの曲を除外
        </label>
      </div>
    </div>
  );
};
