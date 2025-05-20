import { test, expect, describe, beforeAll, afterAll, vi } from "vitest";
import {
  NowPlayingWebsocket,
  NowPlayingWebsocketConnectionError,
  NowPlayingWebsocketValidationError,
} from "../../src/websocket/index";
import type { MockWebSocket } from "../__mocks__/MockWebSocket";

vi.mock("isomorphic-ws", async () => {
  const { MockWebSocket } = await import("../__mocks__/MockWebSocket");
  return {
    default: MockWebSocket,
  };
});

describe("NowPlayingWebsocket", () => {
  // TODO: For some reason is not going through the mocked websocket
  test.skip("emits nowPlayingUpdate on valid data", async () => {
    const ws = new NowPlayingWebsocket("host", "station");
    const mock = ws["websocket"] as unknown as MockWebSocket;
    let called = false;
    ws.on("nowPlayingUpdate", (data) => {
      called = true;
      expect(typeof data.now_playing.song.title).toBe("string");
      expect(typeof data.now_playing.song.artist).toBe("string");
    });
    const valid = {
      data: {
        np: {
          listeners: { total: 1 },
          station: { shortcode: "station", name: "Station" },
          now_playing: {
            song: {
              title: "Song",
              artist: "Artist",
              art: "",
              custom_fields: {},
            },
          },
        },
      },
    };
    mock.triggerMessage(JSON.stringify({ pub: valid }));
    expect(called).toBe(true);
  });

  test("emits error on invalid JSON", async () => {
    const ws = new NowPlayingWebsocket("host", "station");
    const mock = ws["websocket"] as unknown as MockWebSocket;
    let called = false;
    ws.on("error", (err) => {
      called = true;
      expect(err).toBeInstanceOf(NowPlayingWebsocketValidationError);
    });
    mock.triggerMessage("not json");
    expect(called).toBe(true);
  });

  test("emits error on invalid structure", async () => {
    const ws = new NowPlayingWebsocket("host", "station");
    const mock = ws["websocket"] as unknown as MockWebSocket;
    let called = false;
    ws.on("error", (err) => {
      called = true;
      expect(err).toBeInstanceOf(NowPlayingWebsocketValidationError);
    });
    const invalid = { data: { np: { foo: "bar" } } };
    mock.triggerMessage(JSON.stringify({ pub: invalid }));
    expect(called).toBe(true);
  });

  test("emits error on connection error", async () => {
    const ws = new NowPlayingWebsocket("host", "station");
    const mock = ws["websocket"] as unknown as MockWebSocket;
    let called = false;
    ws.on("error", (err) => {
      called = true;
      expect(err).toBeInstanceOf(NowPlayingWebsocketConnectionError);
    });
    mock.triggerError(new Error("fail"));
    expect(called).toBe(true);
  });

  test("close() stops reconnecting", async () => {
    const ws = new NowPlayingWebsocket("host", "station");
    const mock = ws["websocket"] as unknown as MockWebSocket;
    ws.close();
    expect(mock.close).toHaveBeenCalled();
    // Simulate close event, should not reconnect
    mock.triggerClose && mock.triggerClose();
    expect(ws["closed"]).toBe(true);
  });
});
