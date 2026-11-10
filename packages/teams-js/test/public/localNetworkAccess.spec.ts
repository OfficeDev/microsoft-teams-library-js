import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../src/internal/telemetry';
import { localNetworkAccess } from '../../src/public';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { DevicePermission, ErrorCode } from '../../src/public/interfaces';
import { Utils } from '../utils';

describe('localNetworkAccess', () => {
  const allowedContexts = [FrameContexts.content, FrameContexts.task];
  let utils: Utils;

  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    app._uninitialize();
  });

  describe('isSupported', () => {
    it('should not allow calls before initialization', () => {
      expect(() => localNetworkAccess.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return false when only the general permissions capability is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { permissions: {} } });

      expect(localNetworkAccess.isSupported()).toBe(false);
    });

    it('should return true when the localNetworkAccess permissions capability is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({
        apiVersion: 4,
        supports: { permissions: { localNetworkAccess: {} } },
      });

      expect(localNetworkAccess.isSupported()).toBe(true);
    });
  });

  describe.each([
    {
      apiName: 'hasPermission',
      actionName: 'permissions.has',
      telemetryName: ApiName.LocalNetworkAccess_HasPermission,
      call: () => localNetworkAccess.hasPermission(),
    },
    {
      apiName: 'requestPermission',
      actionName: 'permissions.request',
      telemetryName: ApiName.LocalNetworkAccess_RequestPermission,
      call: () => localNetworkAccess.requestPermission(),
    },
  ])('$apiName', ({ actionName, telemetryName, call }) => {
    it('should not allow calls before initialization', () => {
      expect(call).toThrowError(new Error(errorLibraryNotInitialized));
    });

    allowedContexts.forEach((context) => {
      it(`should throw when localNetworkAccess is unsupported in context ${context}`, async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 4, supports: { permissions: {} } });

        expect.assertions(1);
        try {
          call();
        } catch (error) {
          expect(error).toEqual(errorNotSupportedOnPlatform);
        }
      });
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.includes(context)) {
        it(`should not allow calls from context ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 4,
            supports: { permissions: { localNetworkAccess: {} } },
          });

          expect(call).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
    });

    it.each([true, false])(`should send ${actionName} with the exact wire value and resolve to %s`, async (result) => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({
        apiVersion: 4,
        supports: { permissions: { localNetworkAccess: {} } },
      });

      const promise = call();
      const message = utils.findMessageByFunc(actionName);

      expect(message).not.toBeNull();
      expect(message!.args).toEqual([DevicePermission.LocalNetworkAccess]);
      expect(message!.args).not.toContain('local-network-access');
      expect(message!.apiVersionTag).toBe(getApiVersionTag(ApiVersionNumber.V_2, telemetryName));

      await utils.respondToMessage(message!, undefined, result);
      await expect(promise).resolves.toBe(result);
    });

    it('should reject when the host returns an error', async () => {
      await utils.initializeWithContext(FrameContexts.task);
      utils.setRuntimeConfig({
        apiVersion: 4,
        supports: { permissions: { localNetworkAccess: {} } },
      });
      const hostError = { errorCode: ErrorCode.INTERNAL_ERROR };

      const promise = call();
      const message = utils.findMessageByFunc(actionName);

      expect(message).not.toBeNull();
      await utils.respondToMessage(message!, hostError);
      await expect(promise).rejects.toEqual(hostError);
    });
  });
});
