/**
 * Used to interact with mail capability, including opening and composing mail.
 * @module
 */

import { callFunctionInHostAndHandleResponse, sendAndHandleStatusAndReason } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SimpleTypeResponseHandler } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';
import { ISerializable } from './serializable.interface';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const mailTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Opens a mail message in the host.
 *
 * @param openMailItemParams - Object that specifies the ID of the mail message.
 */
export function openMailItem(openMailItemParams: OpenMailItemParams): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw new Error('Not supported');
    }

    if (!openMailItemParams.itemId || !openMailItemParams.itemId.trim()) {
      throw new Error('Must supply an itemId to openMailItem');
    }

    resolve(
      sendAndHandleStatusAndReason(
        getApiVersionTag(mailTelemetryVersionNumber, ApiName.Mail_OpenMailItem),
        'mail.openMailItem',
        openMailItemParams,
      ),
    );
  });
}

/**
 * Compose a new email in the user's mailbox.
 *
 * @param composeMailParams - Object that specifies the type of mail item to compose and the details of the mail item.
 *
 */
export function composeMail(composeMailParams: ComposeMailParams): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw new Error('Not supported');
    }

    resolve(
      sendAndHandleStatusAndReason(
        getApiVersionTag(mailTelemetryVersionNumber, ApiName.Mail_ComposeMail),
        'mail.composeMail',
        composeMailParams,
      ),
    );
  });
}

/**
 * Compose a new email in the user's mailbox, opening it in the drafts UX instead of the standard email.
 *
 * @param composeMailParamsWithHandoff - Object that specifies the type of mail item to compose and the details of the mail item.
 *
 */
export function composeMailWithHandoff(composeMailParamsWithHandoff: ComposeMailParamsWithHandoff): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw new Error('Not supported');
    }

    callFunctionInHostAndHandleResponse<boolean, boolean>(
      ApiName.Mail_ComposeMailWithHandoff,
      [new SerializableComposeMailParamsWithHandoff(composeMailParamsWithHandoff)],
      new SimpleTypeResponseHandler(),
      getApiVersionTag(mailTelemetryVersionNumber, ApiName.Mail_ComposeMailWithHandoff),
    );
    resolve();
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

/** Defines the parameters used to open a mail item in the user's mailbox */
export interface OpenMailItemParams {
  /** An unique base64-encoded string id that represents the itemId or messageId. */
  itemId: string;
}

/** Defines compose mail types. */
export enum ComposeMailType {
  /** Compose a new mail message. */
  New = 'new',
  /** Compose a reply to the sender of an existing mail message. */
  Reply = 'reply',
  /** Compose a reply to all recipients of an existing mail message. */
  ReplyAll = 'replyAll',
  /** Compose a new mail message with the content of an existing mail message forwarded to a new recipient. */
  Forward = 'forward',
}

/**
 * Foundational interface for all other mail compose interfaces
 * Used for holding the type of mail item being composed
 *
 * @typeParam T - the identity type.
 * @see {@link mail.ComposeMailType}
 */
interface ComposeMailBase<T extends ComposeMailType> {
  /** Type of the mail item being composed. */
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
  /** An unique base64-encoded string id that represents the mail message. */
  itemid: string;
}

/**
 * Parameters supplied to {@link composeMail} when composing a new mail item
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

/**
 * Extended parameters for {@link composeMail}, including support for external handoff.
 *
 * This interface wraps {@link ComposeMailParams} to provide additional functionality for scenarios
 * where an external handoff is needed, such as transferring a draft email created in BizChat.
 *
 * @see {@link ComposeNewParams} for parameters when composing a new mail item.
 * @see {@link ComposeReplyOrForwardParams} for reply or forward-specific parameters.
 * @see {@link ComposeMailType} for supported mail operation types.
 */
export interface ComposeMailParamsWithHandoff {
  /**
   * Base parameters for composing a mail item.
   */
  composeMailParams: ComposeMailParams;
  /**
   * Use this endpoint to retrieve the handoff payload when BizChat creates an email draft for external handoff.
   */
  handoffId: string;
}

class SerializableComposeMailParamsWithHandoff implements ISerializable {
  public constructor(private composeMailParamsWithHandoff: ComposeMailParamsWithHandoff) {}
  public serialize(): object {
    return this.composeMailParamsWithHandoff;
  }
}
