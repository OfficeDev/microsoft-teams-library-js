import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { SdkError } from './interfaces';

/**
 * @alpha
 */
export namespace monetization {
  /**
   * @privateRemarks
   * Hide from docs
   * Data structure to represent a subscription plan.
   *
   * @internal
   */
  export interface PlanInfo {
    /**
     * @privateRemarks
     * plan id
     */
    planId: string;
    /**
     * @privateRemarks
     * term of the plan
     */
    term: string;
  }

  /**
   * @privateRemarks
   * Hide from docs
   * Open dialog to start user's purchase experience
   *
   * @param callback Callback contains 1 parameters, error.
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   *
   * @internal
   */
  export function openPurchaseExperience(callback: (error: SdkError | null) => void, planInfo?: PlanInfo): void {
    if (!callback) {
      throw new Error('[open purchase experience] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('monetization.openPurchaseExperience', [planInfo], callback);
  }
}
