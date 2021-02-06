import { ConversationResponse, LoadContext } from '../public/interfaces';
import { FrameContexts } from '../public';

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
  public static backButtonPressHandler: () => boolean;
  public static loadHandler: (context: LoadContext) => void;
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
}
