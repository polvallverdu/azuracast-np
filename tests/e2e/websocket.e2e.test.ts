import { test, expect, describe } from "vitest";
import { NowPlayingWebsocket } from "../../src/websocket/index";
import { NowPlayingPayloadSchema } from "../../src/schema";

const DEMO_HOST = "demo.azuracast.com";
const DEMO_STATION = "azuratest_radio";

describe("e2e: NowPlayingWebsocket", () => {
  test("receives and validates now playing update from demo websocket", async () => {
    await new Promise((resolve, reject) => {
      const ws = new NowPlayingWebsocket(DEMO_HOST, DEMO_STATION);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Timed out waiting for nowPlayingUpdate"));
      }, 5000);
      ws.on("nowPlayingUpdate", (data) => {
        clearTimeout(timeout);
        try {
          // Validate the structure
          expect(NowPlayingPayloadSchema.safeParse(data).success).toBe(true);
          expect(typeof data.now_playing.song.title).toBe("string");
          ws.close();
          resolve(null);
        } catch (err) {
          ws.close();
          reject(err);
        }
      });
      ws.on("error", (err) => {
        clearTimeout(timeout);
        ws.close();
        reject(err);
      });
    });
  });
});
