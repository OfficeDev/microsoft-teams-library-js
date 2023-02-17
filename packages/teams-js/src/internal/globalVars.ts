import { FrameContexts } from '../public';
import { SupportedCapabilities } from './supportedCapabilities';
export class GlobalVars {
  public static initializeCalled = false;
  public static initializeCompleted = false;
  public static additionalValidOrigins: string[] = [];
  public static initializePromise: Promise<SupportedCapabilities>;
  public static isFramelessWindow = false;
  public static frameContext: FrameContexts;
  public static hostClientType: string;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled = false;
}
