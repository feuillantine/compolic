import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env') });

export interface Config {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
  SPOTIFY_PLAYLIST_ID?: string;
}

export function loadConfig(): Config {
  return {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
    SPOTIFY_PLAYLIST_ID: process.env.SPOTIFY_PLAYLIST_ID,
  };
}

export function validateConfig(config: Config): void {
  const required: (keyof Config)[] = [];

  for (const key of required) {
    if (!config[key]) {
      console.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
}
