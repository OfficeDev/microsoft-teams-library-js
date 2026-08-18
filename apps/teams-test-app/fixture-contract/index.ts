/**
 * The shared parse contract for the capability test fixtures.
 *
 * These fixtures are consumed by both this repo's producer contract specs and the Hub SDK's
 * provider contract tests. Both sides need to agree on what a case's fields mean — which case a
 * title refers to, and what wire payload an `expectedAlertValue` describes — so that contract
 * lives here, next to the fixtures themselves, rather than being reimplemented per repo.
 *
 * Deliberately knows nothing about where the fixtures live: this repo reads them from a relative
 * path, while the Hub SDK reads a teams-js checkout resolved at runtime. Each side passes already
 * parsed fixture content in and keeps its own locating logic.
 */

export interface FixtureCaseRecord {
  title?: string;
  version?: string;
  type?: string;
  inputValue?: unknown;
  expectedAlertValue?: unknown;
  expectedTestAppValue?: unknown;
  /**
   * Set when a case's contract is also proven by fast unit/integration tests, so those tests can
   * be driven by the fixtures instead of a hand-maintained list. Absent on fixture versions cut
   * before the flag existed (frozen release branches), which keep their full browser E2E coverage.
   */
  unitCovered?: boolean;
  /** Which browser E2E runs execute the case: "pr" (default when omitted) or "shadow". */
  e2eScope?: 'pr' | 'shadow';
}

export interface FixtureFileRecord {
  testCases?: FixtureCaseRecord[];
  featureTests?: Array<{ testCases?: FixtureCaseRecord[] }>;
}

export interface SelectFixtureCaseOptions {
  /**
   * Disambiguates when several cases share a title, differing only by `version` (chat and appEntity
   * both do). Must match the case's `version` string exactly.
   */
  version?: string;
}

/** Placeholder an `expectedAlertValue` uses to mean "the wire payload is the serialized input". */
const JSON_INPUT_VALUE_PLACEHOLDER = '##JSON_INPUT_VALUE##';

/** Separator after which an `expectedAlertValue` describes the payload the host received. */
const CALLED_WITH_MARKER = 'called with ';

/** Flattens a fixture file's top-level cases together with any nested feature-test cases. */
export function getFixtureCases(fixture: FixtureFileRecord): FixtureCaseRecord[] {
  return [
    ...(fixture.testCases ?? []),
    ...(fixture.featureTests ?? []).flatMap((featureTest) => featureTest.testCases ?? []),
  ];
}

/**
 * Extracts the wire payload a case's `expectedAlertValue` describes.
 *
 * Returns `undefined` when the alert does not describe a payload — either prose that names
 * individual values, or an alert whose wording changed and no longer parses. Callers proving a
 * teams-js input to wire transformation should assert the result is defined, so a reworded fixture
 * surfaces instead of silently falling back to the untransformed input.
 */
export function parseWirePayloadFromAlert(expectedAlertValue: unknown, inputValue: unknown): unknown | undefined {
  if (typeof expectedAlertValue !== 'string') {
    return undefined;
  }

  const markerIndex = expectedAlertValue.indexOf(CALLED_WITH_MARKER);
  if (markerIndex === -1) {
    return undefined;
  }

  const payload = expectedAlertValue.slice(markerIndex + CALLED_WITH_MARKER.length).trim();

  if (payload === JSON_INPUT_VALUE_PLACEHOLDER) {
    return inputValue;
  }

  if (!payload.startsWith('{') && !payload.startsWith('[')) {
    return undefined;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return undefined;
  }
}

/**
 * Finds the single case matching a title, refusing to guess when a title is ambiguous. Several
 * families reuse a title across cases that differ only by `version` and carry different input
 * shapes, so returning the first match would silently hand back the wrong fixture data.
 *
 * `fixturePath` is only used to make the error messages actionable.
 */
export function selectFixtureCase(
  fixture: FixtureFileRecord,
  title: string,
  fixturePath: string,
  options: SelectFixtureCaseOptions = {}
): FixtureCaseRecord {
  let matches = getFixtureCases(fixture).filter((testCase) => testCase.title === title);
  if (options.version !== undefined) {
    matches = matches.filter((testCase) => testCase.version === options.version);
  }

  if (matches.length === 0) {
    const versionHint = options.version !== undefined ? ` (version "${options.version}")` : '';
    throw new Error(`Fixture case "${title}"${versionHint} not found in ${fixturePath}`);
  }

  if (matches.length > 1) {
    const versions = matches.map((testCase) => testCase.version ?? '(no version)').join(', ');
    throw new Error(
      `Fixture case "${title}" is ambiguous in ${fixturePath}: ${matches.length} cases match ` +
        `(versions: ${versions}). Pass options.version to disambiguate.`
    );
  }

  return matches[0];
}

/** Returns the cases a fixture flags as `unitCovered`. */
export function selectCoveredCases(fixture: FixtureFileRecord): FixtureCaseRecord[] {
  return getFixtureCases(fixture).filter((testCase) => testCase.unitCovered === true);
}
