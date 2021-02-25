import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { runtime, RuntimeCapabilities } from './runtime';
import { sendMessageToParent } from '../internal/communication';

export namespace calendar {
  export function openCalendarItem(
    openCalendarItemParams: OpenCalendarItemParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Calendar)) throw 'Not Supported';

    sendMessageToParent(
      'calendar.openCalendarItem',
      [openCalendarItemParams],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }
  export function composeMeeting(
    composeMeetingParams: ComposeMeetingParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!runtime.isSupported(RuntimeCapabilities.Calendar)) throw 'Not Supported';

    sendMessageToParent(
      'calendar.composeMeeting',
      [composeMeetingParams],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }

  export interface OpenCalendarItemParams {
    itemId: string;
  }

  export interface ComposeMeetingParams {
    attendees?: string[];
    startTime?: string;
    endTime?: string;
    subject?: string;
    content?: string;
  }
}
