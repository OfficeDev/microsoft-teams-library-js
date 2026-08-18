import * as fs from 'fs';
import * as path from 'path';

import {
  FixtureFileRecord,
  parseWirePayloadFromAlert,
  selectFixtureCase,
  SelectFixtureCaseOptions,
} from '../../../../apps/teams-test-app/fixture-contract';

export type LoadFixtureCaseOptions = SelectFixtureCaseOptions;

export interface FixtureCase<TInputValue = unknown, TExpectedWirePayload = unknown> {
  title: string;
  inputValue: TInputValue;
  expectedAlertValue: string;
  /**
   * The wire payload the case's alert describes, or `undefined` when the alert does not describe
   * one. Specs proving an input to wire transformation should assert this is defined.
   */
  expectedWirePayload?: TExpectedWirePayload;
}

const FIXTURES_DIR = path.resolve(__dirname, '../../../../apps/teams-test-app/e2e-test-data');

/**
 * Loads a single capability fixture case by title. The parse contract itself lives in
 * apps/teams-test-app/fixture-contract so this repo and the Hub SDK agree on what a case's fields
 * mean; only locating the fixtures is repo specific.
 */
export function loadFixtureCase<TInputValue = unknown, TExpectedWirePayload = unknown>(
  family: string,
  title: string,
  options: LoadFixtureCaseOptions = {},
): FixtureCase<TInputValue, TExpectedWirePayload> {
  const fixturePath = path.join(FIXTURES_DIR, `${family}.json`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as FixtureFileRecord;
  const fixtureCase = selectFixtureCase(fixture, title, fixturePath, options);
  const expectedAlertValue = typeof fixtureCase.expectedAlertValue === 'string' ? fixtureCase.expectedAlertValue : '';

  return {
    title: fixtureCase.title ?? title,
    inputValue: fixtureCase.inputValue as TInputValue,
    expectedAlertValue,
    expectedWirePayload: parseWirePayloadFromAlert(expectedAlertValue, fixtureCase.inputValue) as
      | TExpectedWirePayload
      | undefined,
  };
}
