import { z } from "zod";

/**
 * Zod schema for validating incoming Now Playing websocket data.
 */
export const NowPlayingPayloadSchema = z.object({
  station: z.object({
    id: z.number(),
    name: z.string(),
    shortcode: z.string(),
    description: z.string(),
    frontend: z.string(),
    backend: z.string(),
    timezone: z.string(),
    listen_url: z.string(),
    url: z.string().nullable(),
    public_player_url: z.string(),
    playlist_pls_url: z.string(),
    playlist_m3u_url: z.string(),
    is_public: z.boolean(),
    mounts: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        url: z.string(),
        bitrate: z.number(),
        format: z.string(),
        listeners: z.object({
          total: z.number(),
          unique: z.number(),
          current: z.number(),
        }),
        path: z.string(),
        is_default: z.boolean(),
      })
    ),
    remotes: z.array(z.any()), // If you know the structure, replace z.any()
    hls_enabled: z.boolean(),
    hls_is_default: z.boolean(),
    hls_url: z.string(),
    hls_listeners: z.number(),
  }),
  listeners: z.object({
    total: z.number(),
    unique: z.number(),
    current: z.number(),
  }),
  live: z.object({
    is_live: z.boolean(),
    streamer_name: z.string(),
    broadcast_start: z.number().nullable(),
    art: z.string().nullable(),
  }),
  now_playing: z.object({
    sh_id: z.number(),
    played_at: z.number(),
    duration: z.number(),
    playlist: z.string(),
    streamer: z.string(),
    is_request: z.boolean(),
    song: z.object({
      id: z.string(),
      art: z.string(),
      custom_fields: z.array(z.any()), // If you know the structure, replace z.any()
      text: z.string(),
      artist: z.string(),
      title: z.string(),
      album: z.string(),
      genre: z.string(),
      isrc: z.string(),
      lyrics: z.string(),
    }),
    elapsed: z.number(),
    remaining: z.number(),
  }),
  playing_next: z.object({
    cued_at: z.number(),
    played_at: z.number(),
    duration: z.number(),
    playlist: z.string(),
    is_request: z.boolean(),
    song: z.object({
      id: z.string(),
      art: z.string(),
      custom_fields: z.array(z.any()), // If you know the structure, replace z.any()
      text: z.string(),
      artist: z.string(),
      title: z.string(),
      album: z.string(),
      genre: z.string(),
      isrc: z.string(),
      lyrics: z.string(),
    }),
  }),
  song_history: z.array(
    z.object({
      sh_id: z.number(),
      played_at: z.number(),
      duration: z.number(),
      playlist: z.string(),
      streamer: z.string(),
      is_request: z.boolean(),
      song: z.object({
        id: z.string(),
        art: z.string(),
        custom_fields: z.array(z.any()), // If you know the structure, replace z.any()
        text: z.string(),
        artist: z.string(),
        title: z.string(),
        album: z.string(),
        genre: z.string(),
        isrc: z.string(),
        lyrics: z.string(),
      }),
    })
  ),
  is_online: z.boolean(),
  cache: z.string(),
});

export type NowPlayingPayload = z.infer<typeof NowPlayingPayloadSchema>;
