import { ConversationResponse, LoadContext } from '../public/interfaces';
import { FrameContexts } from '../public';
import { meetingRoom } from '../private/meetingRoom';

export class GlobalVars {
  public static initializeCalled: boolean = false;
  public static initializeCompleted: boolean = false;
  public static additionalValidOrigins: string[] = [];
  public static additionalValidOriginsRegexp: RegExp = null;
  public static initializeCallbacks: { (): void }[] = [];
  public static currentWindow: Window | any;
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
}
