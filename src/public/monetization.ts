import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace monetization {
  /**
   * @private
   * Hide from docs
   * Data structure to represent a subscription plan.
   */
  export interface PlanInfo {
    /**
     * plan id
     */
    planId: string;
    /**
     * term of the plan
     */
    term: string;
  }

  /**
   * @private
   * Hide from docs
   * Open dialog to start user's purchase experience
   * @param callback Callback contains 1 parameters, error.
   * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   */
  export function openPurchaseExperience(callback: (error: SdkError | null) => void, planInfo?: PlanInfo): void {
    if (!callback) {
      throw new Error('[open purchase experience] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('monetization.openPurchaseExperience', [planInfo], callback);
  }
}
