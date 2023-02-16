import { FrameContexts } from '../public';

export abstract class CapabilityMetadata {
  public readonly functionNameToFrameContextMap: Map<unknown, FrameContexts[]>;

  // TODO throw if someone tries to add something to the map more than once
  // eslint-disable-next-line @typescript-eslint/ban-types
  public constructor(map: Map<unknown, FrameContexts[]>) {
    this.functionNameToFrameContextMap = map;
  }

  public isFrameContextValidForFunction(frameContext: FrameContexts, fn: unknown): boolean {
    const frameContexts = this.functionNameToFrameContextMap.get(fn);
    if (!frameContexts) {
      return false;
    }
    // Empty array of framecontexts is how we represent *all* frame contexts
    return frameContexts.length === 0 || frameContexts.includes(frameContext);
  }
}
