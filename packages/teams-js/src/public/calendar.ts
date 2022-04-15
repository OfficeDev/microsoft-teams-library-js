import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { teamsDeepLinkHost, teamsDeepLinkProtocol } from '../internal/constants';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @alpha
 */
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
        resolve(sendAndHandleError('executeDeepLink', createTeamsDeepLinkForCalendar(composeMeetingParams)));
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

export function createTeamsDeepLinkForCalendar(composeMeetingParams: calendar.ComposeMeetingParams): string {
  const teamsDeepLinkUrlPathForCalendar = '/l/meeting/new';
  const teamsDeepLinkAttendeesUrlParameterName = 'attendees';
  const teamsDeepLinkStartTimeUrlParameterName = 'startTime';
  const teamsDeepLinkEndTimeUrlParameterName = 'endTime';
  const teamsDeepLinkSubjectUrlParameterName = 'subject';
  const teamsDeepLinkContentUrlParameterName = 'content';

  const attendeeSearchParameter =
    composeMeetingParams.attendees === undefined
      ? ''
      : `${teamsDeepLinkAttendeesUrlParameterName}=` +
        composeMeetingParams.attendees.map(attendee => encodeURIComponent(attendee)).join(',');
  const startTimeSearchParameter =
    composeMeetingParams.startTime === undefined
      ? ''
      : `&${teamsDeepLinkStartTimeUrlParameterName}=${encodeURIComponent(composeMeetingParams.startTime)}`;
  const endTimeSearchParameter =
    composeMeetingParams.endTime === undefined
      ? ''
      : `&${teamsDeepLinkEndTimeUrlParameterName}=${encodeURIComponent(composeMeetingParams.endTime)}`;
  const subjectSearchParameter =
    composeMeetingParams.subject === undefined
      ? ''
      : `&${teamsDeepLinkSubjectUrlParameterName}=${encodeURIComponent(composeMeetingParams.subject)}`;
  const contentSearchParameter =
    composeMeetingParams.content === undefined
      ? ''
      : `&${teamsDeepLinkContentUrlParameterName}=${encodeURIComponent(composeMeetingParams.content)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForCalendar}?${attendeeSearchParameter}${startTimeSearchParameter}${endTimeSearchParameter}${subjectSearchParameter}${contentSearchParameter}`;
}
