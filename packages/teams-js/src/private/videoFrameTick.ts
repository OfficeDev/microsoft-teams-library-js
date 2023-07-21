import { generateGUID } from '../internal/utils';

export class VideoFrameTick {
  private static readonly setTimeoutCallbacks: {
    [key: string]: {
      callback: () => void;
      startedAtInMs: number;
      timeoutInMs: number;
    };
  } = {};

  public static setTimeout(callback: () => void, timeoutInMs: number): string {
    const startedAtInMs = performance.now();
    const id = generateGUID();
    VideoFrameTick.setTimeoutCallbacks[id] = {
      callback,
      timeoutInMs,
      startedAtInMs,
    };
    return id;
  }

  public static clearTimeout(id: string): void {
    delete VideoFrameTick.setTimeoutCallbacks[id];
  }

  public static setInterval(callback: () => void, intervalInMs: number): void {
    VideoFrameTick.setTimeout(() => {
      callback();
      VideoFrameTick.setTimeout(callback, intervalInMs);
    }, intervalInMs);
  }

  public static tick(): void {
    const now = performance.now();
    for (const key in VideoFrameTick.setTimeoutCallbacks) {
      const callback = VideoFrameTick.setTimeoutCallbacks[key];
      const start = callback.startedAtInMs;
      if (now - start >= callback.timeoutInMs) {
        callback.callback();
        delete VideoFrameTick.setTimeoutCallbacks[key];
      }
    }
  }
}
