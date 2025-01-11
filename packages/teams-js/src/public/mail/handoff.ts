/**
 * Used to interact with mail capability, including opening and composing mail.
 * @module
 */

import { callFunctionInHost } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { ISerializable } from '../serializable.interface';
import { ComposeMailParams } from './mail';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const mailTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Compose a new email in the user's mailbox, opening it in the drafts UX instead of the standard email.
 *
 * @param composeMailParamsWithHandoff - Object that specifies the type of mail item to compose and the details of the mail item.
 *
 */
export function composeMailWithHandoff(composeMailParamsWithHandoff: ComposeMailParamsWithHandoff): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);
  if (!isSupported()) {
    throw new Error('Not supported');
  }

  return callFunctionInHost(
    ApiName.Mail_Handoff_ComposeMailWithHandoff,
    [new SerializableComposeMailParamsWithHandoff(composeMailParamsWithHandoff)],
    getApiVersionTag(mailTelemetryVersionNumber, ApiName.Mail_Handoff_ComposeMailWithHandoff),
  );
}

/**
 * Checks if the mail capability and handoff sub-capability is supported by the host
 * @returns boolean to represent whether the handoff sub-capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.mail && runtime.supports.mail.handoff ? true : false;
}

/**
 * Extended parameters for {@link composeMail}, including support for external handoff.
 *
 * This interface wraps {@link ComposeMailParamsWithHandoff} to provide additional functionality for scenarios
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
