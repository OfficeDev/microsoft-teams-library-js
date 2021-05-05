import { ShareInTeamsInfo } from './interfaces';
import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';

/**
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
export namespace shareInTeams {
  export const Messages = {
    Share: 'shareInTeams.share',
  };
  /**
   * Allows an app to open the task module.
   * @param shareInTeamsInfo An object containing the parameters of the task module
   * @param submitHandler Handler to call when the task module is completed
   */
  export function shareInfo(info: ShareInTeamsInfo, submitHandler?: (err: string, result: string) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

    sendMessageToParent(Messages.Share, [info], submitHandler);
  }
}
