import * as microsoftTeams from "../src/MicrosoftTeams";
import * as microsoftTeamsAsync from "../src/MicrosoftTeamsAsync";
import { MessageRequest } from "./MicrosoftTeams.spec";
describe("MicrosoftTeamsAsync", () => {
  const validOrigin = "https://teams.microsoft.com";
  const tabOrigin = "https://example.com";

  // Use to send a mock message from the app.
  let processMessage: (ev: MessageEvent) => void;

  // A list of messages the library sends to the app.
  let messages: MessageRequest[];

  // A list of messages the library sends to the auth popup.
  let childMessages: MessageRequest[];

  let childWindow = {
    postMessage: function(message: MessageRequest, targetOrigin: string): void {
      childMessages.push(message);
    },
    close: function(): void {
      return;
    },
    closed: false
  };

  let mockWindow = {
    outerWidth: 1024,
    outerHeight: 768,
    screenLeft: 0,
    screenTop: 0,
    addEventListener: function(
      type: string,
      listener: (ev: MessageEvent) => void,
      useCapture?: boolean
    ): void {
      if (type === "message") {
        processMessage = listener;
      }
    },
    removeEventListener: function(
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
      assign: function(url: string): void {
        return;
      }
    },
    parent: {
      postMessage: function(
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
    open: function(url: string, name: string, specs: string): Window {
      return childWindow as Window;
    },
    close: function(): void {
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

  it("should return a context async", () => {
    microsoftTeams.initialize(mockWindow);

    // Another call made before the init response
    microsoftTeamsAsync.getContextAsync().then(context => {
      expect(context).not.toBeNull();
    });
  });
});
