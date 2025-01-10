import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName } from '../../src/internal/telemetry';
import * as copilot from '../../src/private/copilot/copilot';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Cohort, EduType, ErrorCode, LegalAgeGroupClassification, Persona } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { UUID } from '../../src/public/uuidObject';
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
  featureSet: { serverFeatures: ['feature1', 'feature2'], uxFeatures: ['feature3'] },
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
      customTelemetry: {},
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

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should return EligibilityInfo if the host provided eligibility information - with context ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig(copilotInHostVersionsInfoRuntimeConfig);
          expect(copilot.eligibility.isSupported()).toBeTruthy();
          expect(await copilot.eligibility.getEligibilityInfo()).toBe(mockedAppEligibilityInformation);
        });

        it(`should throw if the value is not set by the host or missing - with context ${frameContext}`, async () => {
          expect.assertions(2);
          await utils.initializeWithContext(frameContext);
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

        it(`should return null userClassification if the host provided eligibility information with userClassification as null - with context ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig(copilotRuntimeConfigWithUserClassificationNull);
          expect(copilot.eligibility.isSupported()).toBeTruthy();
          expect(await copilot.eligibility.getEligibilityInfo()).toBe(
            mockedAppEligibilityInformationUserClassificationNull,
          );
        });

        it(`should return a valid response on success - with context ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig(copilotRuntimeConfig);

          const promise = copilot.eligibility.getEligibilityInfo();
          const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
          expect(message).not.toBeNull();
          if (message) {
            utils.respondToMessage(message, mockedAppEligibilityInformation);
          }

          return expect(promise).resolves.toEqual(mockedAppEligibilityInformation);
        });

        it(`should not throw if featureSet in response is undefined - with context ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig(copilotRuntimeConfig);

          const promise = copilot.eligibility.getEligibilityInfo();
          const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
          const mockedAppEligibilityInformationWithUndefinedFeatureSet = {
            ...mockedAppEligibilityInformation,
            featureSet: undefined,
          };
          expect(message).not.toBeNull();
          if (message) {
            utils.respondToMessage(message, mockedAppEligibilityInformationWithUndefinedFeatureSet);
          }

          return expect(promise).resolves.toEqual(mockedAppEligibilityInformationWithUndefinedFeatureSet);
        });

        it(`should throw error if host returns error - with context ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig(copilotRuntimeConfig);

          const sdkError = {
            errorCode: ErrorCode.INTERNAL_ERROR,
            message: 'An error occurred',
          };

          const promise = copilot.eligibility.getEligibilityInfo();
          const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
          expect(message).not.toBeNull();
          if (message) {
            utils.respondToMessage(message, sdkError);
          }

          await expect(promise).rejects.toThrowError(
            new Error(`Error code: ${sdkError.errorCode}, message: ${sdkError.message}`),
          );
        });
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

      it('getEligibilityInfo should throw if AppEligibilityInformation.featureSet.serverFeatures is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformationWithInvalidUxFeatures = {
          ...mockedAppEligibilityInformation,
          featureSet: {
            serverFeatures: undefined,
            uxFeatures: [],
          },
        };

        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformationWithInvalidUxFeatures);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });

      it('getEligibilityInfo should throw if AppEligibilityInformation.featureSet.uxFeatures is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig(copilotRuntimeConfig);

        const mockedInvalidAppEligibilityInformationWithInvalidUxFeatures = {
          ...mockedAppEligibilityInformation,
          featureSet: {
            serverFeatures: [],
            uxFeatures: undefined,
          },
        };

        const promise = copilot.eligibility.getEligibilityInfo();
        const message = utils.findMessageByFunc('copilot.eligibility.getEligibilityInfo');
        expect(message).not.toBeNull();
        if (message) {
          utils.respondToMessage(message, mockedInvalidAppEligibilityInformationWithInvalidUxFeatures);
        }

        await expect(promise).rejects.toThrowError('Error deserializing eligibility information');
      });
    });
  });

  describe('copilot.customTelemetry', () => {
    describe('sendCustomTelemetryData', () => {
      it('sendCustomTelemetryData should throw if called before initialization', async () => {
        expect.assertions(1);
        utils.uninitializeRuntimeConfig();
        await expect(copilot.customTelemetry.sendCustomTelemetryData(new UUID())).rejects.toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      it('sendCustomTelemetryData message should not be null', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        await expect(copilot.customTelemetry.sendCustomTelemetryData(new UUID('805a4340-d5e0-4587-8f04-0ae88219699f')));
        const message = utils.findMessageByFunc(ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData);
        expect(message).not.toBeNull();
      });
    });
  });
});
