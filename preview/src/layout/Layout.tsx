import type React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { withBasePath } from '@/lib/base-path';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemeToggle } from './components/ThemeToggle';

export const Layout: React.FC = () => (
  <ThemeProvider defaultTheme="light" storageKey="compolic-preview-theme">
    <div className="p-0 md:px-6 min-h-full flex flex-col bg-[radial-gradient(ellipse_at_top,rgba(100,100,255,0.12),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(100,100,255,0.08),transparent_60%)]">
      <header className="w-full max-w-[1200px] mx-auto px-3 md:px-0 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="flex items-center gap-1 md:gap-2">
            <img
              src={withBasePath('image.png')}
              alt=""
              className="relative top-[-2px] w-7 h-7 md:w-11 md:h-11"
            />
            <img src={withBasePath('logo.svg')} alt="Compolic" className="w-auto h-4 md:h-6" />
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="https://open.spotify.com/playlist/1XVlOnS3KOSJt16BfQuYz0?si=b91f2a56a7d54516"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm">
              playlist
            </Button>
          </a>
          <Link to="/?modal=about">
            <Button variant="outline" size="sm">
              about
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 md:pb-6">
        <Outlet />
      </main>
    </div>
  </ThemeProvider>
);
