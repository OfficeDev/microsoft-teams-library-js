import { meeting } from "../../src/public/meeting";
import { SdkError, ErrorCode } from "../../src/public/interfaces";
import { DOMMessageEvent } from "../../src/internal/interfaces";
import { FramelessPostMocks } from "../framelessPostMocks";
import { _initialize, _uninitialize } from "../../src/public/publicAPIs";

describe("meeting", () => {
  const desktopPlatformMock = new FramelessPostMocks();

  beforeEach(() => {
    desktopPlatformMock.messages = [];
    _initialize(desktopPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe("toggleIncomingClientAudio", () => {
    it('should not allow toggle incoming client audio calls with null callback', () => {
      expect(() => meeting.toggleIncomingClientAudio(null)).toThrowError(
        '[toggle incoming client audio] Callback cannot be null',
      );
    });
    it("should not allow calls before initialization", () => {
      expect(() =>
        meeting.toggleIncomingClientAudio(() => {
          return;
        })
      ).toThrowError("The library has not yet been initialized");
    });

    it("should successfully toggle the incoming client audio", () => {
      desktopPlatformMock.initializeWithContext("content");

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc("toggleIncomingClientAudio");
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      let callbackId = toggleIncomingClientAudioMessage.id;
      // desktopPlatformMock.respondToMessage(toggleIncomingClientAudioMessage, {});
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).toBeNull();
      expect(returnedResult).toBe(true);
    });

    it("should return error code 500", () => {
      desktopPlatformMock.initializeWithContext("content");

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc("toggleIncomingClientAudio");
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      let callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null]
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).not.toBeNull();
      expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(returnedResult).toBe(null);
    });
  });
});
