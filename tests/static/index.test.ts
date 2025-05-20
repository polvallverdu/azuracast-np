import { test, expect, describe, vi } from "vitest";
import {
  getNowPlaying,
  NowPlayingNetworkError,
  NowPlayingValidationError,
} from "../../src/static/index";

const DEMO_HOST = "demo.azuracast.com";
const DEMO_STATION = "azuratest_radio";

const fetchMock = vi.spyOn(globalThis, "fetch");

describe("getNowPlaying", () => {
  test("throws NowPlayingNetworkError on network error", async () => {
    fetchMock.mockRejectedValue(new Error("fail"));
    await expect(getNowPlaying(DEMO_HOST, DEMO_STATION)).rejects.toThrow(
      NowPlayingNetworkError
    );
  });

  test("throws NowPlayingNetworkError on HTTP error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);
    await expect(getNowPlaying(DEMO_HOST, DEMO_STATION)).rejects.toThrow(
      NowPlayingNetworkError
    );
  });

  test("throws NowPlayingValidationError on invalid JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => {
        throw new Error("bad json");
      },
    } as unknown as Response);
    await expect(getNowPlaying(DEMO_HOST, DEMO_STATION)).rejects.toThrow(
      NowPlayingValidationError
    );
  });

  test("throws NowPlayingValidationError on invalid structure", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: "bar" }),
    } as Response);
    await expect(getNowPlaying(DEMO_HOST, DEMO_STATION)).rejects.toThrow(
      NowPlayingValidationError
    );
  });
});
