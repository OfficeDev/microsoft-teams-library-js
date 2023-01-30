import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, FrameContexts } from '../../src/public';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { settings } from '../../src/public/settings';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('settings', () => {
  // Use to send a mock message from the app.

  const utils = new Utils();
  const emptyCallback = (): void => {
    return;
  };

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  it('should successfully notify success on save when there is no registered handler', async () => {
    await utils.initializeWithContext(FrameContexts.settings);
    utils.sendMessage('settings.save');

    const message = utils.findMessageByFunc('settings.save.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  describe('Testing settings.setValidityState function', () => {
    const allowedContexts = [FrameContexts.settings, FrameContexts.remove];
    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.setValidityState does not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => settings.setValidityState(true)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('settings.setValidityState should successfully set validity state to true', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      settings.setValidityState(true);

      const message = utils.findMessageByFunc('settings.setValidityState');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(true);
    });

    it('settings.setValidityState should successfully set validity state to false', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      settings.setValidityState(false);

      const message = utils.findMessageByFunc('settings.setValidityState');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(false);
    });
  });

  describe('Testing settings.getSettings function', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.sidePanel,
    ];
    const expectedSettings: settings.Settings = {
      suggestedDisplayName: 'someSuggestedDisplayName',
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
      entityId: 'someEntityId',
    };

    it('settings.getSettings should not allow calls before initialization', () => {
      expect(() => {
        settings.getSettings((settings) => {
          expect(settings).toBe(expectedSettings);
        });
      }).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.getSettings does not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => settings.getSettings(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      } else {
        it(`settings.getSettings should successfully get settings from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          settings.getSettings((settings) => {
            expect(settings).toBe(expectedSettings);
          });

          const message = utils.findMessageByFunc('settings.getSettings');
          expect(message).not.toBeNull();

          utils.respondToMessage(message, expectedSettings);
        });
      }
    });
  });

  describe('Testing settings.setSettings function', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel];
    const settingsObj: settings.Settings = {
      suggestedDisplayName: 'someSuggestedDisplayName',
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
      entityId: 'someEntityId',
    };

    it('settings.setSettings should not allow calls before initialization', () => {
      expect(() => {
        settings.setSettings(settingsObj);
      }).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.setSettings does not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => {
            settings.setSettings(settingsObj);
          }).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      } else {
        it(`settings.setSettings should successfully set settings from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          settings.setSettings(settingsObj);
          const message = utils.findMessageByFunc('settings.setSettings');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe(settingsObj);
        });
      }
    });
  });

  describe('Testing settings.registerOnSaveHandler function', () => {
    const allowedContexts = [FrameContexts.settings];

    it('settings.registerOnSaveHandler should not allow calls before initialization', () => {
      expect(() => {
        let handlerCalled = false;
        settings.registerOnSaveHandler(() => {
          handlerCalled = true;
        });
      }).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.registerOnSaveHandler does not allow calls from ${context} context when the handler is called`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          expect(() => settings.registerOnSaveHandler(() => (handlerCalled = true))).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.registerOnSaveHandler does not allow calls from ${context} context when the handler is not called`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = true;
          expect(() => settings.registerOnSaveHandler(() => (handlerCalled = false))).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('settings.registerOnSaveHandler should successfully register a save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      let handlerCalled = false;
      settings.registerOnSaveHandler(() => {
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
    });

    it('settings.registerOnSaveHandler should not throw if pages.config is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(() => settings.registerOnSaveHandler(() => {})).not.toThrowError();
    });

    it('settings.registerOnSaveHandler should successfully register a save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handlerCalled = false;
      settings.registerOnSaveHandler((saveEvent) => {
        handlerCalled = true;
        expect(saveEvent.result['webhookUrl']).not.toBeNull();
      });

      utils.sendMessage('settings.save', [
        {
          webhookUrl: 'someWebhookUrl',
        },
      ]);

      expect(handlerCalled).toBe(true);
    });

    it('settings.registerOnSaveHandler should successfully override a save handler with another', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handler1Called = false;
      let handler2Called = false;
      settings.registerOnSaveHandler(() => {
        handler1Called = true;
      });
      settings.registerOnSaveHandler(() => {
        handler2Called = true;
      });

      utils.sendMessage('settings.save');

      expect(handler1Called).toBe(false);
      expect(handler2Called).toBe(true);
    });

    it('settings.registerOnSaveHandler should successfully notify success from the registered save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handlerCalled = false;
      settings.registerOnSaveHandler((saveEvent) => {
        saveEvent.notifySuccess();
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.save.success');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });

    it('settings.registerOnSaveHandler should successfully notify failure from the registered save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handlerCalled = false;
      settings.registerOnSaveHandler((saveEvent) => {
        saveEvent.notifyFailure('someReason');
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.save.failure');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('someReason');
    });

    it('settings.registerOnSaveHandler should not allow multiple notifies from the saveEvent.notifySuccess save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handlerCalled = false;
      settings.registerOnSaveHandler((saveEvent) => {
        saveEvent.notifySuccess();
        expect(() => saveEvent.notifySuccess()).toThrowError('The SaveEvent may only notify success or failure once.');
        expect(() => saveEvent.notifyFailure()).toThrowError('The SaveEvent may only notify success or failure once.');
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.save.success');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });

    it('settings.registerOnSaveHandler should not allow multiple notifies from saveEvent.notifyFailure save handler', async () => {
      await utils.initializeWithContext(FrameContexts.settings);

      let handlerCalled = false;
      settings.registerOnSaveHandler((saveEvent) => {
        saveEvent.notifyFailure('someReason');
        expect(() => saveEvent.notifySuccess()).toThrowError('The SaveEvent may only notify success or failure once.');
        expect(() => saveEvent.notifyFailure()).toThrowError('The SaveEvent may only notify success or failure once.');
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.save.failure');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('someReason');
    });
  });

  describe('Testing settings.registerOnRemoveHandler function', () => {
    const allowedContexts = [FrameContexts.remove, FrameContexts.settings];
    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`settings.registerOnRemoveHandler does not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => settings.registerOnRemoveHandler(() => true)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('settings.registerOnRemoveHandler should successfully notify success on remove when there is no registered handler', async () => {
      await utils.initializeWithContext(FrameContexts.remove);

      utils.sendMessage('settings.remove');

      const message = utils.findMessageByFunc('settings.remove.success');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });

    it('settings.registerOnRemoveHandler should not throw if pages.config is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(() => settings.registerOnRemoveHandler(() => {})).not.toThrowError();
    });

    it('settings.registerOnRemoveHandler should successfully notify success from the registered remove handler', async () => {
      await utils.initializeWithContext(FrameContexts.remove);

      let handlerCalled = false;
      settings.registerOnRemoveHandler((removeEvent) => {
        removeEvent.notifySuccess();
        handlerCalled = true;
      });

      utils.sendMessage('settings.remove');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.remove.success');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });

    it('settings.registerOnRemoveHandler should successfully notify failure from the registered remove handler', async () => {
      await utils.initializeWithContext(FrameContexts.remove);

      let handlerCalled = false;
      settings.registerOnRemoveHandler((removeEvent) => {
        removeEvent.notifyFailure('someReason');
        handlerCalled = true;
      });

      utils.sendMessage('settings.remove');

      expect(handlerCalled).toBe(true);
      const message = utils.findMessageByFunc('settings.remove.failure');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('someReason');
    });
  });
});
