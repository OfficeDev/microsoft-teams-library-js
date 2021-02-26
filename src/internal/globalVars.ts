import { MessageRequest } from './interfaces';
import { ConversationResponse, LoadContext } from '../public/interfaces';
import { FrameContexts } from '../public';
import { meetingRoom } from '../private/meetingRoom';
import { remoteCamera } from '../private/remoteCamera';
export class GlobalVars {
  public static initializeCalled = false;
  public static initializeCompleted = false;
  public static additionalValidOrigins: string[] = [];
  public static additionalValidOriginsRegexp: RegExp = null;
  public static initializeCallbacks: { (): void }[] = [];
  public static currentWindow: Window | any;
  public static parentWindow: Window | any;
  public static isFramelessWindow = false;
  public static parentOrigin: string;
  public static frameContext: FrameContexts;
  public static childWindow: Window;
  public static childOrigin: string;
  public static parentMessageQueue: MessageRequest[] = [];
  public static childMessageQueue: MessageRequest[] = [];
  public static nextMessageId = 0;
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static callbacks: {
    [id: number]: Function;
  } = {};
  public static hostClientType: string;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled = false;
  public static themeChangeHandler: (theme: string) => void;
  public static fullScreenChangeHandler: (isFullScreen: boolean) => void;
  public static backButtonPressHandler: () => boolean;
  public static loadHandler: (context: LoadContext) => void;
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
  public static changeSettingsHandler: () => void;
  public static onStartConversationHandler: (conversationResponse: ConversationResponse) => void;
  public static onCloseConversationHandler: (conversationResponse: ConversationResponse) => void;
  public static getLogHandler: () => string;
  public static appButtonClickHandler: () => void;
  public static appButtonHoverEnterHandler: () => void;
  public static appButtonHoverLeaveHandler: () => void;
  public static meetingRoomCapabilitiesUpdateHandler: (capabilities: meetingRoom.MeetingRoomCapability) => void;
  public static meetingRoomStatesUpdateHandler: (states: meetingRoom.MeetingRoomState) => void;
  public static remoteCameraCapableParticipantsChangeHandler: (participantChange: remoteCamera.Participant[]) => void;
  public static remoteCameraErrorHandler: (error: remoteCamera.ErrorReason) => void;
  public static remoteCameraDeviceStateChangeHandler: (deviceStateChange: remoteCamera.DeviceState) => void;
  public static remoteCameraSessionStatusChangeHandler: (sessionStatusChange: remoteCamera.SessionStatus) => void;
}
