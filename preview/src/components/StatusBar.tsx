import type React from 'react';

export const StatusBar: React.FC<{ loading?: boolean; error?: string | null }> = ({
  loading,
  error,
}) => {
  if (!loading && !error) return null;
  return (
    <div className="text-xs">
      {loading && <span className="opacity-70">読み込み中</span>}
      {error && <span className="text-destructive ml-2">{error}</span>}
    </div>
  );
};
