import { z } from "zod";
import { NowPlayingPayloadSchema, type NowPlayingPayload } from "../schema";

/**
 * Custom error for network issues when fetching Now Playing data.
 */
export class NowPlayingNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NowPlayingNetworkError";
  }
}

/**
 * Custom error for invalid data returned from the Now Playing endpoint.
 */
export class NowPlayingValidationError extends Error {
  issues: z.ZodIssue[];
  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = "NowPlayingValidationError";
    this.issues = issues;
  }
}

/**
 * Fetches the static Now Playing data for a given AzuraCast station and validates it.
 * @param host The host of the AzuraCast server (without protocol or path).
 * @param radioId The station shortcode or numeric ID.
 * @returns The validated NowPlayingStatic object.
 * @throws {NowPlayingNetworkError} If the network request fails.
 * @throws {NowPlayingValidationError} If the data is invalid.
 * @example
 *   const np = await getNowPlaying('demo.azuracast.com', 'azuratest_radio');
 */
export async function getNowPlaying(
  host: string,
  radioId: string
): Promise<NowPlayingPayload> {
  const url = `https://${host}/api/nowplaying_static/${radioId}.json`;
  let req: Response;
  try {
    req = await fetch(url);
  } catch (err: any) {
    throw new NowPlayingNetworkError(`Network error: ${err?.message || err}`);
  }
  if (!req.ok) {
    throw new NowPlayingNetworkError(
      `Failed to fetch now playing data: ${req.status} ${req.statusText}`
    );
  }
  let data: unknown;
  try {
    data = await req.json();
  } catch (err: any) {
    throw new NowPlayingValidationError("Response was not valid JSON", []);
  }
  const parsed = NowPlayingPayloadSchema.safeParse(data);
  if (!parsed.success) {
    throw new NowPlayingValidationError(
      "Invalid now playing data structure",
      parsed.error.issues
    );
  }
  return parsed.data;
}
