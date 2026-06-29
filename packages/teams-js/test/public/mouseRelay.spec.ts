import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ApiName } from '../../src/internal/telemetry';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import * as mouseRelay from '../../src/public/mouseRelay';
import { latestRuntimeApiVersion } from '../../src/public/runtime';
import { Utils } from '../utils';

const BACK_BUTTON = 3; // X1
const FORWARD_BUTTON = 4; // X2

describe('mouseRelay capability', () => {
  describe('frameless', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize?.();
    });

    describe('isSupported()', () => {
      it('returns false when runtime says it is not supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(mouseRelay.isSupported()).toBeFalsy();
      });

      it('returns true when runtime says it is supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { mouseRelay: {} } });
        expect(mouseRelay.isSupported()).toBeTruthy();
      });

      it('throws before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => mouseRelay.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('enableMouseRelayCapability()', () => {
      it('should reject before initialization', async () => {
        await expect(mouseRelay.enableMouseRelayCapability()).rejects.toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      it('should reject when capability not supported in runtime', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: {} });

        await expect(mouseRelay.enableMouseRelayCapability()).rejects.toEqual(errorNotSupportedOnPlatform);
      });

      it('forwards { direction: back } to host on the back (X1) button mouseup', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { mouseRelay: {} } });

        await mouseRelay.enableMouseRelayCapability();

        document.body.dispatchEvent(
          new MouseEvent('mouseup', { button: BACK_BUTTON, bubbles: true, cancelable: true }),
        );

        const fwd = utils.findMessageByFunc(ApiName.MouseRelay_NavigateHistory);
        expect(fwd).not.toBeNull();
        expect(fwd?.args?.[0]).toEqual({ direction: 'back' });
      });

      it('forwards { direction: forward } to host on the forward (X2) button mouseup', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { mouseRelay: {} } });

        await mouseRelay.enableMouseRelayCapability();

        document.body.dispatchEvent(
          new MouseEvent('mouseup', { button: FORWARD_BUTTON, bubbles: true, cancelable: true }),
        );

        const fwd = utils.findMessageByFunc(ApiName.MouseRelay_NavigateHistory);
        expect(fwd?.args?.[0]).toEqual({ direction: 'forward' });
      });

      it('suppresses native nav on mousedown but forwards only on release (mouseup)', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { mouseRelay: {} } });

        await mouseRelay.enableMouseRelayCapability();

        const down = new MouseEvent('mousedown', { button: BACK_BUTTON, bubbles: true, cancelable: true });
        document.body.dispatchEvent(down);

        expect(down.defaultPrevented).toBe(true); // suppressed early
        expect(utils.findMessageByFunc(ApiName.MouseRelay_NavigateHistory)).toBeNull(); // not yet
      });

      it('ignores non-navigation mouse buttons', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { mouseRelay: {} } });

        await mouseRelay.enableMouseRelayCapability();

        const evt = new MouseEvent('mouseup', { button: 0, bubbles: true, cancelable: true });
        document.body.dispatchEvent(evt);

        expect(utils.findMessageByFunc(ApiName.MouseRelay_NavigateHistory)).toBeNull();
        expect(evt.defaultPrevented).toBe(false);
      });
    });

    describe('resetIsMouseRelayCapabilityEnabled()', () => {
      it('detaches the listeners so events stop forwarding', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { mouseRelay: {} } });

        await mouseRelay.enableMouseRelayCapability();
        mouseRelay.resetIsMouseRelayCapabilityEnabled();
        utils.messages = [];

        document.body.dispatchEvent(
          new MouseEvent('mouseup', { button: BACK_BUTTON, bubbles: true, cancelable: true }),
        );

        expect(utils.findMessageByFunc(ApiName.MouseRelay_NavigateHistory)).toBeNull();
      });
    });
  });
});
