import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { SdkError } from './interfaces';
import { runtime } from './runtime';

export namespace monetization {
  /**
   * @hidden
   * Data structure to represent a subscription plan.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface PlanInfo {
    /**
     * @hidden
     * plan id
     */
    planId: string;
    /**
     * @hidden
     * term of the plan
     */
    term: string;
  }

  /**
   * @hidden
   * Open dialog to start user's purchase experience
   *
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function openPurchaseExperience(planInfo?: PlanInfo): Promise<void>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link monetization.openPurchaseExperience monetization.openPurchaseExperience(planInfo?: PlanInfo): Promise\<void\>} instead.
   *
   * @hidden
   * Open dialog to start user's purchase experience
   *
   * @param callback Callback contains 1 parameters, error.
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function openPurchaseExperience(callback: (error: SdkError | null) => void, planInfo?: PlanInfo): void;
  /**
   * @hidden
   * This function is the overloaded implementation of openPurchaseExperience.
   * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
   * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
   * @param param1
   * @param param2
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   */
  export function openPurchaseExperience(
    param1: ((error: SdkError | null) => void) | PlanInfo | undefined,
    param2?: PlanInfo,
  ): Promise<void> {
    let callback: ((error: SdkError | null) => void) | undefined;
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    let planInfo: PlanInfo;
    if (typeof param1 === 'function') {
      callback = param1;
      planInfo = param2;
    } else {
      planInfo = param1;
    }
    const wrappedFunction: InputFunction<void> = () => {
      return new Promise<void>((resolve) => {
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndHandleSdkError('monetization.openPurchaseExperience', planInfo));
      });
    };

    ensureInitialized(runtime, FrameContexts.content);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(wrappedFunction, callback);
  }

  /**
   * @hidden
   *
   * Checks if the monetization capability is supported by the host
   * @returns boolean to represent whether the monetization capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.monetization ? true : false;
  }
}
