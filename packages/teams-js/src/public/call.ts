import { sendAndUnwrap, sendMessageToParent } from '../internal/communication';
import { errorCallNotStarted } from '../internal/constants';
import { createTeamsDeepLinkForCall } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Used to interact with call functionality, including starting calls with other users.
 */
export namespace call {
  /** Modalities that can be associated with a call. */
  export enum CallModalities {
    /** Indicates that the modality is unknown or undefined. */
    Unknown = 'unknown',
    /** Indicates that the call includes audio. */
    Audio = 'audio',
    /** Indicates that the call includes video. */
    Video = 'video',
    /** Indicates that the call includes video-based screen sharing. */
    VideoBasedScreenSharing = 'videoBasedScreenSharing',
    /** Indicates that the call includes data sharing or messaging. */
    Data = 'data',
  }

  /** Represents parameters for {@link startCall | StartCall}. */
  export interface StartCallParams {
    /**
     * Comma-separated list of user IDs representing the participants of the call.
     *
     * @remarks
     * Currently the User ID field supports the Microsoft Entra UserPrincipalName,
     * typically an email address, or in case of a PSTN call, it supports a pstn
     * mri 4:\<phonenumber>.
     */
    targets: string[];
    /**
     * List of modalities for the call. Defaults to [“audio”].
     */
    requestedModalities?: CallModalities[];
    /**
     * An optional parameter that informs about the source of the deep link
     */
    source?: string;
  }

  /**
   * Starts a call with other users
   *
   * @param startCallParams - Parameters for the call
   *
   * @throws Error if call capability is not supported
   * @throws Error if host notifies of a failed start call attempt in a legacy Teams environment
   * @returns always true if the host notifies of a successful call inititation
   */
  export function startCall(startCallParams: StartCallParams): Promise<boolean> {
    return new Promise((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (runtime.isLegacyTeams) {
        resolve(
          sendAndUnwrap(
            'executeDeepLink',
            createTeamsDeepLinkForCall(
              startCallParams.targets,
              startCallParams.requestedModalities?.includes(CallModalities.Video),
              startCallParams.source,
            ),
          ).then((result: boolean) => {
            if (!result) {
              throw new Error(errorCallNotStarted);
            }
            return result;
          }),
        );
      } else {
        return sendMessageToParent('call.startCall', [startCallParams], resolve);
      }
    });
  }

  /**
   * Checks if the call capability is supported by the host
   * @returns boolean to represent whether the call capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.call ? true : false;
  }
}
