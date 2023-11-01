import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { dialog } from '../public/dialog';
import { DialogSize } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageToParentWithVersion } from './communication';

export function updateResizeHelper(dimensions: DialogSize, apiVersion = 'v1'): void {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.task,
    FrameContexts.meetingStage,
  );
  if (!dialog.update.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersion, 'tasks.updateTask', [dimensions]);
}
