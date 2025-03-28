import { FrameContexts } from '../public/constants';
import { UUID } from '../public/uuidObject';
export class GlobalVars {
  public static initializeCalled = false;
  public static initializeCompleted = false;
  public static additionalValidOrigins: string[] = [];
  public static initializePromise: Promise<void> | undefined = undefined;
  public static isFramelessWindow = false;
  public static frameContext: FrameContexts | undefined = undefined;
  public static hostClientType: string | undefined = undefined;
  public static clientSupportedSDKVersion: string;
  public static printCapabilityEnabled = false;
  public static readonly teamsJsInstanceId: string = new UUID().toString();
}
