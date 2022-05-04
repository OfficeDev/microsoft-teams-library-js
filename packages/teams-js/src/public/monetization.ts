import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { SdkError } from './interfaces';
import { runtime } from './runtime';

export namespace monetization {
  /**
   * @hidden
   * Hide from docs
   * Data structure to represent a subscription plan.
   *
   * @internal
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
   * Hide from docs
   * Open dialog to start user's purchase experience
   *
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   *
   * @internal
   */
  export function openPurchaseExperience(planInfo?: PlanInfo): Promise<void>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link monetization.openPurchaseExperience monetization.openPurchaseExperience(planInfo?: PlanInfo): Promise\<void\>} instead.
   *
   * @hidden
   * Hide from docs
   * Open dialog to start user's purchase experience
   *
   * @param callback Callback contains 1 parameters, error.
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   *
   * @internal
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
    let callback: (error: SdkError | null) => void;
    let planInfo: PlanInfo;
    if (typeof param1 === 'function') {
      callback = param1;
      planInfo = param2;
    } else {
      planInfo = param1;
    }
    const wrappedFunction: InputFunction<void> = () => {
      return new Promise<void>(resolve => {
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndHandleSdkError('monetization.openPurchaseExperience', planInfo));
      });
    };

    ensureInitialized(FrameContexts.content);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(wrappedFunction, callback);
  }

  export function isSupported(): boolean {
    return runtime.supports.monetization ? true : false;
  }
}
