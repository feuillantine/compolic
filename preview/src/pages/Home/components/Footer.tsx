import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * 一覧下部に表示する件数サマリ。
 */
export type FooterProps = {
  /** 表示件数 */
  total: number;
  /** 全件数 */
  overall?: number;
  /** 全件表示ボタンを出すか */
  showAllButton?: boolean;
  /** 全件表示クリック */
  onShowAll?: () => void;
};

export const Footer: React.FC<FooterProps> = ({ total, overall, showAllButton, onShowAll }) => {
  return (
    <div className="flex justify-between text-xs space-y-2">
      <div className="flex items-center gap-2 opacity-70">
        <span>表示件数</span>
        <Badge>{total.toLocaleString()}</Badge>
      </div>
      {overall !== undefined && showAllButton && onShowAll && (
        <div>
          <Button type="button" size="sm" onClick={onShowAll} aria-label="全件表示">
            {`全件（${overall.toLocaleString()}件）表示`}
          </Button>
        </div>
      )}
    </div>
  );
};
