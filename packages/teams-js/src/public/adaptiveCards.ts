import { AdaptiveCardVersion } from './interfaces';
import { runtime } from './runtime';

/**
 * @returns The {@linkcode: AdaptiveCardVersion} representing the adaptive card schema
 * version supported by the host, or undefined if the host does not support adaptive cards
 */
export function getAdaptiveCardSchemaVersion(): AdaptiveCardVersion | undefined {
  return runtime.adaptiveCardVersion;
}
