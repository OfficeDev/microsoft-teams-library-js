import { getAdaptiveCardSchemaVersion } from '../../src/public';
import { minAdaptiveCardVersion } from '../../src/public/constants';
import { Utils } from '../utils';
/* eslint-disable */

describe('Testing Adaptive Cards', () => {
  const utils = new Utils();
  describe('getAdaptiveCardSchemaVersion', () => {
    it('should return the Adaptive Card Version supported by hosts', () => {
      utils.setRuntimeConfig({
        apiVersion: 1,
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
});
