import { FrameContexts } from '../public';
import { ErrorCode, SdkError } from '../public/interfaces';
import { errorLibraryNotInitialized } from './constants';
import { GlobalVars } from './globalVars';

export namespace errors {
  export class TeamsJSError extends Error {
    public readonly errorCode: ErrorCode;
    public constructor(errorCode: ErrorCode, message: string) {
      super(`${errorCode} | ${message}`); // This will make sure that errors that use the same message value don't get confused by callers or test frameworks
      this.errorCode = errorCode;
    }
  }

  // These are functions so the callstack is generated each time it is created
  export function errorFromHost(sdkError: SdkError): TeamsJSError {
    return new TeamsJSError(sdkError.errorCode, sdkError.message ?? 'No additional details available');
  }

  export function notSupportedOnPlatform(): TeamsJSError {
    return new TeamsJSError(ErrorCode.NOT_SUPPORTED_ON_PLATFORM, 'This call not supported on this platform');
  }

  export function invalidArguments(): TeamsJSError {
    return new TeamsJSError(ErrorCode.INVALID_ARGUMENTS, 'Incorrect arguments passed to function');
  }

  export function wrongFrameContext(expectedFrameContexts: FrameContexts[]): TeamsJSError {
    return new TeamsJSError(
      ErrorCode.CALLED_FROM_WRONG_FRAME_CONTEXT,
      `This call is only allowed in following contexts: ${JSON.stringify(expectedFrameContexts)}. Current context: "${
        GlobalVars.frameContext
      }".`,
    );
  }

  export function libraryNotInitialized(): TeamsJSError {
    return new TeamsJSError(ErrorCode.LIBRARY_NOT_INITIALIZED, errorLibraryNotInitialized);
  }
}
