import { EventEmitter } from "events";
import type { z } from "zod";
import WebSocket from "isomorphic-ws";
import { NowPlayingPayloadSchema, type NowPlayingPayload } from "../schema";

/**
 * Custom error for websocket connection issues.
 */
export class NowPlayingWebsocketConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NowPlayingWebsocketConnectionError";
  }
}

/**
 * Custom error for invalid data received from the websocket.
 */
export class NowPlayingWebsocketValidationError extends Error {
  issues: z.ZodIssue[];
  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = "NowPlayingWebsocketValidationError";
    this.issues = issues;
  }
}

type EventMap = {
  nowPlayingUpdate: [NowPlayingPayload];
  error: [
    NowPlayingWebsocketConnectionError | NowPlayingWebsocketValidationError
  ];
};

/**
 * A class for subscribing to AzuraCast Now Playing websocket updates.
 *
 * @example
 *   const ws = new NowPlayingWebsocket('demo.azuracast.com', 'azuratest_radio');
 *   ws.on('nowPlayingUpdate', (data) => { ... });
 *   ws.on('error', (err) => { ... });
 *   // ...
 *   ws.close();
 */
export class NowPlayingWebsocket extends EventEmitter<EventMap> {
  private url: string;
  private websocket: WebSocket | null = null;
  private radioToListen?: string;
  private closed = false;

  /**
   * @param host The host of the websocket server. Skip the protocol and the path. (for example, instead of "https://example.com/socket", use "example.com")
   * @param radioToListen The station shortcode to subscribe to.
   */
  constructor(host: string, radioToListen?: string) {
    super();
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
      try {
        const jsonData = JSON.parse(event.data as string);
        if ("connect" in jsonData) {
          const connectData = jsonData.connect;
          if ("data" in connectData) {
            for (const initialRow of connectData.data) {
              this.handleSseData(initialRow);
            }
          } else {
            for (const subName in connectData.subs) {
              const sub = connectData.subs[subName];
              if ("publications" in sub && sub.publications.length > 0) {
                for (const initialRow of sub.publications) {
                  this.handleSseData(initialRow);
                }
              }
            }
          }
        } else if ("pub" in jsonData) {
          this.handleSseData(jsonData.pub);
        }
      } catch (err) {
        this.emit(
          "error",
          new NowPlayingWebsocketValidationError(
            "Invalid JSON or structure in websocket message",
            []
          )
        );
      }
    };

    this.websocket.onclose = () => {
      if (!this.closed) {
        setTimeout(() => this.start(), 500);
      }
    };

    this.websocket.onerror = (error) => {
      this.emit(
        "error",
        new NowPlayingWebsocketConnectionError(
          `Websocket error: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    };
  }

  private handleSseData(ssePayload: { data: { np: NowPlayingPayload } }) {
    const jsonData = ssePayload.data;
    const np = jsonData.np;
    const parsed = NowPlayingPayloadSchema.safeParse(np);
    if (!parsed.success) {
      this.emit(
        "error",
        new NowPlayingWebsocketValidationError(
          "Invalid now playing data structure",
          parsed.error.issues
        )
      );
      return;
    }

    this.emit("nowPlayingUpdate", parsed.data);
  }

  /**
   * Change the station being listened to.
   * @param radioId The new station shortcode.
   */
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

  /**
   * Cleanly close the websocket connection and stop reconnecting.
   */
  public close() {
    this.closed = true;
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}
