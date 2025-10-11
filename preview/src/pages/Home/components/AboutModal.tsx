import type * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type AboutModalProps = {
  open: boolean;
  onClose: () => void;
};

export const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Compolicについて</DialogTitle>
          <DialogDescription className="sr-only">Compolicの概要</DialogDescription>
        </DialogHeader>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            Compolicは、
            <a
              className="underline"
              href="https://x.com/____feu____"
              target="_blank"
              rel="noreferrer"
            >
              feu
            </a>
            が気になる作曲家の楽曲を
            <a
              className="underline"
              href="https://musicbrainz.org/"
              target="_blank"
              rel="noreferrer"
            >
              MusicBrainz
            </a>
            のAPI経由で機械的に抽出して表にしたリストです
          </li>
          <li>
            大体日次で追加差分を取得しています（負荷の都合上、取得済データは更新していません）
          </li>
          <li>
            Spotifyに楽曲がある場合は楽曲リンクを、ない場合はYouTubeへの検索リンクが付与されています
          </li>
          <li>
            リストは完全ではなく（かなり抜けが多い）、加えて加工プロセスにおける誤情報が含まれる場合があります
          </li>
          <li>このラインナップでこの作曲家いないの？というツッコミがあればリプください</li>
        </ul>
        <DialogClose
          className="absolute right-4 top-2 text-lg font-bold cursor-pointer"
          aria-label="閉じる"
        >
          ✕
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
