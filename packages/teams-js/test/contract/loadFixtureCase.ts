import * as fs from 'fs';
import * as path from 'path';

export interface FixtureCase<TInputValue = unknown, TExpectedWirePayload = unknown> {
  title: string;
  inputValue: TInputValue;
  expectedAlertValue: string;
  expectedWirePayload?: TExpectedWirePayload;
}

interface FixtureCaseRecord {
  title?: string;
  version?: string;
  inputValue?: unknown;
  expectedAlertValue?: string;
}

export interface LoadFixtureCaseOptions {
  /**
   * Disambiguates when multiple fixture cases share the same title (several families,
   * e.g. chat, have duplicate titles differing only by `version`). Must match the case's
   * `version` string exactly.
   */
  version?: string;
}

interface FixtureFeatureRecord {
  testCases?: FixtureCaseRecord[];
}

interface FixtureRecord {
  testCases?: FixtureCaseRecord[];
  featureTests?: FixtureFeatureRecord[];
}

function parseExpectedWirePayload(expectedAlertValue: string): unknown | undefined {
  const calledWithMarker = ' called with ';
  const calledWithIndex = expectedAlertValue.indexOf(calledWithMarker);
  if (calledWithIndex === -1) {
    return undefined;
  }

  const payload = expectedAlertValue.slice(calledWithIndex + calledWithMarker.length).trim();
  if (!payload.startsWith('{') && !payload.startsWith('[')) {
    return undefined;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return undefined;
  }
}

export function loadFixtureCase<TInputValue = unknown, TExpectedWirePayload = unknown>(
  family: string,
  title: string,
  options: LoadFixtureCaseOptions = {},
): FixtureCase<TInputValue, TExpectedWirePayload> {
  const fixturePath = path.resolve(__dirname, '../../../../apps/teams-test-app/e2e-test-data', `${family}.json`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as FixtureRecord;
  const testCases = [
    ...(fixture.testCases ?? []),
    ...(fixture.featureTests ?? []).flatMap((featureTest) => featureTest.testCases ?? []),
  ];

  let matches = testCases.filter((testCase) => testCase.title === title);
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
        `(versions: ${versions}). Pass options.version to disambiguate.`,
    );
  }

  const fixtureCase = matches[0];
  const expectedAlertValue = fixtureCase.expectedAlertValue ?? '';

  return {
    title: fixtureCase.title ?? title,
    inputValue: fixtureCase.inputValue as TInputValue,
    expectedAlertValue,
    expectedWirePayload: parseExpectedWirePayload(expectedAlertValue) as TExpectedWirePayload | undefined,
  };
}
