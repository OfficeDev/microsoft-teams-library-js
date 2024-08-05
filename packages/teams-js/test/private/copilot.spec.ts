import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { copilot } from '../../src/private/copilot';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { EduType, LegalAgeGroupClassification, Persona, UserCohort } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

const mockedAppEligibilityInformation = {
  cohort: UserCohort.MicrosoftCopilot,
  persona: Persona.Student,
  ageGroup: LegalAgeGroupClassification.Adult,
  isCodeEnabledRegion: true,
  isCopilotEligible: true,
  isOptedOutByAdmin: false,
  eduType: EduType.None,
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
    it('should return EligibilityInfo if the app is MChat app', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(copilotRuntimeConfig);
      expect(copilot.eligibility.isSupported()).toBeTruthy();
      expect(copilot.eligibility.getEligibilityInfo()).toBe(mockedAppEligibilityInformation);
    });
    it('should throw if the value is not set by the host or missing ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const copilotRuntimeConfigWithOutEligibilityInformation: Runtime = {
        apiVersion: 4,
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
      utils.setRuntimeConfig(copilotRuntimeConfigWithOutEligibilityInformation);
      expect(copilot.eligibility.isSupported()).toBeFalsy();
      try {
        copilot.eligibility.getEligibilityInfo();
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
  });
});
