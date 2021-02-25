import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';
import { runtime } from './runtime';

export namespace calendar {
  export function openCalendarItem(
    openCalendarItemParams: OpenCalendarItemParams,
    onComplete?: (status: boolean, reason?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) throw 'Not Supported';

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
    if (!isSupported()) throw 'Not Supported';

    sendMessageToParent(
      'calendar.composeMeeting',
      [composeMeetingParams],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }
  export function isSupported(): boolean {
    return runtime.supports.calendar ? true : false;
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
