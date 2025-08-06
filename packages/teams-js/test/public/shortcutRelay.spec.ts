import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { ApiName } from '../../src/internal/telemetry';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { latestRuntimeApiVersion } from '../../src/public/runtime';
import * as shortcutRelay from '../../src/public/shortcutRelay';
import { Utils } from '../utils';

describe('shortcutRelay capability', () => {
  describe('frameless', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
      jest.resetModules();
      shortcutRelay.resetIsShortcutRelayCapabilityEnabled();
    });

    describe('isSupported()', () => {
      it('returns false when runtime says it is not supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(shortcutRelay.isSupported()).toBeFalsy();
      });

      it('returns true when runtime says it is supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { shortcutRelay: {} } });
        expect(shortcutRelay.isSupported()).toBeTruthy();
      });

      it('throws before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => shortcutRelay.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('enableShortcutRelayCapability()', () => {
      it('should not allow calls before initialization', () => {
        expect(() => shortcutRelay.enableShortcutRelayCapability()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('should throw when capability not supported in runtime', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: {} });
        expect(() => shortcutRelay.enableShortcutRelayCapability()).toThrowError(
          expect.objectContaining(errorNotSupportedOnPlatform),
        );
      });

      it('sends ShortcutRelay_GetHostShortcuts request and adds handler exactly once', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { shortcutRelay: {} } });

        shortcutRelay.enableShortcutRelayCapability();
        const firstMessage = utils.findMessageByFunc(ApiName.ShortcutRelay_GetHostShortcuts);
        expect(firstMessage).not.toBeNull();

        // second call should NOT send another request
        shortcutRelay.enableShortcutRelayCapability();
        const all = utils.messages.filter((m) => m.func === ApiName.ShortcutRelay_GetHostShortcuts);
        expect(all.length).toBe(1);
      });

      it('forwards a matching non-overridden shortcut to host', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { shortcutRelay: {} } });

        shortcutRelay.enableShortcutRelayCapability();

        // simulate host response with shortcuts
        const response = {
          shortcuts: ['ctrl+s'],
          overridableShortcuts: [],
        };
        const request = utils.findMessageByFunc(ApiName.ShortcutRelay_GetHostShortcuts);
        utils.respondToFramelessMessage({
          data: { id: request?.id, args: [response] },
        } as DOMMessageEvent);

        // fire keydown in next animation frame
        await new Promise((resolve) => setTimeout(resolve, 0));
        const evt = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
        document.body.dispatchEvent(evt);

        const fwd = utils.findMessageByFunc(ApiName.ShortcutRelay_ForwardShortcutEvent);
        expect(fwd).not.toBeNull();
      });

      it('gives app chance to consume overridable shortcut', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { shortcutRelay: {} } });

        const handler = jest.fn(() => true); // consume event
        shortcutRelay.setOverridableShortcutHandler(handler);
        shortcutRelay.enableShortcutRelayCapability();

        const response = {
          shortcuts: ['ctrl+p'],
          overridableShortcuts: ['ctrl+p'],
        };
        const request = utils.findMessageByFunc(ApiName.ShortcutRelay_GetHostShortcuts);
        utils.respondToFramelessMessage({
          data: { id: request?.id, args: [response] },
        } as DOMMessageEvent);

        // fire keydown in next animation frame
        await new Promise((resolve) => setTimeout(resolve, 0));
        const evt = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, bubbles: true });
        document.body.dispatchEvent(evt);

        expect(handler).toHaveBeenCalled();
        const fwd = utils.findMessageByFunc(ApiName.ShortcutRelay_ForwardShortcutEvent);
        expect(fwd).toBeNull(); // consumed, so not forwarded
      });
    });

    describe('setOverridableShortcutHandler()', () => {
      it('replaces and returns previous handler', () => {
        const noop = (): boolean => true;
        const prev = shortcutRelay.setOverridableShortcutHandler(noop);
        expect(prev).toBeUndefined();

        const next = (): boolean => false;
        const old = shortcutRelay.setOverridableShortcutHandler(next);
        expect(old).toBe(noop);
      });
    });
  });
});
