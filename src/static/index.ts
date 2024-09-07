export type NowPlayingStatic = {
  station: {
    id: number;
    name: string;
    shortcode: string;
    description: string;
    frontend: string;
    backend: string;
    timezone: string;
    listen_url: string;
    url: string;
    public_player_url: string;
    playlist_pls_url: string;
    playlist_m3u_url: string;
    is_public: boolean;
    mounts: Array<{
      id: number;
      name: string;
      url: string;
      bitrate: number;
      format: string;
      listeners: {
        total: number;
        unique: number;
        current: number;
      };
      path: string;
      is_default: boolean;
    }>;
    remotes: any[];
    hls_enabled: boolean;
    hls_is_default: boolean;
    hls_url: string | null;
    hls_listeners: number;
  };
  listeners: {
    total: number;
    unique: number;
    current: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
    broadcast_start: string | null;
    art: string | null;
  };
  now_playing: {
    sh_id: number;
    played_at: number;
    duration: number;
    playlist: string;
    streamer: string;
    is_request: boolean;
    song: {
      id: string;
      art: string;
      custom_fields: {
        sc_url: string | null;
        uploader: string | null;
        uploader_url: string | null;
      };
      text: string;
      artist: string;
      title: string;
      album: string;
      genre: string;
      isrc: string;
      lyrics: string;
    };
    elapsed: number;
    remaining: number;
  };
  playing_next: {
    cued_at: number;
    played_at: number;
    duration: number;
    playlist: string;
    is_request: boolean;
    song: {
      id: string;
      art: string;
      custom_fields: {
        sc_url: string | null;
        uploader: string | null;
        uploader_url: string | null;
      };
      text: string;
      artist: string;
      title: string;
      album: string;
      genre: string;
      isrc: string;
      lyrics: string;
    };
  };
  song_history: Array<{
    sh_id: number;
    played_at: number;
    duration: number;
    playlist: string;
    streamer: string;
    is_request: boolean;
    song: {
      id: string;
      art: string;
      custom_fields: {
        sc_url: string | null;
        uploader: string | null;
        uploader_url: string | null;
      };
      text: string;
      artist: string;
      title: string;
      album: string;
      genre: string;
      isrc: string;
      lyrics: string;
    };
  }>;
  is_online: boolean;
  cache: string;
};

/**
 * @param host The host of the websocket server. Skip the protocol and the path. (for example, instead of "https://example.com/socket", use "example.com")
 */
export async function getNowPlaying(host: string, radioId: string) {
  const url = `https://${host}/api/nowplaying_static/${radioId}.json`;

  const req = await fetch(url);

  if (!req.ok) {
    throw new Error(`Failed to fetch now playing data: ${req.statusText}`);
  }

  const data = await req.json();

  return data as NowPlayingStatic;
}
