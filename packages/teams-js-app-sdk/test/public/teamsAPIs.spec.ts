import { TabInstanceParameters, FrameInfo } from '../../src/public/interfaces';
import { app, core } from '../../src/public/app';
import { teamsCore } from '../../src/public/teamsAPIs';
import { pages } from '../../src/public/pages';
import { Utils } from '../utils';
import { version } from '../../src/internal/constants';

describe('AppSDK-TeamsAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  it('should successfully register a change settings handler', async () => {
    await utils.initializeWithContext('content');
    let handlerCalled = false;

    pages.config.registerChangeConfigHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('changeSettings', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button click handler', async () => {
    await utils.initializeWithContext('content');
    let handlerCalled = false;

    pages.appButton.onClick(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonClick', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button hover enter handler', async () => {
    await utils.initializeWithContext('content');
    let handlerCalled = false;

    pages.appButton.onHoverEnter(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverEnter', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button hover leave handler', async () => {
    await utils.initializeWithContext('content');
    let handlerCalled = false;

    pages.appButton.onHoverLeave(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverLeave', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a back button handler and not call navigateBack if it returns true', async () => {
    await utils.initializeWithContext('content');

    let handlerInvoked = false;
    pages.backStack.registerBackButtonHandler(() => {
      handlerInvoked = true;
      return true;
    });

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it('should successfully register a back button handler and call navigateBack if it returns false', async () => {
    await utils.initializeWithContext('content');

    let handlerInvoked = false;
    pages.backStack.registerBackButtonHandler(() => {
      handlerInvoked = true;
      return false;
    });

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  describe('getTabInstances', () => {
    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext('content');

      pages.tabs.getTabInstances();
      pages.tabs.getTabInstances({} as TabInstanceParameters);
    });
  });

  describe('getMruTabInstances', () => {
    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext('content');

      pages.tabs.getMruTabInstances();
      pages.tabs.getMruTabInstances({} as TabInstanceParameters);
    });
  });

  it("Ctrl+P shouldn't call print handler if printCapabilty is disabled", async () => {
    let handlerCalled = false;
    app.initialize();
    spyOn(teamsCore, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it("Cmd+P shouldn't call print handler if printCapabilty is disabled", async () => {
    let handlerCalled = false;
    app.initialize();
    spyOn(teamsCore, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it('print handler should successfully call default print handler', async () => {
    let handlerCalled = false;
    app.initialize();
    teamsCore.enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });

    print();

    expect(handlerCalled).toBeTruthy();
  });

  it('Ctrl+P should successfully call print handler', async () => {
    let handlerCalled = false;
    app.initialize();
    teamsCore.enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeTruthy();
  });

  it('Cmd+P should successfully call print handler', async () => {
    let handlerCalled = false;
    app.initialize();
    teamsCore.enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBe(true);
  });

  describe('registerOnLoadHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        teamsCore.registerOnLoadHandler(() => {
          return false;
        }),
      ).toThrowError('The library has not yet been initialized');
    });
    it('should successfully register handler', async () => {
      await utils.initializeWithContext('content');

      let handlerInvoked = false;
      teamsCore.registerOnLoadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage('load');

      expect(handlerInvoked).toBe(true);
    });
  });

  describe('registerBeforeUnloadHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        teamsCore.registerBeforeUnloadHandler(() => {
          return false;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully register a before unload handler', async () => {
      await utils.initializeWithContext('content');

      let handlerInvoked = false;
      teamsCore.registerBeforeUnloadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage('beforeUnload');

      expect(handlerInvoked).toBe(true);
    });

    it('should call readyToUnload automatically when no before unload handler is registered', async () => {
      await utils.initializeWithContext('content');

      utils.sendMessage('beforeUnload');

      let readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).not.toBeNull();
    });

    it('should successfully share a deep link in content context', async () => {
      await utils.initializeWithContext('content');

      core.shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      let message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully share a deep link in sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      core.shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      let message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully register a before unload handler and not call readyToUnload if it returns true', async () => {
      await utils.initializeWithContext('content');

      let handlerInvoked = false;
      let readyToUnloadFunc: () => void;
      teamsCore.registerBeforeUnloadHandler(readyToUnload => {
        readyToUnloadFunc = readyToUnload;
        handlerInvoked = true;
        return true;
      });

      utils.sendMessage('beforeUnload');

      let readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).toBeNull();
      expect(handlerInvoked).toBe(true);

      readyToUnloadFunc();
      readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).not.toBeNull();
    });
  });

  it('should successfully frame context', async () => {
    await utils.initializeWithContext('content');

    let frameContext: FrameInfo = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    pages.setCurrentFrame(frameContext);

    let message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });

  it('should successfully initialize and set the frame context', () => {
    let frameContext: FrameInfo = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    utils.initializeWithContext('content');
    pages.initializeWithFrameContext(frameContext);
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(2);

    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(initMessage.id).toBe(0);
    expect(initMessage.func).toBe('initialize');
    expect(initMessage.args.length).toEqual(1);
    expect(initMessage.args[0]).toEqual(version);
    let message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });

  it('should successfully register a focus enter handler and return true', async () => {
    await utils.initializeWithContext('content');

    let handlerInvoked = false;
    teamsCore.registerFocusEnterHandler(() => {
      handlerInvoked = true;
    });

    utils.sendMessage('focusEnter');
    expect(handlerInvoked).toBe(true);
  });
});
