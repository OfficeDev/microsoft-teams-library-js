import {
  doesStringContainNonPrintableCharacters,
  doesStringContainScriptTags,
  isStringWithinAppIdLengthLimits,
  maximumValidAppIdLength,
  minimumValidAppIdLength,
  validateStringAsAppId,
} from '../../src/internal/appIdValidation';

describe('doesStringContainNonPrintableCharacters', () => {
  test('should return true for strings with only non-printable characters', () => {
    expect(doesStringContainNonPrintableCharacters('\u0000')).toBe(true); // Contains null character
    expect(doesStringContainNonPrintableCharacters('\u007F')).toBe(true); // Contains delete character
  });

  test('should return true for strings with mixed printable and non-printable characters', () => {
    expect(doesStringContainNonPrintableCharacters('hello\u0000')).toBe(true); // Ends with null character
    expect(doesStringContainNonPrintableCharacters('\u007Fworld')).toBe(true); // Starts with delete character
    expect(doesStringContainNonPrintableCharacters('hello\u0080world')).toBe(true); // Contains non-printable character
  });

  test('should return false for strings with only printable characters', () => {
    expect(doesStringContainNonPrintableCharacters('hello world')).toBe(false);
    expect(doesStringContainNonPrintableCharacters('AAAA')).toBe(false);
    expect(doesStringContainNonPrintableCharacters('1234567890')).toBe(false);
    expect(doesStringContainNonPrintableCharacters('!@#$%^&*()')).toBe(false);
    expect(doesStringContainNonPrintableCharacters('8e6523aa-97f9-49ad-8614-75cae22f6597')).toBe(false);
    expect(doesStringContainNonPrintableCharacters('com.microsoft.teamspace.tab.youtube')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(doesStringContainNonPrintableCharacters('')).toBe(false);
  });
});

describe('isStringWithinAppIdLengthLimits', () => {
  test('should return true for strings within the valid length limits', () => {
    expect(isStringWithinAppIdLengthLimits('a'.repeat(minimumValidAppIdLength + 5))).toBe(true);
    expect(isStringWithinAppIdLengthLimits('3789ff94-ceff-49d3-b2d8-ea3dfce76115')).toBe(true);
    expect(isStringWithinAppIdLengthLimits('com.microsoft.teamspace.tab.youtube')).toBe(true);
  });

  test('should return false for strings shorter than the minimum valid length', () => {
    expect(isStringWithinAppIdLengthLimits('a'.repeat(minimumValidAppIdLength - 1))).toBe(false);
    expect(isStringWithinAppIdLengthLimits('')).toBe(false);
  });

  test('should return false for strings longer than the maximum valid length', () => {
    expect(isStringWithinAppIdLengthLimits('a'.repeat(maximumValidAppIdLength + 1))).toBe(false);
  });

  test('should return false for strings exactly at the minimum valid length', () => {
    expect(isStringWithinAppIdLengthLimits('a'.repeat(minimumValidAppIdLength))).toBe(false);
  });

  test('should return false for strings exactly at the maximum valid length', () => {
    expect(isStringWithinAppIdLengthLimits('a'.repeat(maximumValidAppIdLength))).toBe(false);
  });
});

describe('doesStringContainScriptTags', () => {
  test('should return true for strings containing script tags', () => {
    expect(doesStringContainScriptTags('<script>alert("Hello")</script>')).toBe(true);
    expect(doesStringContainScriptTags('<script src="example.js"></script>')).toBe(true);
    expect(doesStringContainScriptTags('<script type="text/javascript">console.log("test")</script>')).toBe(true);
  });

  test('should return false for strings without script tags', () => {
    expect(doesStringContainScriptTags('This is a test string')).toBe(false);
    expect(doesStringContainScriptTags('8e6523aa-97f9-49ad-8614-75cae22f6597')).toBe(false);
    expect(doesStringContainScriptTags('com.microsoft.teamspace.tab.youtube')).toBe(false);
    expect(doesStringContainScriptTags('<div>This is a div</div>')).toBe(false);
    expect(doesStringContainScriptTags('<a href="example.com">Link</a>')).toBe(false);
  });

  test('should return true for strings with script tags containing newlines and spaces', () => {
    expect(doesStringContainScriptTags('<script>\nalert("Hello")\n</script>')).toBe(true);
    expect(doesStringContainScriptTags('<script> \n console.log("test") \n </script>')).toBe(true);
  });

  test('should return false for empty string', () => {
    expect(doesStringContainScriptTags('')).toBe(false);
  });

  test('should return true for strings with multiple script tags', () => {
    expect(doesStringContainScriptTags('<script>alert("Hello")</script><script>console.log("test")</script>')).toBe(
      true,
    );
  });
});

// Since there are plenty of tests validating the individual validation functions, these tests are intentionally not as
// comprehensive as those. It executes a few basic tests and also validates that the error messages thrown are as expected.
describe('validateStringAsAppId', () => {
  test('should not throw for "valid" app ids', () => {
    expect(() => validateStringAsAppId('8e6523aa-97f9-49ad-8614-75cae22f6597')).not.toThrow();
    expect(() => validateStringAsAppId('com.microsoft.teamspace.tab.youtube')).not.toThrow();
  });

  test('should throw error with "script" in message for app id containing script tag', () => {
    expect(() => validateStringAsAppId('<script>alert("Hello")</script>')).toThrowError(/script/);
  });

  test('should throw error with "length" in message for app id too long or too short', () => {
    expect(() => validateStringAsAppId('a')).toThrowError(/length/);
    expect(() => validateStringAsAppId('a'.repeat(maximumValidAppIdLength))).toThrowError(/length/);
  });

  test('should throw error with "printable" in message for app id containing non-printable characters', () => {
    expect(() => validateStringAsAppId('hello\u0080world')).toThrowError(/printable/);
  });
});
