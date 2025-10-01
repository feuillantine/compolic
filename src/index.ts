import { Command } from 'commander';
import { generateIndexCommand } from './commands/generate-index';
import { getMultipleTracksCommand } from './commands/get-multiple-tracks';
import { getSpotifyRefreshTokenCommand } from './commands/get-spotify-refresh-token';
import { getTracksCommand } from './commands/get-tracks';
import { syncTracksToPlaylistCommand } from './commands/sync-tracks-to-playlist';
import { updateTracksCommand } from './commands/update-tracks';

const program = new Command();

program
  .name('Compolic CLI')
  .version('1.0.0')
  .addCommand(getTracksCommand)
  .addCommand(getSpotifyRefreshTokenCommand)
  .addCommand(updateTracksCommand)
  .addCommand(getMultipleTracksCommand)
  .addCommand(generateIndexCommand)
  .addCommand(syncTracksToPlaylistCommand);

program.parse();
