export interface ComposerTrack {
  id: string;
  title: string;
  artist: string;
  isrc: string;
  releaseDate: string;
  spotifyUrl: string;
  isFallback: boolean;
}

export interface ComposerData {
  name: string;
  sortName?: string;
  otherNames?: string[];
  tracks: ComposerTrack[];
}
