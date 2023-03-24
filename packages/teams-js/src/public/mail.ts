import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

export namespace mail {
  export function openMailItem(openMailItemParams: OpenMailItemParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
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
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      resolve(sendAndHandleError('mail.composeMail', composeMailParams));
    });
  }

  /**
   * Checks if the mail capability is supported by the host
   * @returns boolean to represent whether the mail capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.mail ? true : false;
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
   * Foundational interface for all other mail compose interfaces
   * Used to holding the type of mail item being composed
   *
   * @see {@link ComposeMailType}
   */
  interface ComposeMailBase<T extends ComposeMailType> {
    type: T;
  }

  /**
   * Parameters supplied when composing a new mail item
   */
  export interface ComposeNewParams extends ComposeMailBase<ComposeMailType.New> {
    /**
     * The To: recipients for the message
     */
    toRecipients?: string[];

    /**
     * The Cc: recipients for the message
     */
    ccRecipients?: string[];

    /**
     * The Bcc: recipients for the message
     */
    bccRecipients?: string[];

    /**
     * The subject of the message
     */
    subject?: string;

    /**
     * The body of the message
     */
    message?: string;
  }

  /**
   * Parameters supplied when composing a reply to or forward of a message
   *
   * @see {@link ComposeMailType}
   */
  export interface ComposeReplyOrForwardParams<T extends ComposeMailType> extends ComposeMailBase<T> {
    itemid: string;
  }

  /**
   * Parameters supplied to {@link composeMail} to compose a new mail item
   *
   * @see {@link ComposeNewParams}
   * @see {@link ComposeReplyOrForwardParams}
   * @see {@link ComposeMailType}
   */
  export type ComposeMailParams =
    | ComposeNewParams
    | ComposeReplyOrForwardParams<ComposeMailType.Reply>
    | ComposeReplyOrForwardParams<ComposeMailType.ReplyAll>
    | ComposeReplyOrForwardParams<ComposeMailType.Forward>;
}
