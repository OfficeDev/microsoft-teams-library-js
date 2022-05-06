import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { createTeamsDeepLinkForCalendar } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

export namespace calendar {
  export function openCalendarItem(openCalendarItemParams: OpenCalendarItemParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      if (!openCalendarItemParams.itemId || !openCalendarItemParams.itemId.trim()) {
        throw new Error('Must supply an itemId to openCalendarItem');
      }

      resolve(sendAndHandleError('calendar.openCalendarItem', openCalendarItemParams));
    });
  }
  export function composeMeeting(composeMeetingParams: ComposeMeetingParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }
      if (runtime.isLegacyTeams) {
        resolve(
          sendAndHandleError(
            'executeDeepLink',
            createTeamsDeepLinkForCalendar(
              composeMeetingParams.attendees,
              composeMeetingParams.startTime,
              composeMeetingParams.endTime,
              composeMeetingParams.subject,
              composeMeetingParams.content,
            ),
          ),
        );
      } else {
        resolve(sendAndHandleError('calendar.composeMeeting', composeMeetingParams));
      }
    });
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
