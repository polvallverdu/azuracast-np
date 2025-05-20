# AzuraCast Now Playing (azuracast-np)

A simple package to get the now playing song on an AzuraCast station, with runtime validation and safe APIs.

## Features

- Fetch static now playing data with runtime validation (using zod)
- Subscribe to websocket now playing updates with runtime validation
- Custom error classes for robust error handling
- Fully documented API
- TypeScript support

## Installation

```
bun add @undergr.network/azuracast-np
```

## Usage

### Static Now Playing API

```ts
import {
  getNowPlayingSafe,
  NowPlayingNetworkError,
  NowPlayingValidationError,
} from "@undergr.network/azuracast-np/static";

try {
  const np = await getNowPlayingSafe("demo.azuracast.com", "azuratest_radio");
  console.log(np.now_playing.song.title);
} catch (err) {
  if (err instanceof NowPlayingNetworkError) {
    // Handle network error
  } else if (err instanceof NowPlayingValidationError) {
    // Handle validation error
    console.error(err.issues);
  } else {
    throw err;
  }
}
```

### Websocket Now Playing API

```ts
import {
  NowPlayingWebsocket,
  NowPlayingWebsocketConnectionError,
  NowPlayingWebsocketValidationError,
} from "@undergr.network/azuracast-np/websocket";

const ws = new NowPlayingWebsocket("demo.azuracast.com", "azuratest_radio");
ws.on("nowPlayingUpdate", (data) => {
  console.log(data.title, data.artist);
});
ws.on("error", (err) => {
  if (err instanceof NowPlayingWebsocketConnectionError) {
    // Handle connection error
  } else if (err instanceof NowPlayingWebsocketValidationError) {
    // Handle validation error
    console.error(err.issues);
  }
});
// To close:
// ws.close();
```

## Testing

This project uses [Bun](https://bun.sh/) for testing. To run tests:

```
bun test
```

## License

MIT
