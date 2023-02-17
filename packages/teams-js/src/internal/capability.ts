import { FrameContexts } from '../public';

export abstract class CapabilityMetadata {
  public readonly functionNameToFrameContextMap: Map<unknown, FrameContexts[]>;

  public constructor(map: Map<unknown, FrameContexts[]>) {
    this.functionNameToFrameContextMap = map;
  }

  public isFrameContextValidForFunction(frameContext: FrameContexts, fn: unknown): boolean {
    if (!(fn instanceof Function)) {
      return false;
    }

    const frameContexts = this.functionNameToFrameContextMap.get(fn);
    if (!frameContexts) {
      throw new Error(`This capability does not have a function in its metadata that matches ${fn}`);
    }

    // Empty array of framecontexts is how we represent *all* frame contexts
    return frameContexts.length === 0 || frameContexts.includes(frameContext);
  }
}
