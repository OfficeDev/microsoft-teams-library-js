import {
  base64ToBlob,
  callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise,
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  compareSDKVersions,
  createTeamsAppLink,
  deepFreeze,
  generateGUID,
  getBase64StringFromBlob,
  hasScriptTags,
  isPrimitiveOrPlainObject,
  normalizeAgeGroupValue,
  runWithTimeout,
  validateId,
  validateUrl,
  validateUuid,
} from '../../src/internal/utils';
import { AppId, pages } from '../../src/public';
import {
  ClipboardSupportedMimeType,
  ErrorCode,
  LegalAgeGroupClassification,
  SdkError,
} from '../../src/public/interfaces';
import { IBaseRuntime } from '../../src/public/runtime';
import { UUID } from '../../src/public/uuidObject';

describe('utils', () => {
  test('compareSDKVersions', () => {
    expect(compareSDKVersions('1.2', '1.2.0')).toEqual(0);
    expect(compareSDKVersions('1.2a', '1.2b')).toEqual(NaN);
    expect(compareSDKVersions('1.2', '1.3')).toEqual(-1);
    expect(compareSDKVersions('2.0', '1.3.2')).toEqual(1);
    expect(compareSDKVersions('1.10.0', '1.8.0')).toEqual(1);
    expect(compareSDKVersions('1.10.0', '1.8.2')).toEqual(1);
    expect(compareSDKVersions('2', '1.10.345')).toEqual(1);
    expect(compareSDKVersions('1.9.1', '1.9.0.0')).toEqual(1);
  });
  describe('createTeamsAppLink', () => {
    it('builds a basic URL with an appId and pageId', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
      };
      const expected = 'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123';
      expect(createTeamsAppLink(params)).toBe(expected);
    });
    it('builds a URL with a webUrl parameter', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
        webUrl: new URL('https://tasklist.example.com/123'),
      };
      const expected =
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123';
      expect(createTeamsAppLink(params)).toBe(expected);
    });
    it('builds a URL with a subPageUrl parameter', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
        subPageId: 'task456',
      };
      const expected =
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?context=%7B%22subEntityId%22%3A%22task456%22%7D';
      expect(createTeamsAppLink(params)).toBe(expected);
    });
    it('builds a URL with a channelId parameter', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
        channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
      };
      const expected =
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%7D';
      expect(createTeamsAppLink(params)).toBe(expected);
    });

    it('builds a URL with a chatId parameter', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
        chatId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
      };
      const expected =
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?context=%7B%22chatId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%7D';
      expect(createTeamsAppLink(params)).toBe(expected);
    });
    it('builds a URL with all optional properties', () => {
      const params: pages.AppNavigationParameters = {
        appId: new AppId('fe4a8eba-2a31-4737-8e33-e5fae6fee194'),
        pageId: 'tasklist123',
        webUrl: new URL('https://tasklist.example.com/123'),
        channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
        subPageId: 'task456',
      };
      const expected =
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123&context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%2C%22subEntityId%22%3A%22task456%22%7D';
      expect(createTeamsAppLink(params)).toBe(expected);
    });
  });

  describe('base64ToBlob', () => {
    it('should convert base64 string to Blob for image/png MIME type', async () => {
      const base64Data = 'SGVsbG8=';
      const mimeType = ClipboardSupportedMimeType.ImagePNG;
      const result = await base64ToBlob(mimeType, base64Data);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(ClipboardSupportedMimeType.ImagePNG);
    });
    it('should throw error if MIME type is not provided', async () => {
      const base64Data = 'SGVsbG8=';
      const mimeType = '';
      try {
        await base64ToBlob(mimeType, base64Data);
      } catch (error) {
        expect(error).toEqual('MimeType cannot be null or empty.');
      }
    });

    it('should throw error if base64 string is not provided', async () => {
      const base64Data = '';
      const mimeType = ClipboardSupportedMimeType.ImageJPEG;
      try {
        await base64ToBlob(mimeType, base64Data);
      } catch (error) {
        expect(error).toEqual('Base64 string cannot be null or empty.');
      }
    });

    it('should convert base64 string to Blob for image/jpeg MIME type', async () => {
      const base64Data = 'SGVsbG8=';
      const mimeType = ClipboardSupportedMimeType.ImageJPEG;

      const result = await base64ToBlob(mimeType, base64Data);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(ClipboardSupportedMimeType.ImageJPEG);
    });

    it('should convert base64 string to Blob for non-image MIME type', async () => {
      const base64Data = 'SGVsbG8=';
      const mimeType = ClipboardSupportedMimeType.TextPlain;
      const result = await base64ToBlob(mimeType, base64Data);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(ClipboardSupportedMimeType.TextPlain);
    });

    it('should convert base64 string with special characters to Blob for non-image MIME type', async () => {
      const base64Data = '4oCvV2hhdOKAmXMgdGhlIGxhdGVzdCB1cGRhdGUuLi4=';
      const mimeType = ClipboardSupportedMimeType.TextPlain;
      const result = await base64ToBlob(mimeType, base64Data);
      const stringResult = await getBase64StringFromBlob(result);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(ClipboardSupportedMimeType.TextPlain);
      expect(stringResult).toEqual('4oCvV2hhdOKAmXMgdGhlIGxhdGVzdCB1cGRhdGUuLi4=');
    });

    it('should convert base64 string to Blob for non-image MIME type', async () => {
      const base64Data = 'PHA+SGVsbG8sIHdvcmxkITwvcD4=';
      const mimeType = ClipboardSupportedMimeType.TextHtml;
      const result = await base64ToBlob(mimeType, base64Data);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(ClipboardSupportedMimeType.TextHtml);
    });
  });

  describe('getBase64StringFromBlob', () => {
    it('should resolve with base64 string when reading a text/plain Blob', async () => {
      const content = 'Hello, world!';
      const blob = new Blob([content], { type: 'text/plain' });

      const result = await getBase64StringFromBlob(blob);

      expect(result).toEqual('SGVsbG8sIHdvcmxkIQ==');
    });

    it('should resolve with base64 string when reading a text/html Blob', async () => {
      const content = '<p>Hello, world!</p>';
      const blob = new Blob([content], { type: 'text/html' });

      const result = await getBase64StringFromBlob(blob);

      expect(result).toEqual('PHA+SGVsbG8sIHdvcmxkITwvcD4=');
    });

    it('should resolve with base64 string when reading a image/png Blob', async () => {
      const content = '<p>Hello, world!</p>';
      const blob = new Blob([content], { type: 'image/png' });

      const result = await getBase64StringFromBlob(blob);

      expect(result).toEqual('PHA+SGVsbG8sIHdvcmxkITwvcD4=');
    });

    it('should resolve with base64 string when reading a image/jpeg Blob', async () => {
      const content = '<p>Hello, world!</p>';
      const blob = new Blob([content], { type: 'image/jpeg' });

      const result = await getBase64StringFromBlob(blob);

      expect(result).toEqual('PHA+SGVsbG8sIHdvcmxkITwvcD4=');
    });

    it('should throw error when blob is empty', async () => {
      const blob = new Blob([], { type: 'image/jpeg' });
      try {
        await getBase64StringFromBlob(blob);
      } catch (error) {
        expect(error).toEqual(new Error('Blob cannot be empty.'));
      }
    });
  });

  describe('validateUrl', () => {
    it('should throw invalid url error if it contains script tag', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=<script>alert("Hello, world!");</script>';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains uppercase script tags', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=<script>alert("Hello, world!");</script>'.toLocaleUpperCase();
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains mixed case script tags', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=<Script>alert("Hello, world!");</sCrIpT>';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains multiple script tags', async () => {
      expect.assertions(1);
      const url =
        'https://example.com?id=1&param=<script>alert("Hello, world!");</script>&val=3&param=<script>alert("Hello, world!");</script>';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains HTML encoded script tags', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=&lt;script&gt;alert("Hello, world!");&lt;/script&gt;';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains HTML encoded script tags in upper case', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=&lt;script&gt;alert("Hello, world!");&lt;/script&gt;'.toLocaleUpperCase();
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it contains HTML encoded script tags in mixed case', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=&LT;sCript&gt;alert("Hello, world!");&lt;/scRipt&Gt;';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Invalid Url'));
      }
    });
    it('should throw invalid url error if it non http url', async () => {
      expect.assertions(1);
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url
      const url = 'http://example.com;';
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Url should be a valid https url'));
      }
    });
    it('should not throw error when url is a valid url', () => {
      expect.assertions(1);
      const url = 'https://example.com?param=< stript >';
      return expect(() => validateUrl(new URL(url))).not.toThrow();
    });
  });

  describe('validateId', () => {
    it('should throw error on invalid app ID if it contains script tag', async () => {
      expect.assertions(1);
      const invalidAppId = 'invalidAppIdwith<script>alert(1)</script>';
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });
    it('should throw error on invalid app ID if it contains non printabe ASCII characters', () => {
      expect.assertions(1);
      const invalidAppId = 'appId\u0000';
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });
    it('should throw error on invalid app ID if its size exceeds 256 characters', () => {
      expect.assertions(1);
      const invalidAppId = 'a'.repeat(257);
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });
    it('should throw error on invalid app ID if its size is less than 5 characters', () => {
      expect.assertions(1);
      const invalidAppId = 'a'.repeat(4);
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });

    it('should not throw error when appId is a valid app ID', () => {
      expect.assertions(1);
      const appId = '11111111-1111-1111-1111-111111111111';
      return expect(() => validateId(appId)).not.toThrow();
    });

    it('should not throw defined error in the second parameter', () => {
      expect.assertions(1);
      const invalidAppId = 'a'.repeat(257);
      try {
        validateId(invalidAppId, new Error('Error message'));
      } catch (error) {
        expect(error).toEqual(new Error('Error message'));
      }
    });

    it('should throw error on invalid app ID if it contains ecoded script tag', async () => {
      expect.assertions(1);
      const invalidAppId = encodeURIComponent('Invalid<script>alert("Hello, world!");</script>');
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });

    it('should throw error on invalid app ID if it contains ecoded script tag', async () => {
      expect.assertions(1);
      const invalidAppId = 'InvalidID&lt;script&gt;alert("Hello, world!");&lt;/script&gt;';
      try {
        validateId(invalidAppId);
      } catch (error) {
        expect(error).toEqual(new Error('id is not valid.'));
      }
    });
  });

  describe('hasScriptTags', () => {
    test('detects plain opening <script> tag', () => {
      expect(hasScriptTags('<script>alert("XSS")</script>')).toBe(true);
    });

    test('detects HTML entity encoded opening <script> tag', () => {
      expect(hasScriptTags('&lt;script&gt;alert("XSS")&lt;/script&gt;')).toBe(true);
    });

    test('detects URI encoded opening <script> tag', () => {
      expect(hasScriptTags('%3Cscript%3Ealert("XSS")%3C/script%3E')).toBe(true);
    });

    test('detects plain closing </script> tag', () => {
      expect(hasScriptTags('</script>')).toBe(true);
    });

    test('detects HTML entity encoded closing </script> tag', () => {
      expect(hasScriptTags('&lt;/script&gt;')).toBe(true);
    });

    test('detects URI encoded closing </script> tag', () => {
      expect(hasScriptTags('%3C/script%3E')).toBe(true);
    });

    test('returns false for strings without <script> tags', () => {
      expect(hasScriptTags('<div>no script here</div>')).toBe(false);
    });

    test('detects mixed content with <script> tags', () => {
      expect(hasScriptTags('<div><script>alert("XSS")</script></div>')).toBe(true);
    });

    test('returns false for empty string', () => {
      expect(hasScriptTags('')).toBe(false);
    });

    test('detects multiple <script> tags', () => {
      expect(hasScriptTags('<script>alert("XSS")</script><script>alert("XSS2")</script>')).toBe(true);
    });

    test('detects <script> tags with attributes', () => {
      expect(hasScriptTags('<script type="text/javascript">alert("XSS")</script>')).toBe(true);
      expect(hasScriptTags('<script src="example.js"></script>')).toBe(true);
      expect(hasScriptTags('<script async defer>alert("XSS")</script>')).toBe(true);
    });

    test('detects HTML entity encoded <script> tag with attributes', () => {
      expect(hasScriptTags('&lt;script type="text/javascript"&gt;alert("XSS")&lt;/script&gt;')).toBe(true);
      expect(hasScriptTags('&lt;script src="example.js"&gt;&lt;/script&gt;')).toBe(true);
    });

    test('detects URI encoded <script> tag with attributes', () => {
      expect(hasScriptTags('%3Cscript%20type=%22text/javascript%22%3Ealert("XSS")%3C/script%3E')).toBe(true);
      expect(hasScriptTags('%3Cscript%20src=%22example.js%22%3E%3C/script%3E')).toBe(true);
    });

    test('detects <script> tags with spaces', () => {
      expect(hasScriptTags('<script >alert("XSS")</script >')).toBe(true);
    });

    test('detects plain opening <script> tag with URI encoded closing tag', () => {
      expect(hasScriptTags('<script>alert("XSS")%3C/script%3E')).toBe(true);
    });

    test('detects URI encoded opening <script> tag with plain closing tag', () => {
      expect(hasScriptTags('%3Cscript%3Ealert("XSS")</script>')).toBe(true);
    });

    test('detects plain opening <script> tag with HTML entity encoded closing tag', () => {
      expect(hasScriptTags('<script>alert("XSS")&lt;/script&gt;')).toBe(true);
    });

    test('detects HTML entity encoded opening <script> tag with plain closing tag', () => {
      expect(hasScriptTags('&lt;script&gt;alert("XSS")</script>')).toBe(true);
    });

    test('detects nested <script> tags', () => {
      expect(hasScriptTags('<script><script>alert("nested")</script></script>')).toBe(true);
    });

    test('detects <script> tags with unusual but valid attributes', () => {
      expect(hasScriptTags('<script data-custom="value">alert("XSS")</script>')).toBe(true);
      expect(hasScriptTags('<script nonce="random">alert("XSS")</script>')).toBe(true);
    });

    test('detects <script> tags with different casing', () => {
      expect(hasScriptTags('<SCRIPT>alert("XSS")</SCRIPT>')).toBe(true);
      expect(hasScriptTags('&lt;SCRIPT&gt;alert("XSS")&lt;/SCRIPT&gt;')).toBe(true);
      expect(hasScriptTags('%3CSCRIPT%3Ealert("XSS")%3C/SCRIPT%3E')).toBe(true);
    });

    test('detects mixed casing <script> tags', () => {
      expect(hasScriptTags('<sCRipT>alert("XSS")</sCRipT>')).toBe(true);
      expect(hasScriptTags('&lt;sCRipT&gt;alert("XSS")&lt;/sCRipT&gt;')).toBe(true);
      expect(hasScriptTags('%3CsCRipT%3Ealert("XSS")%3C/sCRipT%3E')).toBe(true);
    });
  });

  describe('UUID class tests', () => {
    describe('validateUuid', () => {
      it('should throw error when id is undefined', async () => {
        expect.assertions(1);
        try {
          await validateUuid(undefined);
        } catch (error) {
          expect(error).toEqual(new Error('id must not be empty'));
        }
      });

      it('should throw error when id is null', async () => {
        expect.assertions(1);
        try {
          await validateUuid(null);
        } catch (error) {
          expect(error).toEqual(new Error('id must not be empty'));
        }
      });

      it('should throw error when id is empty', async () => {
        expect.assertions(1);
        try {
          await validateUuid('');
        } catch (error) {
          expect(error).toEqual(new Error('id must not be empty'));
        }
      });

      it('should throw error when id is not a valid UUID', async () => {
        expect.assertions(1);
        const id = 'invalid-id';
        try {
          await validateUuid(id);
        } catch (error) {
          expect(error).toEqual(new Error('id must be a valid UUID'));
        }
      });

      it('should not throw error when appId is a valid GUID', async () => {
        expect.assertions(1);
        // ID randomly generated for this test
        const id = 'fe4a8eba-2a31-4737-8e33-e5fae6fee194';
        return expect(() => validateUuid(id)).not.toThrow();
      });
    });
    describe('UUID class', () => {
      it('should create new uuid when input is undefined', async () => {
        expect.assertions(1);
        const uuid = new UUID(undefined);
        return expect(() => validateUuid(uuid.toString())).not.toThrow();
      });
      it('should throw error when id is empty', async () => {
        expect.assertions(1);
        try {
          const _uuid = new UUID('');
        } catch (error) {
          expect(error).toEqual(new Error('id must not be empty'));
        }
      });

      it('should throw error when id is not a valid UUID', async () => {
        expect.assertions(1);
        const id = 'invalid-id';
        try {
          const _uuid = new UUID(id);
        } catch (error) {
          expect(error).toEqual(new Error('id must be a valid UUID'));
        }
      });

      it('should not throw error when appId is a valid GUID', async () => {
        expect.assertions(1);
        // ID randomly generated for this test
        const id = 'fe4a8eba-2a31-4737-8e33-e5fae6fee194';
        const uuid = new UUID(id);
        expect(() => validateUuid(uuid.toString())).not.toThrow();
        return expect(() => uuid.toString() === id);
      });
    });
  });
  describe('isPrimitiveOrPlainObject', () => {
    type NestedObject = { [key: string]: NestedObject | null };
    function createNestedObject(depth: number): NestedObject {
      // Create an empty object to start
      const current: NestedObject = {};
      let nestedObject: NestedObject = current;

      // Loop to create a nested structure
      for (let i = 0; i < depth; i++) {
        nestedObject[i.toString()] = {}; // Create a new nested object for each depth level
        nestedObject = nestedObject[i.toString()] as NestedObject; // Move deeper into the nesting
      }

      return current; // Return the top-level object
    }
    it('should return true for undefined or null', () => {
      expect(isPrimitiveOrPlainObject(undefined)).toBe(true);
      expect(isPrimitiveOrPlainObject(null)).toBe(true);
    });

    it('should return true for primitives except symbol', () => {
      expect(isPrimitiveOrPlainObject(true)).toBe(true); // Check for boolean
      expect(isPrimitiveOrPlainObject(-123)).toBe(true); //Check for number
      expect(isPrimitiveOrPlainObject(BigInt(123))).toBe(true); //Check for BigInt
      expect(isPrimitiveOrPlainObject('testString')).toBe(true); //Check for string
    });

    it('should return false for symbol', () => {
      expect(isPrimitiveOrPlainObject(Symbol('symbol'))).toBe(false);
    });

    it('should return true for arrays of primitive types', () => {
      expect(isPrimitiveOrPlainObject([1, 'a', true, null, undefined])).toBe(true);
    });

    it('should return true for plain objects', () => {
      expect(isPrimitiveOrPlainObject({ a: 1, b: 'string', c: true })).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(isPrimitiveOrPlainObject(new Date())).toBe(false);
      expect(isPrimitiveOrPlainObject(new Map())).toBe(false);
    });
    it('should return true for nested plain objects and arrays', () => {
      expect(isPrimitiveOrPlainObject({ a: [1, 2, { b: 'string' }] })).toBe(true);
    });

    it('should return false for nested structures with non-plain objects', () => {
      expect(isPrimitiveOrPlainObject({ a: [1, 2, new Date()] })).toBe(false);
      expect(isPrimitiveOrPlainObject({ a: { b: [1, 2, function () {}] } })).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isPrimitiveOrPlainObject(function () {})).toBe(false);
    });

    it('should return false for objects nested deeper than 1000 levels', () => {
      expect(isPrimitiveOrPlainObject(createNestedObject(1001))).toBe(false);
      expect(isPrimitiveOrPlainObject(createNestedObject(1000))).toBe(true);
    });
  });
  describe('normalizeAgeGroupValue', () => {
    const createMockRuntimeConfig = (ageGroup?: string | LegalAgeGroupClassification): IBaseRuntime => ({
      apiVersion: 4,
      supports: {},
      hostVersionsInfo: {
        appEligibilityInformation: {
          ageGroup: ageGroup as LegalAgeGroupClassification,
          cohort: null,
          isCopilotEligible: false,
          isCopilotEnabledRegion: true,
          isOptedOutByAdmin: false,
          userClassification: null,
        },
      },
    });

    describe('when ageGroup needs normalization', () => {
      it('should normalize "nonAdult" to NotAdult', () => {
        const input = createMockRuntimeConfig('nonAdult');
        const result = normalizeAgeGroupValue(input);

        expect(result.hostVersionsInfo?.appEligibilityInformation?.ageGroup).toBe(LegalAgeGroupClassification.NotAdult);
        expect(result).not.toBe(input); // Should return a new object
      });

      it('should normalize "NonAdult" to NotAdult (case insensitive)', () => {
        const input = createMockRuntimeConfig('NonAdult');
        const result = normalizeAgeGroupValue(input);

        expect(result.hostVersionsInfo?.appEligibilityInformation?.ageGroup).toBe(LegalAgeGroupClassification.NotAdult);
      });

      it('should normalize "NONADULT" to NotAdult (case insensitive)', () => {
        const input = createMockRuntimeConfig('NONADULT');
        const result = normalizeAgeGroupValue(input);

        expect(result.hostVersionsInfo?.appEligibilityInformation?.ageGroup).toBe(LegalAgeGroupClassification.NotAdult);
      });

      it('should normalize "noNaDuLt" to NotAdult (mixed case)', () => {
        const input = createMockRuntimeConfig('noNaDuLt');
        const result = normalizeAgeGroupValue(input);

        expect(result.hostVersionsInfo?.appEligibilityInformation?.ageGroup).toBe(LegalAgeGroupClassification.NotAdult);
      });
    });
  });

  describe('generateGUID', () => {
    // Matched case-insensitively: generateGUID only promises a valid v4 UUID, not a particular casing.
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it('should generate a v4 UUID', () => {
      expect(generateGUID()).toMatch(uuidV4Regex);
    });

    it('should generate a value accepted by validateUuid', () => {
      expect(() => validateUuid(generateGUID())).not.toThrow();
    });

    it('should generate a different value on each call', () => {
      const generatedIds = new Set(Array.from({ length: 1000 }, () => generateGUID()));
      expect(generatedIds.size).toBe(1000);
    });
  });

  describe('deepFreeze', () => {
    it('should freeze a flat object and return the same instance', () => {
      const original = { a: 1, b: 'two' };
      const frozen = deepFreeze(original);

      expect(frozen).toBe(original);
      expect(Object.isFrozen(frozen)).toBe(true);
    });

    it('should prevent mutation of a frozen property', () => {
      const frozen = deepFreeze({ a: 1 });

      expect(() => {
        frozen.a = 2;
      }).toThrow(TypeError);
      expect(frozen.a).toBe(1);
    });

    it('should prevent adding new properties to a frozen object', () => {
      const frozen: { a: number; b?: number } = deepFreeze<{ a: number; b?: number }>({ a: 1 });

      expect(() => {
        frozen.b = 2;
      }).toThrow(TypeError);
      expect(frozen.b).toBeUndefined();
    });

    it('should freeze nested objects recursively', () => {
      const frozen = deepFreeze({ level1: { level2: { level3: { value: 'deep' } } } });

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.level1)).toBe(true);
      expect(Object.isFrozen(frozen.level1.level2)).toBe(true);
      expect(Object.isFrozen(frozen.level1.level2.level3)).toBe(true);
      expect(() => {
        frozen.level1.level2.level3.value = 'changed';
      }).toThrow(TypeError);
    });

    it('should freeze arrays and the objects they contain', () => {
      const frozen = deepFreeze({ items: [{ id: 1 }, { id: 2 }] });

      expect(Object.isFrozen(frozen.items)).toBe(true);
      expect(Object.isFrozen(frozen.items[0])).toBe(true);
      expect(Object.isFrozen(frozen.items[1])).toBe(true);
      expect(() => frozen.items.push({ id: 3 })).toThrow(TypeError);
      expect(frozen.items).toHaveLength(2);
    });

    it('should freeze an array passed in directly', () => {
      const frozen = deepFreeze(['a', 'b']);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(() => frozen.pop()).toThrow(TypeError);
    });

    it('should skip null and undefined properties without throwing', () => {
      const original: { nullValue: null; undefinedValue: undefined; nested: { value: number } } = {
        nullValue: null,
        undefinedValue: undefined,
        nested: { value: 1 },
      };
      const frozen = deepFreeze(original);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.nested)).toBe(true);
      expect(frozen.nullValue).toBeNull();
      expect(frozen.undefinedValue).toBeUndefined();
    });

    it('should leave function properties callable while freezing the object', () => {
      const frozen = deepFreeze({ callMe: () => 'called' });

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(frozen.callMe()).toBe('called');
    });

    it('should handle an empty object', () => {
      expect(Object.isFrozen(deepFreeze({}))).toBe(true);
    });
  });

  describe('runWithTimeout', () => {
    const timeoutError: SdkError = { errorCode: ErrorCode.INTERNAL_ERROR, message: 'operation timed out' };
    const actionError: SdkError = { errorCode: ErrorCode.PERMISSION_DENIED, message: 'action failed' };

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should resolve with the result of the action when it completes before the timeout', async () => {
      await expect(runWithTimeout(() => Promise.resolve('result'), 1000, timeoutError)).resolves.toBe('result');
    });

    it('should reject with the timeout error when the action never completes', async () => {
      jest.useFakeTimers();

      const promise = runWithTimeout(() => new Promise<string>(() => {}), 100, timeoutError);
      const rejection = expect(promise).rejects.toBe(timeoutError);
      jest.advanceTimersByTime(100);

      await rejection;
    });

    it('should not reject before the full timeout period has elapsed', async () => {
      jest.useFakeTimers();
      const onRejected = jest.fn();

      const promise = runWithTimeout(() => new Promise<string>(() => {}), 100, timeoutError).catch(onRejected);
      jest.advanceTimersByTime(99);
      await Promise.resolve();
      expect(onRejected).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      await promise;
      expect(onRejected).toHaveBeenCalledWith(timeoutError);
    });

    it('should still reject with the timeout error when the action completes after the timeout elapsed', async () => {
      jest.useFakeTimers();
      let completeAction: (result: string) => void = () => {};

      const promise = runWithTimeout<string, SdkError>(
        () =>
          new Promise<string>((resolve) => {
            completeAction = resolve;
          }),
        100,
        timeoutError,
      );
      const rejection = expect(promise).rejects.toBe(timeoutError);
      jest.advanceTimersByTime(100);
      await rejection;

      completeAction('too late');
      await expect(promise).rejects.toBe(timeoutError);
    });

    it('should reject with the error from the action when the action fails before the timeout', async () => {
      await expect(runWithTimeout(() => Promise.reject(actionError), 1000, timeoutError)).rejects.toBe(actionError);
    });

    it('should clear the pending timeout once the action resolves', async () => {
      const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

      await runWithTimeout(() => Promise.resolve('result'), 1000, timeoutError);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clear the pending timeout once the action rejects', async () => {
      const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

      await expect(runWithTimeout(() => Promise.reject(actionError), 1000, timeoutError)).rejects.toBe(actionError);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('promise to callback bridging helpers', () => {
    /**
     * The helpers attach their own `then`/`catch` handlers to the promise before returning it, so the
     * callback is invoked one or two microtask ticks after the returned promise settles, depending on
     * whether it resolved or rejected. Yielding a macrotask drains the whole pending microtask queue
     * regardless of how many ticks deep the chain is, which is why this is preferred here over awaiting
     * a fixed number of resolved promises. These tests all run under real timers.
     */
    const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
    const error: SdkError = { errorCode: ErrorCode.PERMISSION_DENIED, message: 'something went wrong' };

    describe('callCallbackWithErrorOrResultFromPromiseAndReturnPromise', () => {
      it('should call the callback with undefined error and the result on success', async () => {
        const callback = jest.fn();

        const result = await callCallbackWithErrorOrResultFromPromiseAndReturnPromise(
          () => Promise.resolve('result'),
          callback,
        );

        await flushPromises();
        expect(result).toBe('result');
        expect(callback).toHaveBeenCalledWith(undefined, 'result');
      });

      it('should call the callback with the error and reject the returned promise on failure', async () => {
        const callback = jest.fn();

        const promise = callCallbackWithErrorOrResultFromPromiseAndReturnPromise(() => Promise.reject(error), callback);

        await expect(promise).rejects.toBe(error);
        await flushPromises();
        expect(callback).toHaveBeenCalledWith(error);
      });

      it('should forward the additional arguments to the wrapped function', async () => {
        const funcHelper = jest.fn((..._args: unknown[]) => Promise.resolve('result'));

        await callCallbackWithErrorOrResultFromPromiseAndReturnPromise(funcHelper, undefined, 'first', 2, true);

        expect(funcHelper).toHaveBeenCalledWith('first', 2, true);
      });

      it('should not throw when no callback is provided', async () => {
        await expect(
          callCallbackWithErrorOrResultFromPromiseAndReturnPromise(() => Promise.resolve('result')),
        ).resolves.toBe('result');
        await expect(
          callCallbackWithErrorOrResultFromPromiseAndReturnPromise(() => Promise.reject(error)),
        ).rejects.toBe(error);
        await flushPromises();
      });
    });

    describe('callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise', () => {
      it('should call the callback with undefined error and true on success', async () => {
        const callback = jest.fn();

        await callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(() => Promise.resolve(), callback);

        await flushPromises();
        expect(callback).toHaveBeenCalledWith(undefined, true);
      });

      it('should ignore the resolved value and always report true on success', async () => {
        const callback = jest.fn();

        await callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(() => Promise.resolve('ignored'), callback);

        await flushPromises();
        expect(callback).toHaveBeenCalledWith(undefined, true);
      });

      it('should call the callback with the error and false on failure', async () => {
        const callback = jest.fn();

        const promise = callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(
          () => Promise.reject(error),
          callback,
        );

        await expect(promise).rejects.toBe(error);
        await flushPromises();
        expect(callback).toHaveBeenCalledWith(error, false);
      });

      it('should forward the additional arguments to the wrapped function', async () => {
        const funcHelper = jest.fn((..._args: unknown[]) => Promise.resolve());

        await callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(funcHelper, undefined, 'first', 2);

        expect(funcHelper).toHaveBeenCalledWith('first', 2);
      });

      it('should not throw when no callback is provided', async () => {
        await expect(
          callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(() => Promise.resolve()),
        ).resolves.toBeUndefined();
        await expect(
          callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(() => Promise.reject(error)),
        ).rejects.toBe(error);
        await flushPromises();
      });
    });

    describe('callCallbackWithSdkErrorFromPromiseAndReturnPromise', () => {
      it('should call the callback with null on success', async () => {
        const callback = jest.fn();

        await callCallbackWithSdkErrorFromPromiseAndReturnPromise(() => Promise.resolve(), callback);

        await flushPromises();
        expect(callback).toHaveBeenCalledWith(null);
      });

      it('should call the callback with the error on failure', async () => {
        const callback = jest.fn();

        const promise = callCallbackWithSdkErrorFromPromiseAndReturnPromise(() => Promise.reject(error), callback);

        await expect(promise).rejects.toBe(error);
        await flushPromises();
        expect(callback).toHaveBeenCalledWith(error);
      });

      it('should forward the additional arguments to the wrapped function', async () => {
        const funcHelper = jest.fn((..._args: unknown[]) => Promise.resolve());

        await callCallbackWithSdkErrorFromPromiseAndReturnPromise(funcHelper, undefined, 'first', 2);

        expect(funcHelper).toHaveBeenCalledWith('first', 2);
      });

      it('should not throw when no callback is provided', async () => {
        await expect(
          callCallbackWithSdkErrorFromPromiseAndReturnPromise(() => Promise.resolve()),
        ).resolves.toBeUndefined();
        await expect(callCallbackWithSdkErrorFromPromiseAndReturnPromise(() => Promise.reject(error))).rejects.toBe(
          error,
        );
        await flushPromises();
      });
    });

    describe('callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise', () => {
      it('should call the callback with a null error and the result on success', async () => {
        const callback = jest.fn();

        const result = await callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(
          () => Promise.resolve('result'),
          callback,
        );

        await flushPromises();
        expect(result).toBe('result');
        expect(callback).toHaveBeenCalledWith(null, 'result');
      });

      it('should call the callback with the error and a null result on failure', async () => {
        const callback = jest.fn();

        const promise = callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(
          () => Promise.reject(error),
          callback,
        );

        await expect(promise).rejects.toBe(error);
        await flushPromises();
        expect(callback).toHaveBeenCalledWith(error, null);
      });

      it('should forward the additional arguments to the wrapped function', async () => {
        const funcHelper = jest.fn((..._args: unknown[]) => Promise.resolve('result'));

        await callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(funcHelper, undefined, 'first', 2);

        expect(funcHelper).toHaveBeenCalledWith('first', 2);
      });

      it('should not throw when no callback is provided', async () => {
        await expect(
          callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(() => Promise.resolve('result')),
        ).resolves.toBe('result');
        await expect(
          callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(() => Promise.reject(error)),
        ).rejects.toBe(error);
        await flushPromises();
      });
    });
  });
});
