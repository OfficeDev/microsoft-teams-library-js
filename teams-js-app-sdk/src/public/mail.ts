import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { runtime, RuntimeCapabilities } from './runtime';
import { sendMessageToParent } from '../internal/communication';

export namespace mail {
  export function openMailItem(
    openMailItemParams: OpenMailItemParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Mail)) throw 'Not Supported';

    sendMessageToParent(
      'mail.openMailItem',
      [openMailItemParams],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }
  export function composeMail(
    composeMailParams: ComposeMailParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Mail)) throw 'Not Supported';

    sendMessageToParent(
      'mail.composeMail',
      [composeMailParams],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
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
