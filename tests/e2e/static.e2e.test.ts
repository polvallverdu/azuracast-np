import { test, expect, describe } from "vitest";
import { getNowPlaying } from "../../src/static/index";
import { NowPlayingPayloadSchema } from "../../src/schema";

const DEMO_HOST = "demo.azuracast.com";
const DEMO_STATION = "azuratest_radio";

describe("e2e: getNowPlaying", () => {
  test("fetches and validates now playing data from demo endpoint", async () => {
    const data = await getNowPlaying(DEMO_HOST, DEMO_STATION);
    expect(NowPlayingPayloadSchema.safeParse(data).success).toBe(true);
    expect(typeof data.now_playing.song.title).toBe("string");
  });
});
