import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

export namespace mail {
  export function openMailItem(openMailItemParams: OpenMailItemParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      if (!openMailItemParams.itemId || !openMailItemParams.itemId.trim()) {
        throw new Error('Must supply an itemId to openMailItem');
      }

      resolve(sendAndHandleError('mail.openMailItem', openMailItemParams));
    });
  }

  export function composeMail(composeMailParams: ComposeMailParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      resolve(sendAndHandleError('mail.composeMail', composeMailParams));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.mail ? true : false;
  }

  export interface OpenMailItemParams {
    itemId: string;
  }

  export enum ComposeMailType {
    New = 'new',
    Reply = 'reply',
    ReplyAll = 'replyAll',
    Forward = 'forward',
  }

  /**
   * Base of a discriminated union between compose scenarios.
   */
  interface ComposeMailBase<T extends ComposeMailType> {
    type: T;
  }
  /**
   * Interfaces for each type.
   */
  export interface ComposeNewParams extends ComposeMailBase<ComposeMailType.New> {
    toRecipients?: string[];
    ccRecipients?: string[];
    bccRecipients?: string[];
    subject?: string;
    message?: string;
  }
  export interface ComposeReplyOrForwardParams<T extends ComposeMailType> extends ComposeMailBase<T> {
    itemid: string;
  }

  export type ComposeMailParams =
    | ComposeNewParams
    | ComposeReplyOrForwardParams<ComposeMailType.Reply>
    | ComposeReplyOrForwardParams<ComposeMailType.ReplyAll>
    | ComposeReplyOrForwardParams<ComposeMailType.Forward>;
}
