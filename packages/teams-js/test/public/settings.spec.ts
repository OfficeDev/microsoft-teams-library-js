import { _uninitialize } from '../../src/public/publicAPIs';
import { settings } from '../../src/public/settings';
import { Utils } from '../utils';

describe('settings', () => {
  // Use to send a mock message from the app.

  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  it('should not allow calls from the wrong context', () => {
    utils.initializeWithContext('content').then(() => {
      expect(() => settings.setValidityState(true)).toThrowError(
        'This call is only allowed in following contexts: ["settings","remove"]. Current context: "content".',
      );
    });
  });

  it('should successfully notify success on save when there is no registered handler', () => {
    utils.initializeWithContext('settings').then(() => {
      utils.sendMessage('settings.save');

      const message = utils.findMessageByFunc('settings.save.success');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });
  });

  it('should successfully register a remove handler', done => {
    utils.initializeWithContext('remove').then(() => {
      settings.registerOnRemoveHandler(() => {
        done();
      });

      utils.sendMessage('settings.remove');
    });
  });

  it('should successfully set validity state to true', () => {
    utils.initializeWithContext('settings').then(() => {
      settings.setValidityState(true);

      const message = utils.findMessageByFunc('settings.setValidityState');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(true);
    });
  });

  it('should successfully set validity state to false', () => {
    utils.initializeWithContext('settings').then(() => {
      settings.setValidityState(false);

      const message = utils.findMessageByFunc('settings.setValidityState');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(false);
    });
  });

  it('should successfully get settings', done => {
    utils.initializeWithContext('settings').then(() => {
      settings.getSettings(settings => {
        expect(settings).toBe(expectedSettings);
        done();
      });

      const message = utils.findMessageByFunc('settings.getSettings');
      expect(message).not.toBeNull();

      const expectedSettings: settings.Settings = {
        suggestedDisplayName: 'someSuggestedDisplayName',
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
        entityId: 'someEntityId',
      };

      utils.respondToMessage(message, expectedSettings);
    });
  });

  it('should successfully set settings', () => {
    utils.initializeWithContext('settings').then(() => {
      const settingsObj: settings.Settings = {
        suggestedDisplayName: 'someSuggestedDisplayName',
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
        entityId: 'someEntityId',
      };
      settings.setSettings(settingsObj);

      const message = utils.findMessageByFunc('settings.setSettings');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(settingsObj);
    });
  });

  it('should successfully register a save handler', () => {
    utils.initializeWithContext('settings').then(() => {
      let handlerCalled = false;
      settings.registerOnSaveHandler(() => {
        handlerCalled = true;
      });

      utils.sendMessage('settings.save');

      expect(handlerCalled).toBe(true);
    });
  });

  it('should successfully register a remove handler', () => {
    return utils.initializeWithContext('settings').then(() => {
      let handlerCalled = false;
      settings.registerOnSaveHandler(saveEvent => {
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
  });

  it('should successfully override a save handler with another', async () => {
    await utils.initializeWithContext('settings');

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

  it('should successfully notify success from the registered save handler', async () => {
    await utils.initializeWithContext('settings');

    let handlerCalled = false;
    settings.registerOnSaveHandler(saveEvent => {
      saveEvent.notifySuccess();
      handlerCalled = true;
    });

    utils.sendMessage('settings.save');

    expect(handlerCalled).toBe(true);
    const message = utils.findMessageByFunc('settings.save.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it('should successfully notify failure from the registered save handler', async () => {
    await utils.initializeWithContext('settings');

    let handlerCalled = false;
    settings.registerOnSaveHandler(saveEvent => {
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

  it('should successfully notify success on remove when there is no registered handler', async () => {
    await utils.initializeWithContext('remove');

    utils.sendMessage('settings.remove');

    const message = utils.findMessageByFunc('settings.remove.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it('should successfully notify success from the registered remove handler', async () => {
    await utils.initializeWithContext('remove');

    let handlerCalled = false;
    settings.registerOnRemoveHandler(removeEvent => {
      removeEvent.notifySuccess();
      handlerCalled = true;
    });

    utils.sendMessage('settings.remove');

    expect(handlerCalled).toBe(true);
    const message = utils.findMessageByFunc('settings.remove.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it('should successfully notify failure from the registered remove handler', async () => {
    await utils.initializeWithContext('remove');

    let handlerCalled = false;
    settings.registerOnRemoveHandler(removeEvent => {
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

  it('should not allow multiple notifies from the registered save handler', async () => {
    await utils.initializeWithContext('settings');

    let handlerCalled = false;
    settings.registerOnSaveHandler(saveEvent => {
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
});
