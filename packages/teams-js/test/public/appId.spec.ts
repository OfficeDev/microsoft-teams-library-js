import { maximumValidAppIdLength } from '../../src/internal/appIdValidation';
import { AppId } from '../../src/public/appId';

// Since there are plenty of tests validating the individual validation functionality, these tests are intentionally not as
// comprehensive as those. It executes a few basic tests and also validates that the error messages thrown are as expected.
describe('AppId', () => {
  describe('constructor', () => {
    describe('doesStringContainNonPrintableCharacters', () => {
      test('should not throw for "valid" app ids', () => {
        expect(() => new AppId('8e6523aa-97f9-49ad-8614-75cae22f6597')).not.toThrow();
        expect(() => new AppId('com.microsoft.teamspace.tab.youtube')).not.toThrow();
      });

      test('should throw error with "script" in message for app id containing script tag', () => {
        expect(() => new AppId('<script>alert("Hello")</script>')).toThrowError(/script/i);
      });

      test('should throw error with "length" in message for app id too long or too short', () => {
        expect(() => new AppId('a')).toThrowError(/length/i);
        expect(() => new AppId('a'.repeat(maximumValidAppIdLength))).toThrowError(/length/i);
      });

      test('should throw error with "printable" in message for app id containing non-printable characters', () => {
        expect(() => new AppId('hello\u0080world')).toThrowError(/printable/i);
      });
    });
  });
  describe('getSerializableObject', () => {
    test('should return the same value as toString', () => {
      const appId = new AppId('8e6523');
      expect(appId.serialize()).toBe(appId.toString());
    });
  });
});
