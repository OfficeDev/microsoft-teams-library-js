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
  inputValue?: unknown;
  expectedAlertValue?: string;
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
): FixtureCase<TInputValue, TExpectedWirePayload> {
  const fixturePath = path.resolve(__dirname, '../../../../apps/teams-test-app/e2e-test-data', `${family}.json`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as FixtureRecord;
  const testCases = [
    ...(fixture.testCases ?? []),
    ...(fixture.featureTests ?? []).flatMap((featureTest) => featureTest.testCases ?? []),
  ];
  const fixtureCase = testCases.find((testCase) => testCase.title === title);

  if (!fixtureCase) {
    throw new Error(`Fixture case "${title}" not found in ${fixturePath}`);
  }

  const expectedAlertValue = fixtureCase.expectedAlertValue ?? '';

  return {
    title: fixtureCase.title ?? title,
    inputValue: fixtureCase.inputValue as TInputValue,
    expectedAlertValue,
    expectedWirePayload: parseExpectedWirePayload(expectedAlertValue) as TExpectedWirePayload | undefined,
  };
}
