import { debug as registerLogger, Debugger } from 'debug';

const topLevelLogger = registerLogger('teamsJs');

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Returns a logger for a given namespace, within the pre-defined top-level teamsJs namespace
 */
export function getLogger(namespace: string): Debugger {
  return topLevelLogger.extend(namespace);
}
