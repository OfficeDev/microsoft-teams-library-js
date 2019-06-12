import * as microsoftTeams from "../src/public/publicAPIs";
import * as microsoftTeamsPrivate from "../src/private/privateAPIs";
import { settings as microsoftTeamsSettings } from "../src/public/settings";
import { authentication as microsoftTeamsAuthentication } from "../src/public/authentication";
import { TabInstanceParameters, Context, TaskInfo, OpenConversationRequest } from "../src/public/interfaces";
import { TeamInstanceParameters } from "../src/private/interfaces";
import { TeamType, UserTeamRole, HostClientType, TaskModuleDimension } from "../src/public/constants";
import { tasks } from "../src/public/tasks";
import { conversations } from "../src/private/conversations";

interface MessageRequest {
  id: number;
  func: string;
  args?: any[]; // tslint:disable-line:no-any
}

interface MessageResponse {
  id: number;
  args?: any[]; // tslint:disable-line:no-any
}

describe("MicrosoftTeams", () => {
  const validOrigin = "https://teams.microsoft.com";
  const tabOrigin = "https://example.com";

  // Use to send a mock message from the app.
  let processMessage: (ev: MessageEvent) => void;

  // A list of messages the library sends to the app.
  let messages: MessageRequest[];

  // A list of messages the library sends to the auth popup.
  let childMessages: MessageRequest[];

  let childWindow = {
    postMessage: function (message: MessageRequest, targetOrigin: string): void {
      childMessages.push(message);
    },
    close: function (): void {
      return;
    },
    closed: false
  };

  let mockWindow = {
    outerWidth: 1024,
    outerHeight: 768,
    screenLeft: 0,
    screenTop: 0,
    addEventListener: function (
      type: string,
      listener: (ev: MessageEvent) => void,
      useCapture?: boolean
    ): void {
      if (type === "message") {
        processMessage = listener;
      }
    },
    removeEventListener: function (
      type: string,
      listener: (ev: MessageEvent) => void,
      useCapture?: boolean
    ): void {
      if (type === "message") {
        processMessage = null;
      }
    },
    location: {
      origin: tabOrigin,
      href: validOrigin,
      assign: function (url: string): void {
        return;
      }
    },
    parent: {
      postMessage: function (
        message: MessageRequest,
        targetOrigin: string
      ): void {
        if (message.func === "initialize") {
          expect(targetOrigin).toEqual("*");
        } else {
          expect(targetOrigin).toEqual(validOrigin);
        }

        messages.push(message);
      }
    } as Window,
    self: null as Window,
    open: function (url: string, name: string, specs: string): Window {
      return childWindow as Window;
    },
    close: function (): void {
      return;
    },
    setInterval: (handler: Function, timeout: number): number =>
      setInterval(handler, timeout)
  };
  mockWindow.self = mockWindow as Window;

  beforeEach(() => {
    processMessage = null;
    messages = [];
    childMessages = [];
    childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (microsoftTeams._uninitialize) {
      microsoftTeams._uninitialize();
    }
  });

  it("should exist in the global namespace", () => {
    expect(microsoftTeams).toBeDefined();
  });

  it("should successfully initialize", () => {
    microsoftTeams.initialize(mockWindow);

    expect(processMessage).toBeDefined();
    expect(messages.length).toBe(1);

    let initMessage = findMessageByFunc("initialize");
    expect(initMessage).not.toBeNull();
    expect(initMessage.id).toBe(0);
    expect(initMessage.func).toBe("initialize");
    expect(initMessage.args.length).toEqual(1);
    expect(initMessage.args[0]).toEqual("1.4.1");
  });

  it("should allow multiple initialize calls", () => {
    for (let i = 0; i < 100; i++) {
      microsoftTeams.initialize(mockWindow);
    }

    // Still only one message actually sent, the extra calls just no-op'ed
    expect(processMessage).toBeDefined();
    expect(messages.length).toBe(1);
  });

  it("should not allow calls before initialization", () => {
    expect(() =>
      microsoftTeams.getContext(() => {
        return;
      })
    ).toThrowError("The library has not yet been initialized");
  });

  it("should not allow calls from the wrong context", () => {
    initializeWithContext("content");

    expect(() => microsoftTeamsSettings.setValidityState(true)).toThrowError(
      "This call is not allowed in the 'content' context"
    );
  });

  const unSupportedDomains = [
    "https://teams.com",
    "https://teams.us",
    "https://int.microsoft.com",
    "https://dev.skype.com",
    "http://localhost",
    "https://microsoftsharepoint.com",
    "https://msft.com",
    "https://microsoft.sharepoint-xyz.com",
    "http://teams.microsoft.com",
    "http://microsoft.sharepoint-df.com",
    "https://a.b.sharepoint.com",
    "https://a.b.c.sharepoint.com"
  ];

  unSupportedDomains.forEach(unSupportedDomain => {
    it(
      "should reject messages from unsupported domain: " + unSupportedDomain,
      () => {
        initializeWithContext("content");
        let callbackCalled = false;
        microsoftTeams.getContext(() => {
          callbackCalled = true;
        });

        let getContextMessage = findMessageByFunc("getContext");
        expect(getContextMessage).not.toBeNull();

        callbackCalled = false;
        processMessage({
          origin: unSupportedDomain,
          source: mockWindow.parent,
          data: {
            id: getContextMessage.id,
            args: [
              {
                groupId: "someMaliciousValue"
              }
            ]
          } as MessageResponse
        } as MessageEvent);

        expect(callbackCalled).toBe(false);
      }
    );
  });

  const supportedDomains = [
    "https://teams.microsoft.com",
    "https://teams.microsoft.us",
    "https://gov.teams.microsoft.us",
    "https://dod.teams.microsoft.us",
    "https://int.teams.microsoft.com",
    "https://devspaces.skype.com",
    "http://dev.local",
    "https://microsoft.sharepoint.com",
    "https://msft.spoppe.com",
    "https://microsoft.sharepoint-df.com",
    "https://microsoft.sharepointonline.com",
    "https://outlook.office.com",
    "https://outlook-sdf.office.com"
  ];

  supportedDomains.forEach(supportedDomain => {
    it("should allow messages from supported domain " + supportedDomain, () => {
      initializeWithContext("content");
      let callbackCalled = false;
      microsoftTeams.getContext(() => {
        callbackCalled = true;
      });

      let getContextMessage = findMessageByFunc("getContext");
      expect(getContextMessage).not.toBeNull();

      processMessage({
        origin: supportedDomain,
        source: mockWindow.parent,
        data: {
          id: getContextMessage.id,
          args: [
            {
              groupId: "someMaliciousValue"
            }
          ]
        } as MessageResponse
      } as MessageEvent);

      expect(callbackCalled).toBe(true);
    });
  });

  it("should not make calls to unsupported domains", () => {
    microsoftTeams.initialize(mockWindow);

    let initMessage = findMessageByFunc("initialize");
    expect(initMessage).not.toBeNull();

    processMessage({
      origin: "https://some-malicious-site.com/",
      source: mockWindow.parent,
      data: {
        id: initMessage.id,
        args: ["content"]
      } as MessageResponse
    } as MessageEvent);

    // Try to make a call
    microsoftTeams.getContext(() => {
      return;
    });

    // Only the init call went out
    expect(messages.length).toBe(1);
  });

  it("should successfully handle calls queued before init completes", () => {
    microsoftTeams.initialize(mockWindow);

    // Another call made before the init response
    microsoftTeams.getContext(() => {
      return;
    });

    // Only the init call went out
    expect(messages.length).toBe(1);
    let initMessage = findMessageByFunc("initialize");
    expect(initMessage).not.toBeNull();
    expect(findMessageByFunc("getContext")).toBeNull();

    // init completes
    respondToMessage(initMessage, "content");

    // Now the getContext call should have been dequeued
    expect(messages.length).toBe(2);
    expect(findMessageByFunc("getContext")).not.toBeNull();
  });

  it("should successfully handle out of order calls", () => {
    initializeWithContext("content");

    let actualContext1: Context;
    microsoftTeams.getContext(context => {
      actualContext1 = context;
    });

    let getContextMessage1 = messages[messages.length - 1];

    let actualContext2: Context;
    microsoftTeams.getContext(context => {
      actualContext2 = context;
    });

    let getContextMessage2 = messages[messages.length - 1];

    let actualContext3: Context;
    microsoftTeams.getContext(context => {
      actualContext3 = context;
    });

    let getContextMessage3 = messages[messages.length - 1];

    // They're all distinct messages
    expect(getContextMessage3).not.toBe(getContextMessage1);
    expect(getContextMessage2).not.toBe(getContextMessage1);
    expect(getContextMessage3).not.toBe(getContextMessage2);

    let expectedContext1: Context = {
      locale: "someLocale1",
      groupId: "someGroupId1",
      channelId: "someChannelId1",
      entityId: "someEntityId1"
    };
    let expectedContext2: Context = {
      locale: "someLocale2",
      groupId: "someGroupId2",
      channelId: "someChannelId2",
      entityId: "someEntityId2"
    };
    let expectedContext3: Context = {
      locale: "someLocale3",
      groupId: "someGroupId3",
      channelId: "someChannelId3",
      entityId: "someEntityId3"
    };

    // respond in the wrong order
    respondToMessage(getContextMessage3, expectedContext3);
    respondToMessage(getContextMessage1, expectedContext1);
    respondToMessage(getContextMessage2, expectedContext2);

    // The callbacks were associated with the correct messages
    expect(actualContext1).toBe(expectedContext1);
    expect(actualContext2).toBe(expectedContext2);
    expect(actualContext3).toBe(expectedContext3);
  });

  it("should only call callbacks once", () => {
    initializeWithContext("content");

    let callbackCalled = 0;
    microsoftTeams.getContext(context => {
      callbackCalled++;
    });

    let getContextMessage = findMessageByFunc("getContext");
    expect(getContextMessage).not.toBeNull();

    let expectedContext: Context = {
      locale: "someLocale",
      groupId: "someGroupId",
      channelId: "someChannelId",
      entityId: "someEntityId",
      teamType: TeamType.Edu,
      teamSiteUrl: "someSiteUrl",
      sessionId: "someSessionId"
    };

    // Get many responses to the same message
    for (let i = 0; i < 100; i++) {
      respondToMessage(getContextMessage, expectedContext);
    }

    // Still only called the callback once.
    expect(callbackCalled).toBe(1);
  });

  it("should successfully get context", () => {
    initializeWithContext("content");

    let actualContext: Context;
    microsoftTeams.getContext(context => {
      actualContext = context;
    });

    let getContextMessage = findMessageByFunc("getContext");
    expect(getContextMessage).not.toBeNull();

    let expectedContext: Context = {
      groupId: "someGroupId",
      teamId: "someTeamId",
      teamName: "someTeamName",
      channelId: "someChannelId",
      channelName: "someChannelName",
      entityId: "someEntityId",
      subEntityId: "someSubEntityId",
      locale: "someLocale",
      upn: "someUpn",
      tid: "someTid",
      theme: "someTheme",
      isFullScreen: true,
      teamType: TeamType.Staff,
      teamSiteUrl: "someSiteUrl",
      teamSiteDomain: "someTeamSiteDomain",
      teamSitePath: "someTeamSitePath",
      channelRelativeUrl: "someChannelRelativeUrl",
      sessionId: "someSessionId",
      userTeamRole: UserTeamRole.Admin,
      chatId: "someChatId",
      loginHint: "someLoginHint",
      userPrincipalName: "someUserPrincipalName",
      userObjectId: "someUserObjectId",
      isTeamArchived: false,
      hostClientType: HostClientType.web,
      sharepoint: {},
      tenantSKU: "someTenantSKU",
      userLicenseType: "someUserLicenseType",
      parentMessageId: "someParentMessageId",
      ringId: "someRingId"
    };

    respondToMessage(getContextMessage, expectedContext);

    expect(actualContext).toBe(expectedContext);
  });

  it("should successfully register a theme change handler", () => {
    initializeWithContext("content");

    let newTheme: string;
    microsoftTeams.registerOnThemeChangeHandler(theme => {
      newTheme = theme;
    });

    sendMessage("themeChange", "someTheme");

    expect(newTheme).toBe("someTheme");
  });

  it("should call navigateBack automatically when no back button handler is registered", () => {
    initializeWithContext("content");

    sendMessage("backButtonPress");

    let navigateBackMessage = findMessageByFunc("navigateBack");
    expect(navigateBackMessage).not.toBeNull();
  });

  it("should successfully register a back button handler and not call navigateBack if it returns true", () => {
    initializeWithContext("content");

    let handlerInvoked = false;
    microsoftTeams.registerBackButtonHandler(() => {
      handlerInvoked = true;
      return true;
    });

    sendMessage("backButtonPress");

    let navigateBackMessage = findMessageByFunc("navigateBack");
    expect(navigateBackMessage).toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it("should successfully register a back button handler and call navigateBack if it returns false", () => {
    initializeWithContext("content");

    let handlerInvoked = false;
    microsoftTeams.registerBackButtonHandler(() => {
      handlerInvoked = true;
      return false;
    });

    sendMessage("backButtonPress");

    let navigateBackMessage = findMessageByFunc("navigateBack");
    expect(navigateBackMessage).not.toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it("should successfully register a change settings handler", () => {
    initializeWithContext("content");
    let handlerCalled = false;

    microsoftTeams.registerChangeSettingsHandler(() => {
      handlerCalled = true;
    });

    sendMessage("changeSettings", "");

    expect(handlerCalled).toBeTruthy();
  });

  it("should successfully set validity state to true", () => {
    initializeWithContext("settings");

    microsoftTeamsSettings.setValidityState(true);

    let message = findMessageByFunc("settings.setValidityState");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(true);
  });

  it("should successfully set validity state to false", () => {
    initializeWithContext("settings");

    microsoftTeamsSettings.setValidityState(false);

    let message = findMessageByFunc("settings.setValidityState");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(false);
  });

  it("should successfully get settings", () => {
    initializeWithContext("settings");

    let actualSettings: microsoftTeamsSettings.Settings;
    microsoftTeamsSettings.getSettings(settings => {
      actualSettings = settings;
    });

    let message = findMessageByFunc("settings.getSettings");
    expect(message).not.toBeNull();

    let expectedSettings: microsoftTeamsSettings.Settings = {
      suggestedDisplayName: "someSuggestedDisplayName",
      contentUrl: "someContentUrl",
      websiteUrl: "someWebsiteUrl",
      entityId: "someEntityId"
    };

    respondToMessage(message, expectedSettings);

    expect(actualSettings).toBe(expectedSettings);
  });

  it("should successfully set settings", () => {
    initializeWithContext("settings");

    let settings: microsoftTeamsSettings.Settings = {
      suggestedDisplayName: "someSuggestedDisplayName",
      contentUrl: "someContentUrl",
      websiteUrl: "someWebsiteUrl",
      entityId: "someEntityId"
    };
    microsoftTeamsSettings.setSettings(settings);

    let message = findMessageByFunc("settings.setSettings");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(settings);
  });

  it("should successfully register a save handler", () => {
    initializeWithContext("settings");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      handlerCalled = true;
    });

    sendMessage("settings.save");

    expect(handlerCalled).toBe(true);
  });

  it("should successfully register a remove handler", () => {
    initializeWithContext("settings");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      handlerCalled = true;
      expect(saveEvent.result["webhookUrl"]).not.toBeNull();
    });

    sendMessage("settings.save", [
      {
        webhookUrl: "someWebhookUrl"
      }
    ]);

    expect(handlerCalled).toBe(true);
  });

  it("should successfully register a remove handler", () => {
    initializeWithContext("remove");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnRemoveHandler(removeEvent => {
      handlerCalled = true;
    });

    sendMessage("settings.remove");

    expect(handlerCalled).toBeTruthy();
  });

  it("Ctrl+P shouldn't call print handler if printCapabilty is disabled", () => {
    let handlerCalled = false;
    microsoftTeams.initialize(mockWindow);
    spyOn(microsoftTeams, "print").and.callFake(
      (): void => {
        handlerCalled = true;
      }
    );
    let printEvent = new Event("keydown");
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it("Cmd+P shouldn't call print handler if printCapabilty is disabled", () => {
    let handlerCalled = false;
    microsoftTeams.initialize(mockWindow);
    spyOn(microsoftTeams, "print").and.callFake(
      (): void => {
        handlerCalled = true;
      }
    );
    let printEvent = new Event("keydown");
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it("print handler should successfully call default print handler", () => {
    let handlerCalled = false;
    microsoftTeams.initialize(mockWindow);
    microsoftTeams.enablePrintCapability();
    spyOn(window, "print").and.callFake(
      (): void => {
        handlerCalled = true;
      }
    );

    microsoftTeams.print();

    expect(handlerCalled).toBeTruthy();
  });

  it("Ctrl+P should successfully call print handler", () => {
    let handlerCalled = false;
    microsoftTeams.initialize(mockWindow);
    microsoftTeams.enablePrintCapability();
    spyOn(window, "print").and.callFake(
      (): void => {
        handlerCalled = true;
      }
    );
    let printEvent = new Event("keydown");
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeTruthy();
  });

  it("Cmd+P should successfully call print handler", () => {
    let handlerCalled = false;
    microsoftTeams.initialize(mockWindow);
    microsoftTeams.enablePrintCapability();
    spyOn(window, "print").and.callFake(
      (): void => {
        handlerCalled = true;
      }
    );
    let printEvent = new Event("keydown");
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBe(true);
  });

  it("should successfully override a save handler with another", () => {
    initializeWithContext("settings");

    let handler1Called = false;
    let handler2Called = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      handler1Called = true;
    });
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      handler2Called = true;
    });

    sendMessage("settings.save");

    expect(handler1Called).toBe(false);
    expect(handler2Called).toBe(true);
  });

  it("should successfully notify success on save when there is no registered handler", () => {
    initializeWithContext("settings");

    sendMessage("settings.save");

    let message = findMessageByFunc("settings.save.success");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it("should successfully notify success from the registered save handler", () => {
    initializeWithContext("settings");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      saveEvent.notifySuccess();
      handlerCalled = true;
    });

    sendMessage("settings.save");

    expect(handlerCalled).toBe(true);
    let message = findMessageByFunc("settings.save.success");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it("should successfully notify failure from the registered save handler", () => {
    initializeWithContext("settings");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      saveEvent.notifyFailure("someReason");
      handlerCalled = true;
    });

    sendMessage("settings.save");

    expect(handlerCalled).toBe(true);
    let message = findMessageByFunc("settings.save.failure");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe("someReason");
  });

  it("should successfully notify success on remove when there is no registered handler", () => {
    initializeWithContext("remove");

    sendMessage("settings.remove");

    let message = findMessageByFunc("settings.remove.success");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it("should successfully notify success from the registered remove handler", () => {
    initializeWithContext("remove");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnRemoveHandler(removeEvent => {
      removeEvent.notifySuccess();
      handlerCalled = true;
    });

    sendMessage("settings.remove");

    expect(handlerCalled).toBe(true);
    let message = findMessageByFunc("settings.remove.success");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it("should successfully notify failure from the registered remove handler", () => {
    initializeWithContext("remove");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnRemoveHandler(removeEvent => {
      removeEvent.notifyFailure("someReason");
      handlerCalled = true;
    });

    sendMessage("settings.remove");

    expect(handlerCalled).toBe(true);
    let message = findMessageByFunc("settings.remove.failure");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe("someReason");
  });

  it("should not allow multiple notifies from the registered save handler", () => {
    initializeWithContext("settings");

    let handlerCalled = false;
    microsoftTeamsSettings.registerOnSaveHandler(saveEvent => {
      saveEvent.notifySuccess();
      expect(() => saveEvent.notifySuccess()).toThrowError(
        "The SaveEvent may only notify success or failure once."
      );
      expect(() => saveEvent.notifyFailure()).toThrowError(
        "The SaveEvent may only notify success or failure once."
      );
      handlerCalled = true;
    });

    sendMessage("settings.save");

    expect(handlerCalled).toBe(true);
    let message = findMessageByFunc("settings.save.success");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });

  it("should successfully share a deep link", () => {
    initializeWithContext("content");

    microsoftTeams.shareDeepLink({
      subEntityId: "someSubEntityId",
      subEntityLabel: "someSubEntityLabel",
      subEntityWebUrl: "someSubEntityWebUrl"
    });

    let message = findMessageByFunc("shareDeepLink");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toBe("someSubEntityId");
    expect(message.args[1]).toBe("someSubEntityLabel");
    expect(message.args[2]).toBe("someSubEntityWebUrl");
  });

  it("should successfully open a file preview", () => {
    initializeWithContext("content");

    microsoftTeamsPrivate.openFilePreview({
      entityId: "someEntityId",
      title: "someTitle",
      description: "someDescription",
      type: "someType",
      objectUrl: "someObjectUrl",
      downloadUrl: "someDownloadUrl",
      webPreviewUrl: "someWebPreviewUrl",
      webEditUrl: "someWebEditUrl",
      baseUrl: "someBaseUrl",
      editFile: true,
      subEntityId: "someSubEntityId"
    });

    let message = findMessageByFunc("openFilePreview");
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(11);
    expect(message.args[0]).toBe("someEntityId");
    expect(message.args[1]).toBe("someTitle");
    expect(message.args[2]).toBe("someDescription");
    expect(message.args[3]).toBe("someType");
    expect(message.args[4]).toBe("someObjectUrl");
    expect(message.args[5]).toBe("someDownloadUrl");
    expect(message.args[6]).toBe("someWebPreviewUrl");
    expect(message.args[7]).toBe("someWebEditUrl");
    expect(message.args[8]).toBe("someBaseUrl");
    expect(message.args[9]).toBe(true);
    expect(message.args[10]).toBe("someSubEntityId");
  });

  describe("navigateCrossDomain", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        microsoftTeams.navigateCrossDomain("https://valid.origin.com")
      ).toThrowError("The library has not yet been initialized");
    });

    it("should not allow calls from authentication context", () => {
      initializeWithContext("authentication");

      expect(() =>
        microsoftTeams.navigateCrossDomain("https://valid.origin.com")
      ).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should allow calls from content context", () => {
      initializeWithContext("content");

      microsoftTeams.navigateCrossDomain("https://valid.origin.com");
    });

    it("should allow calls from settings context", () => {
      initializeWithContext("settings");

      microsoftTeams.navigateCrossDomain("https://valid.origin.com");
    });

    it("should allow calls from remove context", () => {
      initializeWithContext("remove");

      microsoftTeams.navigateCrossDomain("https://valid.origin.com");
    });

    it("should allow calls from task context", () => {
      initializeWithContext("task");

      microsoftTeams.navigateCrossDomain("https://valid.origin.com");
    });

    it("should successfully navigate cross-origin", () => {
      initializeWithContext("content");

      microsoftTeams.navigateCrossDomain("https://valid.origin.com");

      let navigateCrossDomainMessage = findMessageByFunc("navigateCrossDomain");
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe(
        "https://valid.origin.com"
      );
    });

    it("should throw on invalid cross-origin navigation request", () => {
      initializeWithContext("settings");

      microsoftTeams.navigateCrossDomain("https://invalid.origin.com");

      let navigateCrossDomainMessage = findMessageByFunc("navigateCrossDomain");
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe(
        "https://invalid.origin.com"
      );

      let respondWithFailure = () => {
        respondToMessage(navigateCrossDomainMessage, false);
      };

      expect(respondWithFailure).toThrow();
    });
  });

  describe("authentication", () => {
    it("should not allow authentication.authenticate calls before initialization", () => {
      const authenticationParams: microsoftTeamsAuthentication.AuthenticateParameters = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };

      expect(() =>
        microsoftTeamsAuthentication.authenticate(authenticationParams)
      ).toThrowError("The library has not yet been initialized");
    });

    it("should not allow authentication.authenticate calls from authentication context", () => {
      initializeWithContext("authentication");

      const authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };

      const taskInfo: TaskInfo = {};
      expect(() =>
        microsoftTeamsAuthentication.authenticate(authenticationParams)
      ).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should allow authentication.authenticate calls from content context", () => {
      initializeWithContext("content");

      const authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
    });

    it("should allow authentication.authenticate calls from settings context", () => {
      initializeWithContext("settings");

      const authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
    });

    it("should allow authentication.authenticate calls from remove context", () => {
      initializeWithContext("remove");

      const authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
    });

    it("should allow authentication.authenticate calls from task context", () => {
      initializeWithContext("task");

      const authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
    });

    it("should successfully pop up the auth window", () => {
      initializeWithContext("content");

      let windowOpenCalled = false;
      spyOn(mockWindow, "open").and.callFake(
        (url: string, name: string, specs: string): Window => {
          expect(url).toEqual("https://someurl/");
          expect(name).toEqual("_blank");
          expect(specs.indexOf("width=100")).not.toBe(-1);
          expect(specs.indexOf("height=200")).not.toBe(-1);
          windowOpenCalled = true;
          return childWindow as Window;
        }
      );

      let authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
      expect(windowOpenCalled).toBe(true);
    });

    it("should successfully pop up the auth window when authenticate called without authenticationParams for connectors", () => {
      initializeWithContext("content");

      let windowOpenCalled = false;
      spyOn(mockWindow, "open").and.callFake(
        (url: string, name: string, specs: string): Window => {
          expect(url).toEqual("https://someurl/");
          expect(name).toEqual("_blank");
          expect(specs.indexOf("width=100")).not.toBe(-1);
          expect(specs.indexOf("height=200")).not.toBe(-1);
          windowOpenCalled = true;
          return childWindow as Window;
        }
      );

      let authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200
      };
      microsoftTeamsAuthentication.registerAuthenticationHandlers(
        authenticationParams
      );
      microsoftTeamsAuthentication.authenticate();
      expect(windowOpenCalled).toBe(true);
    });

    it("should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called", () => {
      initializeWithContext("content");

      let windowOpenCalled = false;
      spyOn(mockWindow, "open").and.callFake(
        (url: string, name: string, specs: string): Window => {
          expect(url).toEqual("https://someurl/");
          expect(name).toEqual("_blank");
          expect(specs.indexOf("width=100")).not.toBe(-1);
          expect(specs.indexOf("height=200")).not.toBe(-1);
          windowOpenCalled = true;
          return childWindow as Window;
        }
      );

      let successResult: string;
      let failureReason: string;
      let authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200,
        successCallback: (result: string) => (successResult = result),
        failureCallback: (reason: string) => (failureReason = reason)
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);
      expect(windowOpenCalled).toBe(true);

      childWindow.closed = true;
      setTimeout(() => {
        expect(successResult).toBeUndefined();
        expect(failureReason).toEqual("CancelledByUser");
      }, 101);
    });

    it("should successfully handle auth success", () => {
      initializeWithContext("content");

      let successResult: string;
      let failureReason: string;
      let authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200,
        successCallback: (result: string) => (successResult = result),
        failureCallback: (reason: string) => (failureReason = reason)
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);

      processMessage({
        origin: tabOrigin,
        source: childWindow,
        data: {
          id: 0,
          func: "authentication.authenticate.success",
          args: ["someResult"]
        }
      } as MessageEvent);

      expect(successResult).toEqual("someResult");
      expect(failureReason).toBeUndefined();
    });

    it("should successfully handle auth failure", () => {
      initializeWithContext("content");

      let successResult: string;
      let failureReason: string;
      let authenticationParams = {
        url: "https://someurl/",
        width: 100,
        height: 200,
        successCallback: (result: string) => (successResult = result),
        failureCallback: (reason: string) => (failureReason = reason)
      };
      microsoftTeamsAuthentication.authenticate(authenticationParams);

      processMessage({
        origin: tabOrigin,
        source: childWindow,
        data: {
          id: 0,
          func: "authentication.authenticate.failure",
          args: ["someReason"]
        }
      } as MessageEvent);

      expect(successResult).toBeUndefined();
      expect(failureReason).toEqual("someReason");
    });

    ["android", "ios", "desktop"].forEach(hostClientType => {
      it(`should successfully pop up the auth window in the ${hostClientType} client`, () => {
        initializeWithContext("content", hostClientType);

        let authenticationParams = {
          url: "https://someUrl",
          width: 100,
          height: 200
        };
        microsoftTeamsAuthentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(3);
        expect(message.args[0]).toBe(
          authenticationParams.url.toLowerCase() + "/"
        );
        expect(message.args[1]).toBe(authenticationParams.width);
        expect(message.args[2]).toBe(authenticationParams.height);
      });

      it(`should successfully handle auth success in the ${hostClientType} client`, () => {
        initializeWithContext("content", hostClientType);

        let successResult: string;
        let failureReason: string;
        let authenticationParams = {
          url: "https://someUrl",
          width: 100,
          height: 200,
          successCallback: (result: string) => (successResult = result),
          failureCallback: (reason: string) => (failureReason = reason)
        };
        microsoftTeamsAuthentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();

        respondToMessage(message, true, "someResult");

        expect(successResult).toBe("someResult");
        expect(failureReason).toBeUndefined();
      });

      it(`should successfully handle auth failure in the ${hostClientType} client`, () => {
        initializeWithContext("content", hostClientType);

        let successResult: string;
        let failureReason: string;
        let authenticationParams = {
          url: "https://someUrl",
          width: 100,
          height: 200,
          successCallback: (result: string) => (successResult = result),
          failureCallback: (reason: string) => (failureReason = reason)
        };
        microsoftTeamsAuthentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();

        respondToMessage(message, false, "someReason");

        expect(successResult).toBeUndefined();
        expect(failureReason).toBe("someReason");
      });
    });

    it("should successfully notify auth success", () => {
      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifySuccess("someResult");
      let message = findMessageByFunc("authentication.authenticate.success");
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe("someResult");
    });

    it("should do window redirect if callbackUrl is for win32 Outlook", () => {
      let windowAssignSpyCalled = false;
      spyOn(mockWindow.location, "assign").and.callFake(
        (url: string): void => {
          windowAssignSpyCalled = true;
          expect(url).toEqual(
            "https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&result=someResult&authSuccess"
          );
        }
      );

      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifySuccess(
        "someResult",
        "https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations"
      );
      expect(windowAssignSpyCalled).toBe(true);
    });

    it("should do window redirect if callbackUrl is for win32 Outlook and no result param specified", () => {
      let windowAssignSpyCalled = false;
      spyOn(mockWindow.location, "assign").and.callFake(
        (url: string): void => {
          windowAssignSpyCalled = true;
          expect(url).toEqual(
            "https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&authSuccess"
          );
        }
      );

      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifySuccess(
        null,
        "https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations"
      );
      expect(windowAssignSpyCalled).toBe(true);
    });

    it("should do window redirect if callbackUrl is for win32 Outlook but does not have URL fragments", () => {
      let windowAssignSpyCalled = false;
      spyOn(mockWindow.location, "assign").and.callFake(
        (url: string): void => {
          windowAssignSpyCalled = true;
          expect(url).toEqual(
            "https://outlook.office.com/connectors?client_type=Win32_Outlook#&result=someResult&authSuccess"
          );
        }
      );

      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifySuccess(
        "someResult",
        "https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook"
      );
      expect(windowAssignSpyCalled).toBe(true);
    });

    it("should successfully notify auth success if callbackUrl is not for win32 Outlook", () => {
      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifySuccess(
        "someResult",
        "https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration"
      );
      let message = findMessageByFunc("authentication.authenticate.success");
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe("someResult");
    });

    it("should successfully notify auth failure", () => {
      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifyFailure("someReason");

      let message = findMessageByFunc("authentication.authenticate.failure");
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe("someReason");
    });

    it("should do window redirect if callbackUrl is for win32 Outlook and auth failure happens", () => {
      let windowAssignSpyCalled = false;
      spyOn(mockWindow.location, "assign").and.callFake(
        (url: string): void => {
          windowAssignSpyCalled = true;
          expect(url).toEqual(
            "https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&reason=someReason&authFailure"
          );
        }
      );

      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifyFailure(
        "someReason",
        "https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations"
      );
      expect(windowAssignSpyCalled).toBe(true);
    });

    it("should successfully notify auth failure if callbackUrl is not for win32 Outlook", () => {
      spyOn(mockWindow.location, "assign").and.callFake(
        (url: string): void => {
          expect(url).toEqual(
            "https://someinvalidurl.com?callbackUrl=test#/configuration&reason=someReason&authFailure"
          );
        }
      );

      initializeWithContext("authentication");

      microsoftTeamsAuthentication.notifyFailure(
        "someReason",
        "https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration"
      );
      let message = findMessageByFunc("authentication.authenticate.failure");
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe("someReason");
    });

    it("should not close auth window before notify success message has been sent", () => {
      let closeWindowSpy = spyOn(mockWindow, "close").and.callThrough();

      microsoftTeams.initialize(mockWindow);
      let initMessage = findMessageByFunc("initialize");
      expect(initMessage).not.toBeNull();

      microsoftTeamsAuthentication.notifySuccess("someResult");
      let message = findMessageByFunc("authentication.authenticate.success");
      expect(message).toBeNull();
      expect(closeWindowSpy).not.toHaveBeenCalled();

      respondToMessage(initMessage, "authentication");
      message = findMessageByFunc("authentication.authenticate.success");
      expect(message).not.toBeNull();

      // Wait 100ms for the message queue and 200ms for the close delay
      setTimeout(() => {
        expect(closeWindowSpy).toHaveBeenCalled();
      }, 301);
    });

    it("should not close auth window before notify failure message has been sent", () => {
      let closeWindowSpy = spyOn(mockWindow, "close").and.callThrough();

      microsoftTeams.initialize(mockWindow);
      let initMessage = findMessageByFunc("initialize");
      expect(initMessage).not.toBeNull();

      microsoftTeamsAuthentication.notifyFailure("someReason");
      let message = findMessageByFunc("authentication.authenticate.failure");
      expect(message).toBeNull();
      expect(closeWindowSpy).not.toHaveBeenCalled();

      respondToMessage(initMessage, "authentication");
      message = findMessageByFunc("authentication.authenticate.failure");
      expect(message).not.toBeNull();

      // Wait 100ms for the message queue and 200ms for the close delay
      setTimeout(() => {
        expect(closeWindowSpy).toHaveBeenCalled();
      }, 301);
    });
  });

  describe("getTabInstances", () => {
    it("should allow a missing and valid optional parameter", () => {
      initializeWithContext("content");

      microsoftTeams.getTabInstances(tabInfo => tabInfo);
      microsoftTeams.getTabInstances(
        tabInfo => tabInfo,
        {} as TabInstanceParameters
      );
    });
  });

  describe("getMruTabInstances", () => {
    it("should allow a missing and valid optional parameter", () => {
      initializeWithContext("content");

      microsoftTeams.getMruTabInstances(tabInfo => tabInfo);
      microsoftTeams.getMruTabInstances(
        tabInfo => tabInfo,
        {} as TabInstanceParameters
      );
    });
  });

  describe("getUserJoinedTeams", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        microsoftTeamsPrivate.getUserJoinedTeams(() => {
          return;
        })
      ).toThrowError("The library has not yet been initialized");
    });

    it("should allow a valid optional parameter set to true", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getUserJoinedTeams(
        userJoinedTeamsInformation => {
          callbackCalled = true;
        },
        { favoriteTeamsOnly: true } as TeamInstanceParameters
      );

      let getUserJoinedTeamsMessage = findMessageByFunc("getUserJoinedTeams");
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it("should allow a valid optional parameter set to false", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getUserJoinedTeams(
        userJoinedTeamsInformation => {
          callbackCalled = true;
        },
        { favoriteTeamsOnly: false } as TeamInstanceParameters
      );

      let getUserJoinedTeamsMessage = findMessageByFunc("getUserJoinedTeams");
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it("should allow a missing optional parameter", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getUserJoinedTeams(userJoinedTeamsInformation => {
        callbackCalled = true;
      });

      let getUserJoinedTeamsMessage = findMessageByFunc("getUserJoinedTeams");
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it("should allow a missing and valid optional parameter", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getUserJoinedTeams(
        userJoinedTeamsInformation => {
          callbackCalled = true;
        },
        {} as TeamInstanceParameters
      );

      let getUserJoinedTeamsMessage = findMessageByFunc("getUserJoinedTeams");
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe("tasks.startTask", () => {
    it("should not allow calls before initialization", () => {
      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });

    it("should not allow calls from authentication context", () => {
      initializeWithContext("authentication");

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should not allow calls from remove context", () => {
      initializeWithContext("remove");

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        "This call is not allowed in the 'remove' context"
      );
    });

    it("should not allow calls from task context", () => {
      initializeWithContext("task");

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        "This call is not allowed in the 'task' context"
      );
    });

    it("should pass along entire TaskInfo parameter", () => {
      initializeWithContext("content");

      const taskInfo: TaskInfo = {
        card: "someCard",
        fallbackUrl: "someFallbackUrl",
        height: TaskModuleDimension.Large,
        width: TaskModuleDimension.Large,
        title: "someTitle",
        url: "someUrl",
        completionBotId: "someCompletionBotId"
      };

      tasks.startTask(taskInfo, (err, result) => {
        return;
      });

      const startTaskMessage = findMessageByFunc("tasks.startTask");
      expect(startTaskMessage).not.toBeNull();
      expect(startTaskMessage.args).toEqual([taskInfo]);
    });

    it("should invoke callback with result", () => {
      initializeWithContext("content");

      let callbackCalled = false;
      const taskInfo: TaskInfo = {};
      tasks.startTask(taskInfo, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBe("someResult");
        callbackCalled = true;
      });

      const startTaskMessage = findMessageByFunc("tasks.startTask");
      expect(startTaskMessage).not.toBeNull();
      respondToMessage(startTaskMessage, null, "someResult");
      expect(callbackCalled).toBe(true);
    });

    it("should invoke callback with error", () => {
      initializeWithContext("content");

      let callbackCalled = false;
      const taskInfo: TaskInfo = {};
      tasks.startTask(taskInfo, (err, result) => {
        expect(err).toBe("someError");
        expect(result).toBeUndefined();
        callbackCalled = true;
      });

      const startTaskMessage = findMessageByFunc("tasks.startTask");
      expect(startTaskMessage).not.toBeNull();
      respondToMessage(startTaskMessage, "someError");
      expect(callbackCalled).toBe(true);
    });
  });

  describe("tasks.updateTask", () => {
    it("should not allow calls before initialization", () => {
      // tslint:disable-next-line:no-any
      expect(() => tasks.updateTask({} as any)).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should successfully pass taskInfo", () => {
      initializeWithContext("task");
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = findMessageByFunc("tasks.updateTask");
      expect(updateTaskMessage).not.toBeNull();
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it("should throw an error if extra properties are provided", () => {
      initializeWithContext("task");
      const taskInfo = { width: 10, height: 10, title: "anything" };

      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        "updateTask requires a taskInfo argument containing only width and height"
      );
    });
  });

  describe("tasks.submitTask", () => {
    it("should not allow calls before initialization", () => {
      expect(() => tasks.submitTask()).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");

      expect(() => tasks.submitTask()).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });

    it("should not allow calls from authentication context", () => {
      initializeWithContext("authentication");

      expect(() => tasks.submitTask()).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should not allow calls from remove context", () => {
      initializeWithContext("remove");

      expect(() => tasks.submitTask()).toThrowError(
        "This call is not allowed in the 'remove' context"
      );
    });

    it("should successfully pass result and appIds parameters when called from task context", () => {
      initializeWithContext("task");

      tasks.submitTask("someResult", [
        "someAppId",
        "someOtherAppId"
      ]);

      const submitTaskMessage = findMessageByFunc("tasks.completeTask");
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual([
        "someResult",
        ["someAppId", "someOtherAppId"]
      ]);
    });

    it("should handle a single string passed as appIds parameter", () => {
      initializeWithContext("task");

      tasks.submitTask("someResult", "someAppId");

      const submitTaskMessage = findMessageByFunc("tasks.completeTask");
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(["someResult", ["someAppId"]]);
    });
  });

  describe("sendCustomMessage", () => {
    it("should successfully pass message and provided arguments", () => {
      initializeWithContext("content");

      const id = microsoftTeamsPrivate.sendCustomMessage("customMessage", [
        "arg1",
        2,
        3.0,
        true
      ]);

      let message = findMessageByFunc("customMessage");
      expect(message).not.toBeNull();
      expect(message.args).toEqual(["arg1", 2, 3.0, true]);
      expect(id).toBe(message.id);
    });
  });

  describe("getChatMembers", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        microsoftTeamsPrivate.getChatMembers(() => {
          return;
        })
      ).toThrowError("The library has not yet been initialized");
    });

    it("should successfully get chat members", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getChatMembers(chatMembersInformation => {
        callbackCalled = true;
      });

      let getChatMembersMessage = findMessageByFunc("getChatMembers");
      expect(getChatMembersMessage).not.toBeNull();
      respondToMessage(getChatMembersMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe("registerBeforeUnloadHandler", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        microsoftTeams.registerBeforeUnloadHandler(() => {
          return false;
        })
      ).toThrowError("The library has not yet been initialized");
    });

    it("should successfully register a before unload handler", () => {
      initializeWithContext("content");

      let handlerInvoked = false;
      microsoftTeams.registerBeforeUnloadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      sendMessage("beforeUnload");

      expect(handlerInvoked).toBe(true);
    });

    it("should call readyToUnload automatically when no before unload handler is registered", () => {
      initializeWithContext("content");

      sendMessage("beforeUnload");

      let readyToUnloadMessage = findMessageByFunc("readyToUnload");
      expect(readyToUnloadMessage).not.toBeNull();
    });

    it("should successfully register a before unload handler and not call readyToUnload if it returns true", () => {
      initializeWithContext("content");

      let handlerInvoked = false;
      let readyToUnloadFunc: () => void;
      microsoftTeams.registerBeforeUnloadHandler(readyToUnload => {
        readyToUnloadFunc = readyToUnload;
        handlerInvoked = true;
        return true;
      });

      sendMessage("beforeUnload");

      let readyToUnloadMessage = findMessageByFunc("readyToUnload");
      expect(readyToUnloadMessage).toBeNull();
      expect(handlerInvoked).toBe(true);

      readyToUnloadFunc();
      readyToUnloadMessage = findMessageByFunc("readyToUnload");
      expect(readyToUnloadMessage).not.toBeNull();
    });
  });

  describe("getConfigSetting", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        microsoftTeamsPrivate.getConfigSetting(() => {
          return;
        }, "key")
      ).toThrowError("The library has not yet been initialized");
    });

    it("should allow a valid parameter", () => {
      initializeWithContext("content");

      let callbackCalled: boolean = false;
      microsoftTeamsPrivate.getConfigSetting(
        (value: string) => {
          callbackCalled = true;
        }, "key"
      );

      let getConfigSettingMessage = findMessageByFunc("getConfigSetting");
      expect(getConfigSettingMessage).not.toBeNull();
      respondToMessage(getConfigSettingMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe("enterFullscreen", () => {
    it("should not allow calls before initialization", () => {
      expect(() => microsoftTeamsPrivate.enterFullscreen()).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");

      expect(() => microsoftTeamsPrivate.enterFullscreen()).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });

    it("should not allow calls from authentication context", () => {
      initializeWithContext("authentication");

      expect(() => microsoftTeamsPrivate.enterFullscreen()).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should not allow calls from remove context", () => {
      initializeWithContext("remove");

      expect(() => microsoftTeamsPrivate.enterFullscreen()).toThrowError(
        "This call is not allowed in the 'remove' context"
      );
    });

    it("should not allow calls from task context", () => {
      initializeWithContext("task");

      expect(() => microsoftTeamsPrivate.enterFullscreen()).toThrowError(
        "This call is not allowed in the 'task' context"
      );
    });

    it("should successfully enter fullscreen", () => {
      initializeWithContext("content");

      microsoftTeamsPrivate.enterFullscreen();

      const enterFullscreenMessage = findMessageByFunc("enterFullscreen");
      expect(enterFullscreenMessage).not.toBeNull();
    });
  });

  describe("exitFullscreen", () => {
    it("should not allow calls before initialization", () => {
      expect(() => microsoftTeamsPrivate.exitFullscreen()).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");

      expect(() => microsoftTeamsPrivate.exitFullscreen()).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });

    it("should not allow calls from authentication context", () => {
      initializeWithContext("authentication");

      expect(() => microsoftTeamsPrivate.exitFullscreen()).toThrowError(
        "This call is not allowed in the 'authentication' context"
      );
    });

    it("should not allow calls from remove context", () => {
      initializeWithContext("remove");

      expect(() => microsoftTeamsPrivate.exitFullscreen()).toThrowError(
        "This call is not allowed in the 'remove' context"
      );
    });

    it("should not allow calls from task context", () => {
      initializeWithContext("task");

      expect(() => microsoftTeamsPrivate.exitFullscreen()).toThrowError(
        "This call is not allowed in the 'task' context"
      );
    });

    it("should successfully exit fullscreen", () => {
      initializeWithContext("content");

      microsoftTeamsPrivate.exitFullscreen();

      const exitFullscreenMessage = findMessageByFunc("exitFullscreen");
      expect(exitFullscreenMessage).not.toBeNull();
    });
  });

  describe("conversations.openConversation", () => {
    it("should not allow calls before initialization", () => {
      const conversationRequest: OpenConversationRequest = {
        "subEntityId": "someEntityId",
        "title": "someTitle",
        "entityId": "someEntityId"
      };
      expect(() => conversations.openConversation(conversationRequest)).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");

      const conversationRequest: OpenConversationRequest = {
        "subEntityId": "someEntityId",
        "title": "someTitle",
        "entityId": "someEntityId"
      };
      expect(() => conversations.openConversation(conversationRequest)).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });

    it("should successfully pass conversationRequest", () => {
      initializeWithContext("content");
      const conversationRequest: OpenConversationRequest = {
        "subEntityId": "someEntityId",
        "title": "someTitle",
        "entityId": "someEntityId"
      };

      conversations.openConversation(conversationRequest);

      const openConversationMessage = findMessageByFunc("conversations.openConversation");
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });

    it("should successfully pass conversationRequest in a personal scope", () => {
      initializeWithContext("content");
      const conversationRequest: OpenConversationRequest = {
        "subEntityId": "someEntityId",
        "title": "someTitle",
        "channelId": "someChannelId",
        "entityId": "someEntityId"
      };

      conversations.openConversation(conversationRequest);

      const openConversationMessage = findMessageByFunc("conversations.openConversation");
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });
  });

  describe("conversations.closeConversation", () => {
    it("should not allow calls before initialization", () => {
      expect(() => conversations.closeConversation()).toThrowError(
        "The library has not yet been initialized"
      );
    });

    it("should not allow calls from settings context", () => {
      initializeWithContext("settings");
      expect(() => conversations.closeConversation()).toThrowError(
        "This call is not allowed in the 'settings' context"
      );
    });
  });

  function initializeWithContext(
    frameContext: string,
    hostClientType?: string
  ): void {
    microsoftTeams.initialize(mockWindow);

    const initMessage = findMessageByFunc("initialize");
    expect(initMessage).not.toBeNull();

    respondToMessage(initMessage, frameContext, hostClientType);
  }

  function findMessageByFunc(func: string): MessageRequest {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].func === func) {
        return messages[i];
      }
    }

    return null;
  }

  // tslint:disable-next-line:no-any
  function respondToMessage(message: MessageRequest, ...args: any[]): void {
    processMessage({
      origin: validOrigin,
      source: mockWindow.parent,
      data: {
        id: message.id,
        args: args
      } as MessageResponse
    } as MessageEvent);
  }

  // tslint:disable-next-line:no-any
  function sendMessage(func: string, ...args: any[]): void {
    processMessage({
      origin: validOrigin,
      source: mockWindow.parent,
      data: {
        func: func,
        args: args
      }
    } as MessageEvent);
  }
});
