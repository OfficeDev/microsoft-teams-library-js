import { GlobalVars } from '../../src/internal/globalVars';
import {
  isCurrentSDKVersionAtLeast,
  isHostClientMobile,
  processAdditionalValidOrigins,
  throwExceptionIfMobileApiIsNotSupported,
} from '../../src/internal/internalAPIs';
import { HostClientType } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';

describe('internalAPIs', () => {
  const originalHostClientType = GlobalVars.hostClientType;
  const originalClientSupportedSDKVersion = GlobalVars.clientSupportedSDKVersion;
  const originalAdditionalValidOrigins = GlobalVars.additionalValidOrigins;

  afterEach(() => {
    GlobalVars.hostClientType = originalHostClientType;
    GlobalVars.clientSupportedSDKVersion = originalClientSupportedSDKVersion;
    GlobalVars.additionalValidOrigins = originalAdditionalValidOrigins;
  });

  describe('isHostClientMobile', () => {
    const mobileClientTypes = [
      HostClientType.android,
      HostClientType.ios,
      HostClientType.ipados,
      HostClientType.visionOS,
    ];

    it.each(mobileClientTypes)('should return true when hostClientType is %s', (hostClientType) => {
      GlobalVars.hostClientType = hostClientType;
      expect(isHostClientMobile()).toBe(true);
    });

    const nonMobileClientTypes = [
      HostClientType.desktop,
      HostClientType.web,
      HostClientType.macos,
      HostClientType.rigel,
      HostClientType.surfaceHub,
      HostClientType.teamsRoomsWindows,
      HostClientType.teamsRoomsAndroid,
      HostClientType.teamsPhones,
      HostClientType.teamsDisplays,
    ];

    it.each(nonMobileClientTypes)('should return false when hostClientType is %s', (hostClientType) => {
      GlobalVars.hostClientType = hostClientType;
      expect(isHostClientMobile()).toBe(false);
    });

    it('should return false when hostClientType is undefined', () => {
      GlobalVars.hostClientType = undefined;
      expect(isHostClientMobile()).toBe(false);
    });
  });

  describe('isCurrentSDKVersionAtLeast', () => {
    it('should return true when the client supported version is greater than the required version', () => {
      GlobalVars.clientSupportedSDKVersion = '2.1.0';
      expect(isCurrentSDKVersionAtLeast('2.0.1')).toBe(true);
    });

    it('should return true when the client supported version equals the required version', () => {
      GlobalVars.clientSupportedSDKVersion = '2.0.1';
      expect(isCurrentSDKVersionAtLeast('2.0.1')).toBe(true);
    });

    it('should return false when the client supported version is lower than the required version', () => {
      GlobalVars.clientSupportedSDKVersion = '1.9.0';
      expect(isCurrentSDKVersionAtLeast('2.0.1')).toBe(false);
    });

    it('should compare against the default version when no required version is passed', () => {
      GlobalVars.clientSupportedSDKVersion = '2.0.1';
      expect(isCurrentSDKVersionAtLeast()).toBe(true);

      GlobalVars.clientSupportedSDKVersion = '2.0.0';
      expect(isCurrentSDKVersionAtLeast()).toBe(false);
    });

    it('should return false when the client supported version is malformed', () => {
      GlobalVars.clientSupportedSDKVersion = '1.2a';
      expect(isCurrentSDKVersionAtLeast('1.2')).toBe(false);
    });

    it('should return false when the required version is malformed', () => {
      GlobalVars.clientSupportedSDKVersion = '2.0.1';
      expect(isCurrentSDKVersionAtLeast('not-a-version')).toBe(false);
    });

    it('should return false when the client supported version is not set', () => {
      GlobalVars.clientSupportedSDKVersion = undefined as unknown as string;
      expect(isCurrentSDKVersionAtLeast('2.0.1')).toBe(false);
    });
  });

  describe('throwExceptionIfMobileApiIsNotSupported', () => {
    it('should throw NOT_SUPPORTED_ON_PLATFORM when the host client is not mobile', () => {
      GlobalVars.hostClientType = HostClientType.desktop;
      GlobalVars.clientSupportedSDKVersion = '2.0.1';

      expect(() => throwExceptionIfMobileApiIsNotSupported('2.0.1')).toThrowError(
        expect.objectContaining<SdkError>({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }),
      );
    });

    it('should throw NOT_SUPPORTED_ON_PLATFORM when the host client type is undefined', () => {
      GlobalVars.hostClientType = undefined;
      GlobalVars.clientSupportedSDKVersion = '2.0.1';

      expect(() => throwExceptionIfMobileApiIsNotSupported()).toThrowError(
        expect.objectContaining<SdkError>({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }),
      );
    });

    it('should throw OLD_PLATFORM when the host client is mobile but the version is too low', () => {
      GlobalVars.hostClientType = HostClientType.ipados;
      GlobalVars.clientSupportedSDKVersion = '1.9.0';

      expect(() => throwExceptionIfMobileApiIsNotSupported('2.0.1')).toThrowError(
        expect.objectContaining<SdkError>({ errorCode: ErrorCode.OLD_PLATFORM }),
      );
    });

    it('should not throw when the host client is mobile and the version is high enough', () => {
      GlobalVars.hostClientType = HostClientType.visionOS;
      GlobalVars.clientSupportedSDKVersion = '2.1.0';

      expect(() => throwExceptionIfMobileApiIsNotSupported('2.0.1')).not.toThrow();
    });
  });

  describe('processAdditionalValidOrigins', () => {
    beforeEach(() => {
      GlobalVars.additionalValidOrigins = [];
    });

    it('should keep valid origins in the order they were supplied', () => {
      processAdditionalValidOrigins(['https://*.example.com', 'http://localhost:4000', 'msteams://teams.contoso.com']);

      expect(GlobalVars.additionalValidOrigins).toEqual([
        'https://*.example.com',
        'http://localhost:4000',
        'msteams://teams.contoso.com',
      ]);
    });

    it('should preserve the existing origin values when passed an empty array', () => {
      GlobalVars.additionalValidOrigins = ['https://existing.example.com'];

      processAdditionalValidOrigins([]);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://existing.example.com']);
    });

    it('should filter out entries that are not strings', () => {
      const originsWithNonStrings = [
        'https://valid.example.com',
        null,
        undefined,
        42,
        true,
        { origin: 'https://object.example.com' },
        ['https://array.example.com'],
      ] as unknown as string[];

      processAdditionalValidOrigins(originsWithNonStrings);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://valid.example.com']);
    });

    it('should filter out origins that are not valid patterns', () => {
      processAdditionalValidOrigins([
        'https://valid.example.com',
        'example.com',
        '',
        '://missing-protocol.example.com',
        '1https://leading-digit.example.com',
        'not a url at all',
      ]);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://valid.example.com']);
    });

    it('should de-duplicate repeated origins within a single call', () => {
      processAdditionalValidOrigins([
        'https://first.example.com',
        'https://second.example.com',
        'https://first.example.com',
        'https://first.example.com',
      ]);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://first.example.com', 'https://second.example.com']);
    });

    it('should accumulate origins across repeated calls', () => {
      processAdditionalValidOrigins(['https://first.example.com']);
      processAdditionalValidOrigins(['https://second.example.com']);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://first.example.com', 'https://second.example.com']);
    });

    it('should not re-add an origin that was already stored by an earlier call', () => {
      processAdditionalValidOrigins(['https://first.example.com', 'https://second.example.com']);
      processAdditionalValidOrigins(['https://second.example.com', 'https://third.example.com']);

      expect(GlobalVars.additionalValidOrigins).toEqual([
        'https://first.example.com',
        'https://second.example.com',
        'https://third.example.com',
      ]);
    });

    it('should treat origins that differ only by case as distinct', () => {
      processAdditionalValidOrigins(['https://example.com', 'https://EXAMPLE.com']);

      expect(GlobalVars.additionalValidOrigins).toEqual(['https://example.com', 'https://EXAMPLE.com']);
    });

    it('should not mutate the array passed in by the caller', () => {
      const suppliedOrigins = ['https://valid.example.com', 'example.com'];

      processAdditionalValidOrigins(suppliedOrigins);

      expect(suppliedOrigins).toEqual(['https://valid.example.com', 'example.com']);
    });

    it('should replace the additionalValidOrigins array rather than mutating the previous one', () => {
      const previousOrigins = ['https://first.example.com'];
      GlobalVars.additionalValidOrigins = previousOrigins;

      processAdditionalValidOrigins(['https://second.example.com']);

      expect(GlobalVars.additionalValidOrigins).not.toBe(previousOrigins);
      expect(previousOrigins).toEqual(['https://first.example.com']);
    });
  });
});
