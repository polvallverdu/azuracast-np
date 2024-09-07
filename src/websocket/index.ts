import { EventEmitter } from "events";

type NowPlayingWebsocketEvent = "nowPlayingUpdate";

export type NowPlayingUpdateData = {
  listeners: number;
  stationId: string;
  station: string;

  title: string;
  artist: string;
  art: string;
  playlist?: string;
  custom_fields?: Record<string, string>;

  duration?: number;
  elapsed?: number;
  remaining?: number;
};

export class NowPlayingWebsocket {
  private eventEmitter: EventEmitter;
  private url: string;
  private websocket: WebSocket | null = null;
  private radioToListen?: string;

  /**
   * @param host The host of the websocket server. Skip the protocol and the path. (for example, instead of "https://example.com/socket", use "example.com")
   */
  constructor(host: string, radioToListen?: string) {
    this.eventEmitter = new EventEmitter();
    this.url = `wss://${host}/api/live/nowplaying/websocket`;
    this.radioToListen = radioToListen;

    this.start();
  }

  private start() {
    this.websocket = new WebSocket(this.url);

    this.websocket.onopen = () => {
      if (this.radioToListen !== undefined && this.websocket) {
        this.websocket.send(
          JSON.stringify({
            subs: {
              [`station:${this.radioToListen}`]: { recover: true },
            },
          })
        );
      }
    };

    this.websocket.onmessage = (event) => {
      const jsonData = JSON.parse(event.data);

      if ("connect" in jsonData) {
        const connectData = jsonData.connect;

        if ("data" in connectData) {
          // Legacy SSE data
          connectData.data.forEach((initialRow: any) =>
            this.handleSseData(initialRow)
          );
        } else {
          // New Centrifugo time format
          // if ('time' in connectData) {
          //   currentTime = Math.floor(connectData.time / 1000);
          // }

          // New Centrifugo cached NowPlaying initial push.
          for (const subName in connectData.subs) {
            const sub = connectData.subs[subName];
            if ("publications" in sub && sub.publications.length > 0) {
              sub.publications.forEach((initialRow: any) =>
                this.handleSseData(initialRow, false)
              );
            }
          }
        }
      } else if ("pub" in jsonData) {
        this.handleSseData(jsonData.pub);
      }
    };

    this.websocket.onclose = () => {
      setTimeout(() => this.start(), 500);
    };

    this.websocket.onerror = (error) => {
      console.error("Websocket error:", error);
    };
  }

  private handleSseData(ssePayload: any, useTime = true) {
    const jsonData = ssePayload.data;

    // if (useTime && 'current_time' in jsonData) {
    //   currentTime = jsonData.current_time;
    // }

    const np = jsonData.np;

    const updateData = {
      listeners: np.listeners.total as number,
      stationId: np.station.shortcode as string,
      station: np.station.name as string,
      title: np.now_playing.song.title as string,
      artist: np.now_playing.song.artist as string,
      art: np.now_playing.song.art as string,
      playlist: np.now_playing.playlist as string,
      custom_fields: np.now_playing.song.custom_fields as Record<
        string,
        string
      >,
      duration: np.now_playing.duration as number,
      elapsed: np.now_playing.elapsed as number,
      remaining: np.now_playing.remaining as number,
    } satisfies NowPlayingUpdateData;

    this.emit("nowPlayingUpdate", updateData);
  }

  public listenToRadio(radioId: string) {
    this.radioToListen = radioId;

    if (this.radioToListen !== undefined && this.websocket) {
      this.websocket.send(
        JSON.stringify({
          subs: {
            [`station:${this.radioToListen}`]: { recover: true },
          },
        })
      );
    }
  }

  public on(
    event: NowPlayingWebsocketEvent,
    // A bit of a hack to make TypeScript happy
    listener: (...args: any[]) => NowPlayingUpdateData
  ): void {
    this.eventEmitter.on(event, listener);
  }

  private emit(event: NowPlayingWebsocketEvent, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args);
  }
}
