import { ensureInitialized, sendMessageRequest } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { version } from '../internal/constants';

export namespace appInitialization {
    /**
     * To notify app loaded to hide loading indicator
     */
    export function notifyAppLoaded(): void {
        ensureInitialized();
        sendMessageRequest(GlobalVars.parentWindow, 'appInitialization.appLoaded', [version]);
    }

    /**
     * To notify app Initialization successs and ready for user interaction
     */
    export function notifySuccess(): void {
        ensureInitialized();
        sendMessageRequest(GlobalVars.parentWindow, 'appInitialization.success', [version]);
    }

    /**
     * To notify app Initialization failed
     */
    export function notifyFailure(appInitializationFailedRequest: appInitialization.IFailedRequest): void {
        ensureInitialized();
        sendMessageRequest(GlobalVars.parentWindow, 'appInitialization.failure', [
            appInitializationFailedRequest.reason,
            appInitializationFailedRequest.message,
        ]);
    }

    export const enum FailedReason {
        AuthFailed = 'AuthFailed',
        Timeout = 'Timeout',
        Other = 'Other',
    }

    export interface IFailedRequest {
        reason: appInitialization.FailedReason;
        message?: string;
    }
}
