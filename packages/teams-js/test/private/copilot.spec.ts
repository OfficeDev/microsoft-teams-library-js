import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { copilot } from '../../src/private/copilot';
import * as app from '../../src/public/app';
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

const copilotRuntimeConfig: Runtime = {
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
      utils.setRuntimeConfig(copilotRuntimeConfig);
      app._uninitialize();
    }
  });

  describe('eligibility', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => copilot.eligibility.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      expect(() => copilot.eligibility.getEligibilityInfo()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return EligibilityInfo if the host provided eligibility information', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(copilotRuntimeConfig);
      expect(copilot.eligibility.isSupported()).toBeTruthy();
      expect(copilot.eligibility.getEligibilityInfo()).toBe(mockedAppEligibilityInformation);
    });
    it('should throw if the value is not set by the host or missing ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const copilotRuntimeConfigWithoutEligibilityInformation = {
        ...copilotRuntimeConfig,
        hostVersionsInfo: undefined,
      };
      utils.setRuntimeConfig(copilotRuntimeConfigWithoutEligibilityInformation);
      expect(copilot.eligibility.isSupported()).toBeFalsy();
      expect(() => copilot.eligibility.getEligibilityInfo()).toThrowError(
        expect.objectContaining(errorNotSupportedOnPlatform),
      );
    });
    it('should return null userClassification if the host provided eligibility information with userClassification as null', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(copilotRuntimeConfigWithUserClassificationNull);
      expect(copilot.eligibility.isSupported()).toBeTruthy();
      expect(copilot.eligibility.getEligibilityInfo()).toBe(mockedAppEligibilityInformationUserClassificationNull);
    });
  });
});
