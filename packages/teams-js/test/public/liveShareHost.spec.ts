import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app } from '../../src/public/app';
import {
  ContainerState,
  IClientInfo,
  IFluidContainerInfo,
  IFluidTenantInfo,
  INtpTimeInfo,
  isSupported,
  LiveShareHost,
  UserMeetingRole,
} from '../../src/public/liveShareHost';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('LiveShareHost', () => {
  const utils = new Utils();
  let host: LiveShareHost;

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('create', () => {
    it('should not allow calls before initialization', async () => {
      const result = new Promise((resolve) => resolve(LiveShareHost.create()));
      await expect(result).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      const result = new Promise((resolve) => resolve(LiveShareHost.create()));
      await expect(result).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should create host instance', async () => {
      await utils.initializeWithContext('meetingStage');
      host = LiveShareHost.create();
      expect(host).not.toBeNull();
    });
  });

  describe('getFluidTenantInfo', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getFluidTenantInfo();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getFluidTenantInfo();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockTenantInfo: IFluidTenantInfo = {
        tenantId: 'test-tenant',
        serviceEndpoint: 'https://test.azure.com',
      };

      const promise = host.getFluidTenantInfo();

      const getFluidTenantInfoMessage = utils.findMessageByFunc('interactive.getFluidTenantInfo');
      expect(getFluidTenantInfoMessage).not.toBeNull();
      utils.respondToMessage(getFluidTenantInfoMessage, false, mockTenantInfo);
      await expect(promise).resolves.toEqual(mockTenantInfo);
    });
  });

  describe('getFluidToken', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getFluidToken('test-container');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getFluidToken('test-container');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockToken = 'test-token-value';
      const promise = host.getFluidToken('test-container');

      const getFluidTokenMessage = utils.findMessageByFunc('interactive.getFluidToken');
      expect(getFluidTokenMessage).not.toBeNull();
      expect(getFluidTokenMessage.args).toStrictEqual(['test-container']);
      utils.respondToMessage(getFluidTokenMessage, false, mockToken);
      await expect(promise).resolves.toStrictEqual(mockToken);
    });
  });

  describe('getFluidContainerId', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getFluidContainerId();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getFluidContainerId();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockContainerInfo: IFluidContainerInfo = {
        containerState: ContainerState.notFound,
        containerId: undefined,
        shouldCreate: false,
        retryAfter: 500,
      };

      const promise = host.getFluidContainerId();

      const getFluidContainerIdMessage = utils.findMessageByFunc('interactive.getFluidContainerId');
      expect(getFluidContainerIdMessage).not.toBeNull();
      utils.respondToMessage(getFluidContainerIdMessage, false, mockContainerInfo);
      await expect(promise).resolves.toEqual(mockContainerInfo);
    });
  });

  describe('setFluidContainerId', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.setFluidContainerId('test-container');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.setFluidContainerId('test-container');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockContainerInfo: IFluidContainerInfo = {
        containerState: ContainerState.added,
        containerId: '1234',
        shouldCreate: false,
        retryAfter: 0,
      };

      const promise = host.setFluidContainerId('test-container');

      const setFluidContainerIdMessage = utils.findMessageByFunc('interactive.setFluidContainerId');
      expect(setFluidContainerIdMessage).not.toBeNull();
      expect(setFluidContainerIdMessage.args).toStrictEqual(['test-container']);
      utils.respondToMessage(setFluidContainerIdMessage, false, mockContainerInfo);
      await expect(promise).resolves.toStrictEqual(mockContainerInfo);
    });
  });

  describe('getNtpTime', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getNtpTime();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getNtpTime();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockNtpTime: INtpTimeInfo = {
        ntpTime: 'some-time',
        ntpTimeInUTC: 12345,
      };

      const promise = host.getNtpTime();

      const getNtpTimeMessage = utils.findMessageByFunc('interactive.getNtpTime');
      expect(getNtpTimeMessage).not.toBeNull();
      utils.respondToMessage(getNtpTimeMessage, false, mockNtpTime);
      await expect(promise).resolves.toEqual(mockNtpTime);
    });
  });

  describe('registerClientId', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.registerClientId('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.registerClientId('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const userRoles = [UserMeetingRole.presenter];
      const promise = host.registerClientId('test-client');

      const registerClientIdMessage = utils.findMessageByFunc('interactive.registerClientId');
      expect(registerClientIdMessage).not.toBeNull();
      expect(registerClientIdMessage.args).toStrictEqual(['test-client']);
      utils.respondToMessage(registerClientIdMessage, false, userRoles);
      await expect(promise).resolves.toStrictEqual(userRoles);
    });
  });

  describe('getClientRoles', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getClientRoles('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getClientRoles('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const userRoles = [UserMeetingRole.presenter];
      const promise = host.getClientRoles('test-client');

      const getClientRolesMessage = utils.findMessageByFunc('interactive.getClientRoles');
      expect(getClientRolesMessage).not.toBeNull();
      expect(getClientRolesMessage.args).toStrictEqual(['test-client']);
      utils.respondToMessage(getClientRolesMessage, false, userRoles);
      await expect(promise).resolves.toStrictEqual(userRoles);
    });
  });

  describe('getClientInfo', () => {
    it('should not allow calls before initialization', async () => {
      try {
        host.getClientInfo('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(errorLibraryNotInitialized);
      }
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      try {
        host.getClientInfo('test-client');
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe(
          'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
        );
      }
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const userInfo: IClientInfo = {
        userId: 'test userId',
        roles: [UserMeetingRole.presenter],
        displayName: 'test name',
      };
      const promise = host.getClientInfo('test-client');

      const getClientInfoMessage = utils.findMessageByFunc('interactive.getClientInfo');
      expect(getClientInfoMessage).not.toBeNull();
      expect(getClientInfoMessage.args).toStrictEqual(['test-client']);
      utils.respondToMessage(getClientInfoMessage, false, userInfo);
      await expect(promise).resolves.toStrictEqual(userInfo);
    });
  });

  describe('Testing isSupported', () => {
    it('should not be supported before initialization', () => {
      setUnitializedRuntime();
      expect(() => isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });
});
