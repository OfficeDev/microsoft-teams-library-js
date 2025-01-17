/**
 * Used to interact with mail capability, including opening and composing mail.
 * @module
 *
 * @beta
 */

import { callFunctionInHost } from '../../internal/communication';
import { validateEmailAddress } from '../../internal/emailAddressValidation';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { ISerializable } from '../serializable.interface';
import { ComposeMailParams, ComposeMailType } from './mail';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const mailTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Extended parameters for {@link composeMail}, including support for external handoff.
 *
 * This interface wraps {@link ComposeMailParamsWithHandoff} to provide additional functionality for scenarios
 * where an external handoff is needed, such as transferring a draft email created in BizChat.
 *
 * @see {@link ComposeNewParams} for parameters when composing a new mail item.
 * @see {@link ComposeReplyOrForwardParams} for reply or forward-specific parameters.
 * @see {@link ComposeMailType} for supported mail operation types.
 *
 * @beta
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

/**
 * Validates an array of email addresses.
 * For ComposeMailType.New, it is valid to pass empty arrays for toRecipients, ccRecipients, and bccRecipients.
 * This will result in a new email with handed-off (pre-populated) body content but no pre-populated recipients.
 *
 * @param emails - An optional array of email addresses to validate.
 * @throws Error with a message describing if the email address is invalid.
 *
 * @beta
 */
function validateEmails(emails?: string[]): boolean {
  if (!emails || emails.length === 0) {
    return true; // If the array is undefined or empty, consider it valid
  }
  // Use validateEmailAddress for each email in the param
  emails.forEach((email) => {
    validateEmailAddress(email); // This will throw an error if the email is invalid
  });
  return true;
}

/**
 * Validates email addresses in the given ComposeMailParams object.
 * Validates `toRecipients`, `ccRecipients`, and `bccRecipients` for `ComposeNewParams`.
 *
 * @param params - The incoming ComposeMailParams object.
 * @throws Error with a message describing if the email address is invalid.
 *
 * @beta
 */
function validateHandoffComposeMailParams(param: ComposeMailParamsWithHandoff): void {
  if (!param.handoffId || param.handoffId.trim().length == 0 || param.handoffId.trim() === '') {
    throw new Error('handoffId should not be null or empty string.');
  }
  const composeMailParams = param.composeMailParams;
  if (composeMailParams.type === ComposeMailType.New) {
    validateEmails(composeMailParams.toRecipients) &&
      validateEmails(composeMailParams.ccRecipients) &&
      validateEmails(composeMailParams.bccRecipients);
  }
  // For Reply, ReplyAll, and Forward types, no validation needed
}

/**
 * Compose a new email in the user's mailbox, opening it in the drafts UX instead of the standard email.
 *
 * @param composeMailParamsWithHandoff - Object that specifies the type of mail item to compose and the details of the mail item.
 * @returns { Promise<void> } - promise resolves after the compose window has opened successfully in host SDK.
 * @throws Error with a message describing whether the capability is not initialized or the input is invalid.
 *
 * @beta
 */
export function composeMailWithHandoff(composeMailParamsWithHandoff: ComposeMailParamsWithHandoff): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);
  if (!isSupported()) {
    throw new Error('Not supported');
  }
  validateHandoffComposeMailParams(composeMailParamsWithHandoff);
  return callFunctionInHost(
    ApiName.Mail_Handoff_ComposeMail,
    [new SerializableComposeMailParamsWithHandoff(composeMailParamsWithHandoff)],
    getApiVersionTag(mailTelemetryVersionNumber, ApiName.Mail_Handoff_ComposeMail),
  );
}

/**
 * Checks if the mail capability and handoff sub-capability is supported by the host
 * @returns boolean to represent whether the handoff sub-capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.mail && runtime.supports.mail.handoff ? true : false;
}

class SerializableComposeMailParamsWithHandoff implements ISerializable {
  public constructor(private composeMailParamsWithHandoff: ComposeMailParamsWithHandoff) {}
  public serialize(): object {
    return this.composeMailParamsWithHandoff;
  }
}
