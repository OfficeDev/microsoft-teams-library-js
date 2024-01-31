import { sendAndHandleStatusAndReason, sendAndHandleStatusAndReasonWithVersion } from '../internal/communication';
import { createTeamsDeepLinkForCalendar } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const calendarTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

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

      resolve(
        sendAndHandleStatusAndReasonWithVersion(
          getApiVersionTag(calendarTelemetryVersionNumber, ApiName.Calendar_OpenCalendarItem),
          'calendar.openCalendarItem',
          openCalendarItemParams,
        ),
      );
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
          sendAndHandleStatusAndReason(
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
        resolve(
          sendAndHandleStatusAndReasonWithVersion(
            getApiVersionTag(calendarTelemetryVersionNumber, ApiName.Calendar_ComposeMeeting),
            'calendar.composeMeeting',
            composeMeetingParams,
          ),
        );
      }
    });
  }
  /**
   * Checks if the calendar capability is supported by the host
   * @returns boolean to represent whether the calendar capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function joinMeeting(joinMeetingParams: JoinMeetingParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }
      resolve(
        sendAndHandleStatusAndReasonWithVersion(
          getApiVersionTag(calendarTelemetryVersionNumber, ApiName.Calendar_JoinMeeting),
          'calendar.joinMeeting',
          joinMeetingParams,
        ),
      );
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

  export interface JoinMeetingParams {
    skypeTeamsMeetingUrl: string;
    subject: string;
    source: string;
    conversationId: string;
    messageId: string;
    rootMessageId: string;
    isBroadcastMeeting?: boolean | undefined;
    t2BroadcastParticipantRoleDetails?: IT2BroadcastParticipantRoleDetails | undefined;
  }

  export interface IT2BroadcastParticipantRoleDetails {
    broadcastId: string;
    broadcastRole: Promise<BroadcastParticipantRole> | BroadcastParticipantRole;
    isBroadcastMeeting: boolean;
    broadcastCorrelationId: string;
    allowBroadcastProducerJoinsInT2: boolean;
    isT2SupportedBroadcastMeeting: (
      broadcastRole: BroadcastParticipantRole,
      allowBroadcastProducerJoinsInT2: boolean,
      clientType?: ClientType,
    ) => boolean;
    handleBroadcastMeetingRedirect: (
      broadcastRole: BroadcastParticipantRole,
      entityCommand: any,
      broadcastId: string,
      logger: any,
      broadcastCorrelationId: string,
      clientType?: ClientType,
    ) => void;
  }

  export enum BroadcastParticipantRole {
    Attendee = 'Attendee',
    Contributor = 'Contributor',
    None = 'None',
    Producer = 'Producer',
  }

  export enum ClientType {
    Web = 'web',
    Desktop = 'desktop',
    CDLWorker = 'cdlworker',
    Embed = 'embed', // it is used in telemetry service and service request headers for embed experiences
    Maglev = 'maglev',
    OutlookWeb = 'Outlook Web',
    OutlookDesktop = 'Outlook Desktop',
    OfficeWeb = 'Office Web',
    OfficeDesktop = 'Office Desktop',
  }
}
