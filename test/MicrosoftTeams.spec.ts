/// <reference path="../typings/index.d.ts" />
/// <reference path="../src/MicrosoftTeams.ts" />

// Undocumented members only used for unit testing.
declare namespace microsoftTeams
{
    let _window: Window;

    function _uninitialize(): void;
}

interface MessageRequest
{
    id: number;
    func: string;
    args?: any[]; // tslint:disable-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
}

interface MessageResponse
{
    id: number;
    args?: any[]; // tslint:disable-line:no-any:The args here are a passthrough from OnMessage where we do receive any[] */
}

describe("MicrosoftTeams", () =>
{
    const validOrigin = "https://teams.skype.com";
    const tabOrigin = "https://example.com";

    // Use to send a mock message from the app.
    let processMessage: (ev: MessageEvent) => void;

    // A list of messages the library sends to the app.
    let messages: MessageRequest[];

    let childWindow =
    {
        close: function (): void
        {
            return;
        },
    };

    beforeEach(() =>
    {
        processMessage = null;
        messages = [];
        let mockWindow =
        {
            outerWidth: 1024,
            outerHeight: 768,
            screenLeft: 0,
            screenTop: 0,
            addEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void
            {
                if (type === "message")
                {
                    processMessage = listener;
                }
            },
            removeEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void
            {
                if (type === "message")
                {
                    processMessage = null;
                }
            },
            location:
            {
                origin: tabOrigin,
            },
            parent:
            {
                postMessage: function(message: MessageRequest, targetOrigin: string): void
                {
                    if (message.func === "initialize")
                    {
                        expect(targetOrigin).toEqual("*");
                    }
                    else
                    {
                        expect(targetOrigin).toEqual(validOrigin);
                    }

                    messages.push(message);
                },
            } as Window,
            self: null as Window,
            open: function (url: string, name: string, specs: string): Window
            {
                return childWindow as Window;
            },
            close: function (): void
            {
                return;
            },
        };
        microsoftTeams._window = mockWindow.self = mockWindow as Window;

        jasmine.clock().install();
    });

    afterEach(() =>
    {
        // Reset the object since it's a singleton
        if (microsoftTeams._uninitialize)
        {
            microsoftTeams._uninitialize();
        }

        // Clear local storage values
        localStorage.removeItem("authentication.success");
        localStorage.removeItem("authentication.failure");

        jasmine.clock().uninstall();
    });

    it("should exist in the global namespace", () =>
    {
        expect(microsoftTeams).toBeDefined();
    });

    it("should successfully initialize", () =>
    {
        microsoftTeams.initialize();

        expect(processMessage).toBeDefined();
        expect(messages.length).toBe(1);

        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();
        expect(initMessage.id).toBe(0);
        expect(initMessage.func).toBe("initialize");
        expect(initMessage.args).toEqual(["0.3"]);
    });

    it("should allow multiple initialize calls", () =>
    {
        for (let i = 0; i < 100; i++)
        {
            microsoftTeams.initialize();
        }

        // Still only one message actually sent, the extra calls just no-op'ed
        expect(processMessage).toBeDefined();
        expect(messages.length).toBe(1);
    });

    it("should not allow calls before initialization", () =>
    {
        expect(() => microsoftTeams.getContext(() => { return; })).toThrowError("The library has not yet been initialized");
    });

    it("should not allow calls from the wrong context", () =>
    {
        initializeWithContext("content");

        expect(() => microsoftTeams.settings.setValidityState(true)).toThrowError("This call is not allowed in the 'content' context");
    });

    it("should reject messages from unsupported domains", () =>
    {
        initializeWithContext("content");

        let callbackCalled = false;
        microsoftTeams.getContext(() =>
        {
            callbackCalled = true;
        });

        let getContextMessage = findMessageByFunc("getContext");
        expect(getContextMessage).not.toBeNull();

        processMessage(
        {
            origin: "https://some-malicious-site.com/",
            source: microsoftTeams._window.parent,
            data:
            {
                id: getContextMessage.id,
                args:
                [{
                    groupId: "someMaliciousValue",
                }],
            } as MessageResponse,
        } as MessageEvent);

        expect(callbackCalled).toBe(false);
    });

    it("should not make calls to unsupported domains", () =>
    {
        microsoftTeams.initialize();

        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();

        processMessage(
        {
            origin: "https://some-malicious-site.com/",
            source: microsoftTeams._window.parent,
            data:
            {
                id: initMessage.id,
                args:
                [
                    "content",
                ],
            } as MessageResponse,
        } as MessageEvent);

        // Try to make a call
        microsoftTeams.getContext(() => { return; });

        // Only the init call went out
        expect(messages.length).toBe(1);
    });

    it("should successfully handle calls queued before init completes", () =>
    {
        microsoftTeams.initialize();

        // Another call made before the init response
        microsoftTeams.getContext(() => { return; });

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

    it("should successfully handle out of order calls", () =>
    {
        initializeWithContext("content");

        let actualContext1: microsoftTeams.Context;
        microsoftTeams.getContext((context) =>
        {
            actualContext1 = context;
        });

        let getContextMessage1 = messages[messages.length - 1];

        let actualContext2: microsoftTeams.Context;
        microsoftTeams.getContext((context) =>
        {
            actualContext2 = context;
        });

        let getContextMessage2 = messages[messages.length - 1];

        let actualContext3: microsoftTeams.Context;
        microsoftTeams.getContext((context) =>
        {
            actualContext3 = context;
        });

        let getContextMessage3 = messages[messages.length - 1];

        // They're all distinct messages
        expect(getContextMessage3).not.toBe(getContextMessage1);
        expect(getContextMessage2).not.toBe(getContextMessage1);
        expect(getContextMessage3).not.toBe(getContextMessage2);

        let expectedContext1: microsoftTeams.Context = { locale: "someLocale1", groupId: "someGroupId1" };
        let expectedContext2: microsoftTeams.Context = { locale: "someLocale2", groupId: "someGroupId2" };
        let expectedContext3: microsoftTeams.Context = { locale: "someLocale3", groupId: "someGroupId3" };

        // respond in the wrong order
        respondToMessage(getContextMessage3, expectedContext3);
        respondToMessage(getContextMessage1, expectedContext1);
        respondToMessage(getContextMessage2, expectedContext2);

        // The callbacks were associated with the correct messages
        expect(actualContext1).toBe(expectedContext1);
        expect(actualContext2).toBe(expectedContext2);
        expect(actualContext3).toBe(expectedContext3);
    });

    it("should only call callbacks once", () =>
    {
        initializeWithContext("content");

        let callbackCalled = 0;
        microsoftTeams.getContext((context) =>
        {
            callbackCalled++;
        });

        let getContextMessage = findMessageByFunc("getContext");
        expect(getContextMessage).not.toBeNull();

        let expectedContext: microsoftTeams.Context =
        {
            locale: "someLocale",
            groupId: "someGroupId",
        };

        // Get many responses to the same message
        for (let i = 0; i < 100; i++)
        {
            respondToMessage(getContextMessage, expectedContext);
        }

        // Still only called the callback once.
        expect(callbackCalled).toBe(1);
    });

    it("should successfully get context", () =>
    {
        initializeWithContext("content");

        let actualContext: microsoftTeams.Context;
        microsoftTeams.getContext((context) =>
        {
            actualContext = context;
        });

        let getContextMessage = findMessageByFunc("getContext");
        expect(getContextMessage).not.toBeNull();

        let expectedContext: microsoftTeams.Context =
        {
            locale: "someLocale",
            groupId: "someGroupId",
        };

        respondToMessage(getContextMessage, expectedContext);

        expect(actualContext).toBe(expectedContext);
    });

    it("should successfully register a theme change handler", () =>
    {
        initializeWithContext("content");

        let newTheme: string;
        microsoftTeams.registerOnThemeChangeHandler((theme) =>
        {
            newTheme = theme;
        });

        sendMessage("themeChange", "someTheme");

        expect(newTheme).toBe("someTheme");
    });

    it("should successfully navigate cross-origin", () =>
    {
        initializeWithContext("content");

        microsoftTeams.navigateCrossDomain("https://valid.origin.com");

        let message = findMessageByFunc("navigateCrossDomain");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe("https://valid.origin.com");
    });

    it("should throw on invalid cross-origin navigation request", () =>
    {
        initializeWithContext("settings");

        microsoftTeams.navigateCrossDomain("https://invalid.origin.com");

        let navigateCrossDomainMessage = findMessageByFunc("navigateCrossDomain");
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe("https://invalid.origin.com");

        let respondWithFailure = () =>
        {
            respondToMessage(navigateCrossDomainMessage, false);
        };

        expect(respondWithFailure).toThrow();
    });

    it("should successfully set validity state to true", () =>
    {
        initializeWithContext("settings");

        microsoftTeams.settings.setValidityState(true);

        let message = findMessageByFunc("settings.setValidityState");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(true);
    });

    it("should successfully set validity state to false", () =>
    {
        initializeWithContext("settings");

        microsoftTeams.settings.setValidityState(false);

        let message = findMessageByFunc("settings.setValidityState");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(false);
    });

    it("should successfully get settings", () =>
    {
        initializeWithContext("settings");

        let actualSettings: microsoftTeams.settings.Settings;
        microsoftTeams.settings.getSettings((settings) =>
        {
            actualSettings = settings;
        });

        let message = findMessageByFunc("settings.getSettings");
        expect(message).not.toBeNull();

        let expectedSettings =
        {
            suggestedDisplayName: "someSuggestedDisplayName",
            contentUrl: "someContentUrl",
            websiteUrl: "someWebsiteUrl",
            customSettings: "someCustomSettings",
        };

        respondToMessage(message, expectedSettings);

        expect(actualSettings).toBe(expectedSettings);
    });

    it("should successfully set settings", () =>
    {
        initializeWithContext("settings");

        let settings =
        {
            suggestedDisplayName: "someSuggestedDisplayName",
            contentUrl: "someContentUrl",
            websiteUrl: "someWebsiteUrl",
            customSettings: "someCustomSettings",
        };
        microsoftTeams.settings.setSettings(settings);

        let message = findMessageByFunc("settings.setSettings");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(settings);
    });

    it("should successfully register a save handler", () =>
    {
        initializeWithContext("settings");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
            handlerCalled = true;
        });

        sendMessage("settings.save");

        expect(handlerCalled).toBe(true);
    });

    it("should successfully register a remove handler", () =>
    {
        initializeWithContext("remove");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnRemoveHandler((removeEvent) =>
        {
            handlerCalled = true;
        });

        sendMessage("settings.remove");

        expect(handlerCalled).toBe(true);
    });

    it("should successfully override a save handler with another", () =>
    {
        initializeWithContext("settings");

        let handler1Called = false;
        let handler2Called = false;
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
            handler1Called = true;
        });
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
            handler2Called = true;
        });

        sendMessage("settings.save");

        expect(handler1Called).toBe(false);
        expect(handler2Called).toBe(true);
    });

    it("should successfully notify success on save when there is no registered handler", () =>
    {
        initializeWithContext("settings");

        sendMessage("settings.save");

        let message = findMessageByFunc("settings.save.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully notify success from the registered save handler", () =>
    {
        initializeWithContext("settings");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
            saveEvent.notifySuccess();
            handlerCalled = true;
        });

        sendMessage("settings.save");

        expect(handlerCalled).toBe(true);
        let message = findMessageByFunc("settings.save.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully notify failure from the registered save handler", () =>
    {
        initializeWithContext("settings");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
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

    it("should successfully notify success on remove when there is no registered handler", () =>
    {
        initializeWithContext("remove");

        sendMessage("settings.remove");

        let message = findMessageByFunc("settings.remove.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully notify success from the registered remove handler", () =>
    {
        initializeWithContext("remove");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnRemoveHandler((removeEvent) =>
        {
            removeEvent.notifySuccess();
            handlerCalled = true;
        });

        sendMessage("settings.remove");

        expect(handlerCalled).toBe(true);
        let message = findMessageByFunc("settings.remove.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully notify failure from the registered remove handler", () =>
    {
        initializeWithContext("remove");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnRemoveHandler((removeEvent) =>
        {
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

    it("should not allow multiple notifies from the registered save handler", () =>
    {
        initializeWithContext("settings");

        let handlerCalled = false;
        microsoftTeams.settings.registerOnSaveHandler((saveEvent) =>
        {
            saveEvent.notifySuccess();
            expect(() => saveEvent.notifySuccess()).toThrowError("The SaveEvent may only notify success or failure once.");
            expect(() => saveEvent.notifyFailure()).toThrowError("The SaveEvent may only notify success or failure once.");
            handlerCalled = true;
        });

        sendMessage("settings.save");

        expect(handlerCalled).toBe(true);
        let message = findMessageByFunc("settings.save.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully pop up the auth window", () =>
    {
        initializeWithContext("content");

        let windowOpenCalled = false;
        spyOn(microsoftTeams._window, "open").and.callFake((url: string, name: string, specs: string): Window =>
        {
            expect(url).toEqual("https://someurl/");
            expect(name).toEqual("_blank");
            expect(specs.indexOf("width=100")).not.toBe(-1);
            expect(specs.indexOf("height=200")).not.toBe(-1);
            windowOpenCalled = true;
            return childWindow as Window;
        });

        let authenticationParams =
        {
            url: "https://someurl/",
            width: 100,
            height: 200,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);
        expect(windowOpenCalled).toBe(true);
    });

    it("should successfully handle auth success", () =>
    {
        initializeWithContext("content");

        let successResult: string;
        let failureReason: string;
        let authenticationParams =
        {
            url: "https://someurl/",
            width: 100,
            height: 200,
            successCallback: (result: string) => successResult = result,
            failureCallback: (reason: string) => failureReason = reason,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);

        processMessage(
        {
            origin: tabOrigin,
            source: childWindow,
            data:
            {
                id: 0,
                func: "authentication.authenticate.success",
                args: ["someResult"],
            },
        } as MessageEvent);

        expect(successResult).toEqual("someResult");
        expect(failureReason).toBeUndefined();
    });

    it("should successfully handle auth failure", () =>
    {
        initializeWithContext("content");

        let successResult: string;
        let failureReason: string;
        let authenticationParams =
        {
            url: "https://someurl/",
            width: 100,
            height: 200,
            successCallback: (result: string) => successResult = result,
            failureCallback: (reason: string) => failureReason = reason,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);

        processMessage(
        {
            origin: tabOrigin,
            source: childWindow,
            data:
            {
                id: 0,
                func: "authentication.authenticate.failure",
                args: ["someReason"],
            },
        } as MessageEvent);

        expect(successResult).toBeUndefined();
        expect(failureReason).toEqual("someReason");
    });

    it("should successfully pop up the auth window in the desktop client", () =>
    {
        initializeWithContext("content", "desktop");

        let authenticationParams =
        {
            url: "https://someUrl",
            width: 100,
            height: 200,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(3);
        expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + "/");
        expect(message.args[1]).toBe(authenticationParams.width);
        expect(message.args[2]).toBe(authenticationParams.height);
    });

    it("should successfully handle auth success in the desktop client", () =>
    {
        initializeWithContext("content", "desktop");

        let successResult: string;
        let failureReason: string;
        let authenticationParams =
        {
            url: "https://someUrl",
            width: 100,
            height: 200,
            successCallback: (result: string) => successResult = result,
            failureCallback: (reason: string) => failureReason = reason,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();

        respondToMessage(message, true, "someResult");

        expect(successResult).toBe("someResult");
        expect(failureReason).toBeUndefined();
    });

    it("should successfully handle auth failure in the desktop client", () =>
    {
        initializeWithContext("content", "desktop");

        let successResult: string;
        let failureReason: string;
        let authenticationParams =
        {
            url: "https://someUrl",
            width: 100,
            height: 200,
            successCallback: (result: string) => successResult = result,
            failureCallback: (reason: string) => failureReason = reason,
        };
        microsoftTeams.authentication.authenticate(authenticationParams);

        let message = findMessageByFunc("authentication.authenticate");
        expect(message).not.toBeNull();

        respondToMessage(message, false, "someReason");

        expect(successResult).toBeUndefined();
        expect(failureReason).toBe("someReason");
    });

    it("should successfully notify auth success", () =>
    {
        initializeWithContext("authentication");

        microsoftTeams.authentication.notifySuccess("someResult");

        let message = findMessageByFunc("authentication.authenticate.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe("someResult");
    });

    it("should successfully notify auth failure", () =>
    {
        initializeWithContext("authentication");

        microsoftTeams.authentication.notifyFailure("someReason");

        let message = findMessageByFunc("authentication.authenticate.failure");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe("someReason");
    });

    it("should not close auth window before notify success message has been sent", () =>
    {
        let closeWindowSpy = spyOn(microsoftTeams._window, "close").and.callThrough();

        microsoftTeams.initialize();
        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();

        microsoftTeams.authentication.notifySuccess("someResult");
        let message = findMessageByFunc("authentication.authenticate.success");
        expect(message).toBeNull();
        expect(closeWindowSpy).not.toHaveBeenCalled();

        respondToMessage(initMessage, "authentication");
        message = findMessageByFunc("authentication.authenticate.success");
        expect(message).not.toBeNull();

        jasmine.clock().tick(101);
        expect(closeWindowSpy).toHaveBeenCalled();
    });

    it("should not close auth window before notify failure message has been sent", () =>
    {
        let closeWindowSpy = spyOn(microsoftTeams._window, "close").and.callThrough();

        microsoftTeams.initialize();
        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();

        microsoftTeams.authentication.notifyFailure("someReason");
        let message = findMessageByFunc("authentication.authenticate.failure");
        expect(message).toBeNull();
        expect(closeWindowSpy).not.toHaveBeenCalled();

        respondToMessage(initMessage, "authentication");
        message = findMessageByFunc("authentication.authenticate.failure");
        expect(message).not.toBeNull();

        jasmine.clock().tick(101);
        expect(closeWindowSpy).toHaveBeenCalled();
    });

    it("should successfully share a deep link", () =>
    {
        initializeWithContext("content");

        microsoftTeams.shareDeepLink({
            deepLinkContext: "someDeepLinkContext",
            label: "someLabel",
            webUrl: "someWebUrl",
        });

        let message = findMessageByFunc("shareDeepLink");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(3);
        expect(message.args[0]).toBe("someDeepLinkContext");
        expect(message.args[1]).toBe("someLabel");
        expect(message.args[2]).toBe("someWebUrl");
    });

    function initializeWithContext(frameContext: string, hostClientType?: string): void
    {
        microsoftTeams.initialize();

        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();

        respondToMessage(initMessage, frameContext, hostClientType);
    }

    function findMessageByFunc(func: string): MessageRequest
    {
        for (let i = 0; i < messages.length; i++)
        {
            if (messages[i].func === func)
            {
                return messages[i];
            }
        }

        return null;
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to MessageResponse
    function respondToMessage(message: MessageRequest, ...args: any[]): void
    {
        processMessage(
        {
            origin: validOrigin,
            source: microsoftTeams._window.parent,
            data:
            {
                id: message.id,
                args: args,
            } as MessageResponse,
        } as MessageEvent);
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to MessageRequest
    function sendMessage(func: string, ...args: any[]): void
    {
        processMessage(
        {
            origin: validOrigin,
            source: microsoftTeams._window.parent,
            data:
            {
                func: func,
                args: args,
            },
        } as MessageEvent);
    }
});
