import { isHostAdaptiveCardSchemaVersionUnsupported } from '../../src/internal/utils';
import { getAdaptiveCardSchemaVersion } from '../../src/public';
import { minAdaptiveCardVersion } from '../../src/public/constants';
import { Utils } from '../utils';
/* eslint-disable */

describe('Testing Adaptive Cards', () => {
  const utils = new Utils();
  describe('getAdaptiveCardSchemaVersion', () => {
    it('should return the Adaptive Card Version supported by hosts', () => {
      utils.setRuntimeConfig({
        apiVersion: 2,
        hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
        supports: {},
      });
      expect(getAdaptiveCardSchemaVersion()).toMatchObject(minAdaptiveCardVersion);
    });

    it('should return undefined if Adaptive Card Version is not supported by hosts', () => {
      utils.setRuntimeConfig({
        apiVersion: 1,
        hostVersionsInfo: {},
        supports: {},
      });
      expect(getAdaptiveCardSchemaVersion()).toBeUndefined();
    });
  });

  describe('Testing isHostAdaptiveCardSchemaVersionUnsupported', () => {
    it('should return false if the version supported by host is equal to minimum adaptive card version', () => {
      expect(isHostAdaptiveCardSchemaVersionUnsupported(minAdaptiveCardVersion)).toBeFalsy();
    });
    it('should return false if the version supported by host is higher than minimum adaptive card version', () => {
      expect(isHostAdaptiveCardSchemaVersionUnsupported({ majorVersion: 1, minorVersion: 6 })).toBeFalsy();
    });

    it('should return true if the version supported by host is less than minimum adaptive card version', () => {
      expect(isHostAdaptiveCardSchemaVersionUnsupported({ majorVersion: 1, minorVersion: 4 })).toBeTruthy();
    });
  });
});
