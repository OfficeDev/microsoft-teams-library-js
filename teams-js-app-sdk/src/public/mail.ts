import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { runtime, RuntimeCapabilities } from './runtime';

export namespace mail {
  export function openMailItem(
    openMailItemParams: OpenMailItemParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Mail)) throw 'Not Supported';

    const messageId = sendMessageRequestToParent('mail.openMailItem', [openMailItemParams]);
    GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
  }
  export function composeMail(
    composeMailParams: ComposeMailParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Mail)) throw 'Not Supported';

    const messageId = sendMessageRequestToParent('mail.composeMail', [composeMailParams]);
    GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
  }

  export interface OpenMailItemParams {
    itemId: string;
  }

  export interface ComposeMailParams {
    toRecipients?: string[];
    ccRecipients?: string[];
    bccRecipients?: string[];
    subject?: string;
    message?: string;
  }
}
