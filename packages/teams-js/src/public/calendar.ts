import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { createTeamsDeepLinkForCalendar } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Interact with the user's calendar, including opening calendar items and composing meetings.
 */
export namespace calendar {
  /**
   * Opens a calendar item.
   *
   * @param openCalendarItemParams - object containing unique ID of the calendar item to be opened.
   */
  export function openCalendarItem(openCalendarItemParams: OpenCalendarItemParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      if (!openCalendarItemParams.itemId || !openCalendarItemParams.itemId.trim()) {
        throw new Error('Must supply an itemId to openCalendarItem');
      }

      resolve(sendAndHandleError('calendar.openCalendarItem', openCalendarItemParams));
    });
  }

  /**
   * Compose a new meeting in the user's calendar.
   *
   * @param composeMeetingParams - object containing various properties to set up the meeting details.
   */
  export function composeMeeting(composeMeetingParams: ComposeMeetingParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
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

  /**
   * Checks if the calendar capability is supported by the host
   * @returns boolean to represent whether the calendar capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.calendar ? true : false;
  }

  /** Open calendar item parameters. */
  export interface OpenCalendarItemParams {
    /** An unique base64-encoded string id that represents the event's unique identifier of the calendar item to be opened. */
    itemId: string;
  }

  /** Compose meeting parameters */

  export interface ComposeMeetingParams {
    /** An array of email addresses, user name, or user id of the attendees to invite to the meeting. */
    attendees?: string[];
    /** The start time of the meeting in MM/DD/YYYY HH:MM:SS format. */
    startTime?: string;
    /** The end time of the meeting in MM/DD/YYYY HH:MM:SS format. */
    endTime?: string;
    /** The subject line of the meeting. */
    subject?: string;
    /** The body content of the meeting. */
    content?: string;
  }
}
