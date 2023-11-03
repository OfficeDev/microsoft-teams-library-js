import { FrameContexts } from '../public';
export class GlobalVars {
  public static initializeCalled = false;
  public static initializeCompleted = false;
  public static additionalValidOrigins: string[] = [];
  public static initializePromise: Promise<void> | null = null;
  public static isFramelessWindow = false;
  public static frameContext: FrameContexts | undefined;
  public static hostClientType: string | undefined;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled = false;
}
