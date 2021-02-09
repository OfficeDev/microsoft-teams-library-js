import { ConversationResponse, LoadContext } from '../public/interfaces';
import { FrameContexts } from '../public';
import { meetingRoom } from '../private/meetingRoom';
import { remoteCamera } from '../private/remoteCamera';

export class GlobalVars {
  public static initializeCalled: boolean = false;
  public static initializeCompleted: boolean = false;
  public static additionalValidOrigins: string[] = [];
  public static additionalValidOriginsRegexp: RegExp = null;
  public static initializeCallbacks: { (): void }[] = [];
  public static isFramelessWindow: boolean = false;
  public static frameContext: FrameContexts;
  public static hostClientType: string;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled: boolean = false;
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
