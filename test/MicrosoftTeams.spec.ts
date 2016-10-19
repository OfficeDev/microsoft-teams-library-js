/// <reference path="../typings/globals/jasmine/index.d.ts" />

describe("MicrosoftTeams", () =>
{
    // Work around bad intellisense from the ambient/non-ambient hack.
    const microsoftTeams = microsoftTeamsImpl;

    const validOrigin = "https://teams.skype.com";

    var mockWindow: Window;

    // Use to send a mock message from the app.
    var processMessage: (ev: MessageEvent) => any;

    // A list of messages the library sends to the app.
    var messages: microsoftTeamsImpl.MessageRequest[];

    beforeEach(() =>
    {
        processMessage = null;
        messages = [];
        mockWindow =
        {
            addEventListener: function(type: string, listener: (ev: MessageEvent) => any, useCapture?: boolean): void
            {
                if (type === "message")
                {
                    processMessage = listener;
                }
            },
            removeEventListener: function(type: string, listener: (ev: MessageEvent) => any, useCapture?: boolean): void
            {
                if (type === "message")
                {
                    processMessage = null;
                }
            },
            parent:
            {
                postMessage: function(message: microsoftTeamsImpl.MessageRequest, targetOrigin: string): void
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
                }
            } as Window,
        } as Window;
        mockWindow["self" + ""] = mockWindow;

        microsoftTeams["_window"] = mockWindow;
    });

    afterEach(() =>
    {
        // Reset the object since it's a singleton
        if (microsoftTeams["_uninitialize"])
        {
            microsoftTeams["_uninitialize"]();
        }
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
        expect(initMessage.args).toEqual([]);
    });

    it("should not allow multiple initialize calls", () =>
    {
        microsoftTeams.initialize();

        expect(() => microsoftTeams.initialize()).toThrowError("initialize must not be called more than once.");
    });

    it("should not allow calls before initialization", () =>
    {
        expect(() => microsoftTeams.getContext(() => {})).toThrowError("The library has not yet been initialized");
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

        processMessage(new MessageEvent("message",
        {
            origin: "https://some-malicious-site.com/",
            data:
            <microsoftTeamsImpl.MessageResponse>{
                id: getContextMessage.id,
                args:
                [{
                    groupId: "someMaliciousValue",
                }]
            }
        }));

        expect(callbackCalled).toBe(false);
    });

    it("should successfully handle calls queued before init completes", () =>
    {
        microsoftTeams.initialize();

        // Another call made before the init response
        microsoftTeams.getContext(() => {});

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

        let actualContext1;
        microsoftTeams.getContext((context) =>
        {
            actualContext1 = context;
        });

        let getContextMessage1 = messages[messages.length - 1];

        let actualContext2;
        microsoftTeams.getContext((context) =>
        {
            actualContext2 = context;
        });

        let getContextMessage2 = messages[messages.length - 1];

        let actualContext3;
        microsoftTeams.getContext((context) =>
        {
            actualContext3 = context;
        });

        let getContextMessage3 = messages[messages.length - 1];

        // They're all distinct messages
        expect(getContextMessage3).not.toBe(getContextMessage1);
        expect(getContextMessage2).not.toBe(getContextMessage1);
        expect(getContextMessage3).not.toBe(getContextMessage2);

        let expectedContext1 = { groupId: "someGroupId1" };
        let expectedContext2 = { groupId: "someGroupId2" };
        let expectedContext3 = { groupId: "someGroupId3" };

        // respond in the wrong order
        respondToMessage(getContextMessage3, expectedContext3);
        respondToMessage(getContextMessage1, expectedContext1);
        respondToMessage(getContextMessage2, expectedContext2);

        // The callbacks were associated with the correct messages
        expect(actualContext1).toBe(expectedContext1);
        expect(actualContext2).toBe(expectedContext2);
        expect(actualContext3).toBe(expectedContext3);
    });

    it("should successfully get context", () =>
    {
        initializeWithContext("content");

        let actualContext;
        microsoftTeams.getContext((context) =>
        {
            actualContext = context;
        });

        let getContextMessage = findMessageByFunc("getContext");
        expect(getContextMessage).not.toBeNull();

        let expectedContext =
        {
            groupId: "someGroupId",
        };

        respondToMessage(getContextMessage, expectedContext);

        expect(actualContext).toBe(expectedContext);
    });

    it("should successfully register a theme change handler", () =>
    {
        initializeWithContext("content");

        let newTheme;
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

        let actualSettings;
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

        var message = findMessageByFunc("settings.save.success");
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
        var message = findMessageByFunc("settings.save.success");
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
        var message = findMessageByFunc("settings.save.failure");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe("someReason");
    });

    it("should successfully notify success on remove when there is no registered handler", () =>
    {
        initializeWithContext("remove");

        sendMessage("settings.remove");

        var message = findMessageByFunc("settings.remove.success");
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
        var message = findMessageByFunc("settings.remove.success");
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
        var message = findMessageByFunc("settings.remove.failure");
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
        var message = findMessageByFunc("settings.save.success");
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
    });

    it("should successfully pop up the auth window", () =>
    {
        initializeWithContext("content");

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

    it("should successfully handle auth success", () =>
    {
        initializeWithContext("content");

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

    it("should successfully handle auth failure", () =>
    {
        initializeWithContext("content");

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

    function initializeWithContext(frameContext: string): void
    {
        microsoftTeams.initialize();

        let initMessage = findMessageByFunc("initialize");
        expect(initMessage).not.toBeNull();

        respondToMessage(initMessage, frameContext);
    }

    function findMessageByFunc(func: string): microsoftTeamsImpl.MessageRequest
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

    function respondToMessage(message: microsoftTeamsImpl.MessageRequest, ...args: any[]): void
    {
        processMessage(new MessageEvent("message",
        {
            origin: validOrigin,
            data:
            <microsoftTeamsImpl.MessageResponse>{
                id: message.id,
                args: args,
            }
        }));
    }

    function sendMessage(func: string, ...args: any[]): void
    {
        processMessage(new MessageEvent("message",
        {
            origin: validOrigin,
            data:
            {
                func: func,
                args: args,
            }
        }));
    }
});