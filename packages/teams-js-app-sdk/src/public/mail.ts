import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';
import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';

export namespace mail {
  export function openMailItem(openMailItemParams: OpenMailItemParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) throw 'Not Supported';

      resolve(sendAndHandleError('mail.openMailItem', openMailItemParams));
    });
  }
  export function composeMail(composeMailParams: ComposeMailParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) throw 'Not Supported';

      resolve(sendAndHandleError('mail.composeMail', composeMailParams));
    });
  }
  export function isSupported(): boolean {
    return runtime.supports.mail ? true : false;
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
