import { interactive } from '../../src/private/interactive';
import { ViewerActionTypes } from '../../src/private/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { FileOpenPreference } from '../../src/public/interfaces';
import { Utils } from '../utils';

describe('interactive', () => {
  const utils = new Utils();
  const emptyCallback = () => {};

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

  describe('getFluidTenantInfo', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.getFluidTenantInfo()).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.getFluidTenantInfo()).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockTenantInfo: interactive.FluidTenantInfo = {
        tenantId: 'test-tenant',
        ordererEndpoint: 'https://test.azure.com',
        storageEndpoint: 'https://test.azure.com'
      };

      const promise = interactive.getFluidTenantInfo();

      const getFluidTenantInfoMessage = utils.findMessageByFunc('interactive.getFluidTenantInfo');
      expect(getFluidTenantInfoMessage).not.toBeNull();
      utils.respondToMessage(getFluidTenantInfoMessage, false, mockTenantInfo);
      await expect(promise).resolves.toEqual(mockTenantInfo);
    });
  });

  describe('getFluidToken', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.getFluidToken('test-container')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.getFluidToken('test-container')).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockToken = 'test-token-value';
      const promise = interactive.getFluidToken('test-container');

      const getFluidTokenMessage = utils.findMessageByFunc('interactive.getFluidToken');
      expect(getFluidTokenMessage).not.toBeNull();
      expect(getFluidTokenMessage.args).toStrictEqual(['test-container'])
      utils.respondToMessage(getFluidTokenMessage, false, mockToken);
      await expect(promise).resolves.toStrictEqual(mockToken);
    });
  });

  describe('getFluidContainerId', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.getFluidContainerId()).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.getFluidContainerId()).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockContainerInfo: interactive.FluidContainerInfo = {
        containerState: interactive.ContainerState.notFound,
        containerId: undefined,
        shouldCreate: false,
        retryAfter: 500
      };

      const promise = interactive.getFluidContainerId();

      const getFluidContainerIdMessage = utils.findMessageByFunc('interactive.getFluidContainerId');
      expect(getFluidContainerIdMessage).not.toBeNull();
      utils.respondToMessage(getFluidContainerIdMessage, false, mockContainerInfo);
      await expect(promise).resolves.toEqual(mockContainerInfo);
    });
  });

  describe('setFluidContainerId', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.setFluidContainerId('test-container')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.setFluidContainerId('test-container')).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const created = true;
      const promise = interactive.setFluidContainerId('test-container');

      const setFluidContainerIdMessage = utils.findMessageByFunc('interactive.setFluidContainerId');
      expect(setFluidContainerIdMessage).not.toBeNull();
      expect(setFluidContainerIdMessage.args).toStrictEqual(['test-container'])
      utils.respondToMessage(setFluidContainerIdMessage, false, created);
      await expect(promise).resolves.toStrictEqual(created);
    });
  });

  describe('getNtpTime', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.getNtpTime()).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.getNtpTime()).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const mockNtpTime: interactive.NtpTimeInfo = {
        ntpTime: 'some-time',
        ntpTimeInUTC: 12345
      };

      const promise = interactive.getNtpTime();

      const getNtpTimeMessage = utils.findMessageByFunc('interactive.getNtpTime');
      expect(getNtpTimeMessage).not.toBeNull();
      utils.respondToMessage(getNtpTimeMessage, false, mockNtpTime);
      await expect(promise).resolves.toEqual(mockNtpTime);
    });
  });

  describe('registerClientId', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.registerClientId('test-client')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.registerClientId('test-client')).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const userRoles = [interactive.UserMeetingRole.presenter];
      const promise = interactive.registerClientId('test-client');

      const registerClientIdMessage = utils.findMessageByFunc('interactive.registerClientId');
      expect(registerClientIdMessage).not.toBeNull();
      expect(registerClientIdMessage.args).toStrictEqual(['test-client'])
      utils.respondToMessage(registerClientIdMessage, false, userRoles);
      await expect(promise).resolves.toStrictEqual(userRoles);
    });
  });

  describe('getClientRoles', () => {
    it('should not allow calls before initialization', async () => {
      await expect(interactive.getClientRoles('test-client')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      await expect(interactive.getClientRoles('test-client')).rejects.toThrowError(
        'This call is only allowed in following contexts: ["meetingStage","sidePanel"]. Current context: "settings".',
      );
    });

    it('should resolve promise correctly', async () => {
      await utils.initializeWithContext('meetingStage');
      const userRoles = [interactive.UserMeetingRole.presenter];
      const promise = interactive.getClientRoles('test-client');

      const getClientRolesMessage = utils.findMessageByFunc('interactive.getClientRoles');
      expect(getClientRolesMessage).not.toBeNull();
      expect(getClientRolesMessage.args).toStrictEqual(['test-client'])
      utils.respondToMessage(getClientRolesMessage, false, userRoles);
      await expect(promise).resolves.toStrictEqual(userRoles);
    });
  });
});
