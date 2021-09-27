import { FrameContexts } from '../public';
export class GlobalVars {
  public static initializeCalled = false;
  public static initializeCompleted = false;
  public static additionalValidOrigins: string[] = [];
  public static additionalValidOriginsRegexp: RegExp = null;
  public static initializeCallbacks: { (): void }[] = [];
  public static isFramelessWindow = false;
  public static frameContext: FrameContexts;
  public static hostClientType: string;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled = false;
}
