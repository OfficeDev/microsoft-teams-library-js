import {
  base64ToBlob,
  compareSDKVersions,
  createTeamsAppLink,
  getBase64StringFromBlob,
  hasScriptTags,
  validateId,
  validateUrl,
  validateUuid,
} from '../../src/internal/utils';
import { UUID } from '../../src/internal/uuidObject';
import { AppId, pages } from '../../src/public';
import { ClipboardSupportedMimeType } from '../../src/public/interfaces';

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
    it('should throw maxlength exceed error if it contains more than 2048 chars', async () => {
      expect.assertions(1);
      const url = 'https://example.com?param=' + 'a'.repeat(2048);
      try {
        validateUrl(new URL(url));
      } catch (error) {
        expect(error).toEqual(new Error('Url exceeds the maximum size of 2048 characters'));
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
});
