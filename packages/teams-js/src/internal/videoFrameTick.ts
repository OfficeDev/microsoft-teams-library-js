import { generateGUID } from './utils';

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
    VideoFrameTick.setTimeout(function next() {
      callback();
      VideoFrameTick.setTimeout(next, intervalInMs);
    }, intervalInMs);
  }

  /**
   * Call this function whenever a frame comes in, it will check if any timeout is due and call the callback
   */
  public static tick(): void {
    const now = performance.now();
    const timeoutIds = [];
    // find all the timeouts that are due,
    // not to invoke them in the loop to avoid modifying the collection while iterating
    for (const key in VideoFrameTick.setTimeoutCallbacks) {
      const callback = VideoFrameTick.setTimeoutCallbacks[key];
      const start = callback.startedAtInMs;
      if (now - start >= callback.timeoutInMs) {
        timeoutIds.push(key);
      }
    }
    // invoke the callbacks
    for (const id of timeoutIds) {
      const callback = VideoFrameTick.setTimeoutCallbacks[id];
      callback.callback();
      delete VideoFrameTick.setTimeoutCallbacks[id];
    }
  }
}
