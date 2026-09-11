import { normalizeAlertValues, parseWirePayloadFromAlert } from '../../../../apps/teams-test-app/fixture-contract';
import { loadFixtureCase } from './loadFixtureCase';

/**
 * Pins how the shared parse contract treats the two `expectedAlertValue` forms the schema allows.
 *
 * The array form is not a wording variant: it means the case expects a sequence of host calls. A
 * single-entry array therefore describes one call and must parse like a bare string, while a
 * multi-entry one cannot be reduced to a single expected payload — the entries belong to different
 * functions, so picking one would produce a confidently wrong expectation.
 */
describe('fixture alert parsing', () => {
  describe('normalizeAlertValues', () => {
    it('treats a bare string and a single-entry array as the same one alert', () => {
      expect(normalizeAlertValues('scanBarCode called with {}')).toEqual(['scanBarCode called with {}']);
      expect(normalizeAlertValues(['scanBarCode called with {}'])).toEqual(['scanBarCode called with {}']);
    });

    it('keeps every entry of a multi-alert case in order', () => {
      expect(normalizeAlertValues(['selectMedia called with {}', 'getMedia called with {}'])).toEqual([
        'selectMedia called with {}',
        'getMedia called with {}',
      ]);
    });

    it('returns no alerts when the case declares none', () => {
      expect(normalizeAlertValues(undefined)).toEqual([]);
      expect(normalizeAlertValues(42)).toEqual([]);
    });

    it('rejects a mixed-type array instead of dropping invalid entries', () => {
      expect(normalizeAlertValues(['selectMedia called with {"mediaType":1}', 123])).toEqual([]);
    });
  });

  describe('parseWirePayloadFromAlert', () => {
    it('parses a single-entry array, which previously fell back to undefined', () => {
      expect(parseWirePayloadFromAlert(['scanBarCode called with {"timeOutIntervalInSec":30}'], undefined)).toEqual({
        timeOutIntervalInSec: 30,
      });
    });

    it('resolves the input placeholder through the array form too', () => {
      const inputValue = { mediaType: 1 };

      expect(parseWirePayloadFromAlert(['selectMedia called with ##JSON_INPUT_VALUE##'], inputValue)).toBe(inputValue);
    });

    it('refuses to guess a payload for a case alerting on several host calls', () => {
      // Both entries parse, and the first belongs to selectMedia while the case under test is
      // getMedia — so "first entry that parses" would assert another function's payload.
      const alerts = ['selectMedia called with {"mediaType":1}', 'getMedia called with {"id":"ABC"}'];

      expect(parseWirePayloadFromAlert(alerts, undefined)).toBeUndefined();
    });

    it('does not parse a mixed-type array as a single alert', () => {
      expect(parseWirePayloadFromAlert(['selectMedia called with {"mediaType":1}', 123], undefined)).toBeUndefined();
    });

    it('still returns undefined for prose that names values instead of a payload', () => {
      expect(parseWirePayloadFromAlert('getCurrentLocation is called', undefined)).toBeUndefined();
    });
  });

  describe('loadFixtureCase', () => {
    it('exposes every alert of a real multi-alert fixture case without dropping it', () => {
      // media.json's getMedia case is the array-valued fixture that used to be coerced away.
      const fixtureCase = loadFixtureCase('media', 'getMedia API Call - Success');

      expect(fixtureCase.expectedAlertValues).toEqual([
        'selectMedia called with ##JSON_INPUT_VALUE##',
        'getMedia called with "ABCDEFGHIJKL"',
      ]);
      expect(fixtureCase.expectedWirePayload).toBeUndefined();
    });

    it('derives the payload for a real single-entry-array fixture case', () => {
      const fixtureCase = loadFixtureCase('barCode', 'scanBarCode API Call - Success');

      expect(fixtureCase.expectedAlertValues).toEqual(['scanBarCode called with {}']);
      expect(fixtureCase.expectedWirePayload).toEqual({});
    });
  });
});
