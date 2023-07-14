import { AdaptiveCardVersion } from './interfaces';
import { runtime } from './runtime';

/**
 * @returns The {@linkcode AdaptiveCardVersion} representing the Adaptive Card schema
 * version supported by the host, or undefined if the host does not support Adaptive Cards
 */
export function getAdaptiveCardSchemaVersion(): AdaptiveCardVersion | undefined {
  if (!runtime.hostVersionsInfo) {
    return undefined;
  } else {
    return runtime.hostVersionsInfo.adaptiveCardSchemaVersion;
  }
}
