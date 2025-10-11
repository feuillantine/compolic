import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      className="inline-flex h-8 w-8 items-center justify-center px-0"
      onClick={toggleTheme}
      title={isDark ? 'ライトテーマに切替' : 'ダークテーマに切替'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">テーマを切り替え</span>
    </Button>
  );
};
