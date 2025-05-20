import { vi } from "vitest";

export class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: any }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  sent: any[] = [];
  close = vi.fn(() => {
    if (this.onclose) this.onclose();
  });
  send = vi.fn((msg: any) => this.sent.push(msg));
  triggerOpen() {
    this.onopen && this.onopen();
  }
  triggerMessage(data: any) {
    this.onmessage && this.onmessage({ data });
  }
  triggerError(err: any) {
    this.onerror && this.onerror(err);
  }
  triggerClose() {
    this.onclose && this.onclose();
  }
}
