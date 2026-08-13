import * as fs from 'fs';
import * as path from 'path';

export interface FixtureCase<TInputValue = unknown> {
  title: string;
  inputValue: TInputValue;
  expectedAlertValue: string;
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

export function loadFixtureCase<TInputValue = unknown>(family: string, title: string): FixtureCase<TInputValue> {
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

  return {
    title: fixtureCase.title ?? title,
    inputValue: fixtureCase.inputValue as TInputValue,
    expectedAlertValue: fixtureCase.expectedAlertValue ?? '',
  };
}
