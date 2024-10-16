import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { copilot } from '../../src/private/copilot';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Cohort, EduType, LegalAgeGroupClassification, Persona } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

const mockedAppEligibilityInformation = {
  cohort: Cohort.BCAIS,
  ageGroup: LegalAgeGroupClassification.Adult,
  isCopilotEnabledRegion: true,
  isCopilotEligible: true,
  isOptedOutByAdmin: false,
  userClassification: {
    persona: Persona.Student,
    eduType: EduType.HigherEducation,
  },
};

const mockedAppEligibilityInformationUserClassificationNull = {
  cohort: Cohort.BCAIS,
  ageGroup: LegalAgeGroupClassification.Adult,
  isCopilotEnabledRegion: true,
  isCopilotEligible: true,
  isOptedOutByAdmin: false,
  userClassification: null,
};

const copilotInHostVersionsInfoRuntimeConfig: Runtime = {
  apiVersion: 4,
  hostVersionsInfo: {
    appEligibilityInformation: mockedAppEligibilityInformation,
  },
  supports: {
    pages: {
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    teamsCore: {},
    logs: {},
  },
};

const copilotRuntimeConfig: Runtime = {
  apiVersion: 4,
  supports: {
    copilot: {
      eligibility: {},
    },
    pages: {
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    teamsCore: {},
    logs: {},
  },
};

const copilotRuntimeConfigWithUserClassificationNull: Runtime = {
  apiVersion: 4,
  hostVersionsInfo: {
    appEligibilityInformation: mockedAppEligibilityInformationUserClassificationNull,
  },
  supports: {
    pages: {
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    teamsCore: {},
    logs: {},
  },
};

describe('copilot', () => {
  let utils: Utils;
  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(copilotInHostVersionsInfoRuntimeConfig);
      app._uninitialize();
    }
  });

  describe('copilot.eligibility', () => {
    describe('isSupported', () => {
      it('isSupported should throw if called before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => copilot.eligibility.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('isSupported should return false if eligibility is not on the runtimeConfig and copilot is not supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        expect(copilot.eligibility.isSupported()).toBeFalsy();
      });

      it('isSupported should return false if eligibility is not on the runtimeConfig and copilot.eligibility is not supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        const minRuntimeConfigWithCopilot = {
          ..._minRuntimeConfigToUninitialize,
          supports: {
            ..._minRuntimeConfigToUninitialize.supports,
            copilot: {},
          },
        };
        utils.setRuntimeConfig(minRuntimeConfigWithCopilot);
        expect(copilot.eligibility.isSupported()).toBeFalsy();
      });

      it('isSupported should return true if eligibility information is on the runtimeConfig', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotInHostVersionsInfoRuntimeConfig);
        expect(copilot.eligibility.isSupported()).toBeTruthy();
      });

      it('isSupported should return true if copilot.eligibility is supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);
        expect(copilot.eligibility.isSupported()).toBeTruthy();
      });
    });

    describe('getEligibilityInfo', () => {
      it('getEligibilityInfo should throw if called before initialization', async () => {
        expect.assertions(1);
        utils.uninitializeRuntimeConfig();
        await expect(copilot.eligibility.getEligibilityInfo()).rejects.toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });
      it('should return EligibilityInfo if the host provided eligibility information', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotInHostVersionsInfoRuntimeConfig);
        expect(copilot.eligibility.isSupported()).toBeTruthy();
        expect(await copilot.eligibility.getEligibilityInfo()).toBe(mockedAppEligibilityInformation);
      });
      it('should throw if the value is not set by the host or missing ', async () => {
        expect.assertions(2);
        await utils.initializeWithContext(FrameContexts.content);
        const copilotRuntimeConfigWithoutEligibilityInformation = {
          ...copilotInHostVersionsInfoRuntimeConfig,
          hostVersionsInfo: undefined,
        };
        utils.setRuntimeConfig(copilotRuntimeConfigWithoutEligibilityInformation);
        expect(copilot.eligibility.isSupported()).toBeFalsy();
        await expect(copilot.eligibility.getEligibilityInfo()).rejects.toThrowError(
          new Error(`Error code: ${errorNotSupportedOnPlatform.errorCode}, message: Not supported on platform`),
        );
      });
      it('should return null userClassification if the host provided eligibility information with userClassification as null', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfigWithUserClassificationNull);
        expect(copilot.eligibility.isSupported()).toBeTruthy();
        expect(await copilot.eligibility.getEligibilityInfo()).toBe(
          mockedAppEligibilityInformationUserClassificationNull,
        );
      });
      it('getEligibilityInfo should return a valid response on success with context', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedAppEligibilityInformation);
        }

        return expect(promise).resolves.toEqual(mockedAppEligibilityInformation);
      });
    });

    describe('isEligibilityInfoValid', () => {
      it('getEligibilityInfo should throw if AppEligibilityInformation.ageGroup is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          ageGroup: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.cohort is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          cohort: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.isCopilotEnabledRegion is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          isCopilotEnabledRegion: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.isCopilotEligible is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          isCopilotEligible: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.isOptedOutByAdmin is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          isOptedOutByAdmin: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.userClassification is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformation = {
          ...mockedAppEligibilityInformation,
          userClassification: undefined,
        };
        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformation);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });
    });
  });
});
