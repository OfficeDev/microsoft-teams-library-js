import { GlobalVars } from '../../src/internal/globalVars';
import {
  isCurrentSDKVersionAtLeast,
  isHostClientMobile,
  throwExceptionIfMobileApiIsNotSupported,
} from '../../src/internal/internalAPIs';
import { HostClientType } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';

describe('internalAPIs', () => {
  const originalHostClientType = GlobalVars.hostClientType;
  const originalClientSupportedSDKVersion = GlobalVars.clientSupportedSDKVersion;

  afterEach(() => {
    GlobalVars.hostClientType = originalHostClientType;
    GlobalVars.clientSupportedSDKVersion = originalClientSupportedSDKVersion;
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
});
