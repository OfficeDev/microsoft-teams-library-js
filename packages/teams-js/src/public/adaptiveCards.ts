import { runtime } from './runtime';

/**
 * @returns {string | undefined} adaptiveCardSchemaVersion - The adaptive
 * card schema version supported by the host, undefined if
 * the host does not support adaptive cards.
 */

export function getAdaptiveCardSchemaVersion(): string | undefined {
  if (!runtime.hostVersionsInfo) {
    return undefined;
  } else {
    return runtime.hostVersionsInfo.adaptiveCardSchemaVersion;
  }
}
