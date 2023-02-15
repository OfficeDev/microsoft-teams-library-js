import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { runtime } from '../public/runtime';

export abstract class Capability {
  public readonly functionNameToFrameContextMap: Map<unknown, FrameContexts[]>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  public constructor(map: Map<unknown, FrameContexts[]>) {
    this.functionNameToFrameContextMap = map;
  }

  public getFrameContextsForFunction(fn: unknown): FrameContexts[] {
    if (this.functionNameToFrameContextMap.has(fn)) {
      return this.functionNameToFrameContextMap.get(fn);
    }

    return [];
  }

  public ensureInitialized(frameContexts: FrameContexts[]): void {
    ensureInitialized(runtime, ...frameContexts);
  }

  public abstract isSupported(): boolean;
}
