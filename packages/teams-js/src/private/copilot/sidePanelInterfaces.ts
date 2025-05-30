/**
 * @hidden
 *
 * Interface for content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ContentType {
  EMAIL = 'email',
  TEXT = 'text',
  MEDIA = 'media',
  CALENDAR_INVITE = 'calendarInvite',
  WEB_PAGE = 'webPage',
  MIXED = 'mixed',
}

/**
 * @hidden
 *
 * Common properties for all email content types
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface BaseEmailContent {
  subject?: string;
  body?: string;
  sender?: string;
  recipients?: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
  renderedHtml?: string;
  // Add other relevant common email properties
}

/**
 * @hidden
 *
 * Interface for server email content (must have id, receivedTime, sentTime)
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ServerEmailContent extends BaseEmailContent {
  id: string;
  receivedTime?: Date;
  sentTime?: Date;
}

/**
 * @hidden
 *
 * Interface for draft email content (no id, times optional)
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface DraftEmailContent extends BaseEmailContent {
  savedTime?: Date;
}

// Union type for usage elsewhere
export type EmailContent = ServerEmailContent | DraftEmailContent;

/**
 * @hidden
 *
 * Interface for email content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface CalendarInviteContent {
  id: string;
  title?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  meetingParameters?: string;
  attendees?: string[]; // List of attendee email addresses
  organizer?: string; // Email address of the meeting organizer
  body?: string; // Body of the calendar invite
  attachments?: string[]; // List of attachment file names or URLs
  // Add other calendar event properties
}
/**
 * @hidden
 *
 * Interface for web page content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface WebPageContent {
  id?: string; // Unique identifier for the web page content
  url: string; // URL of the web page
  title?: string; // Title of the web page
  data?: string; // Raw HTML or text content of the web page
  description_for_model?: string; // Description of the web page for the model
  description?: string; // Description of the web page
  faviconUrl?: string; // URL of the favicon
}

/**
 * @hidden
 *
 * Interface for user selected content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TextSelection {
  content: string;
  source?: EmailContent | WebPageContent | CalendarInviteContent;
}

/**
 * @hidden
 *
 * Interface for image media content
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ImageContent {
  url: string; // URL of the image
  width?: number; // Width in pixels
  height?: number; // Height in pixels
  fileSize?: number; // File size in bytes
  format?: string; // e.g., 'jpeg', 'png'
  thumbnailUrl?: string; // Optional thumbnail
}

/**
 * @hidden
 *
 * Interface for audio media content
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface AudioContent {
  url: string; // URL of the audio file
  duration?: number; // Duration in seconds
  fileSize?: number; // File size in bytes
  format?: string; // e.g., 'mp3', 'wav'
  transcript?: string; // Optional transcript
}

/**
 * @hidden
 *
 * Interface for video media content
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface VideoContent {
  url: string; // URL of the video file
  width?: number; // Width in pixels
  height?: number; // Height in pixels
  duration?: number; // Duration in seconds
  fileSize?: number; // File size in bytes
  format?: string; // e.g., 'mp4', 'mov'
  thumbnailUrl?: string; // Optional thumbnail
  transcript?: string; // Optional transcript
}

/**
 * @hidden
 *
 * Enum for media selection types
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum MediaSelectionType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

/**
 * @hidden
 *
 * Interface for media selection
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MediaSelection {
  type: MediaSelectionType;
  altText?: string;
  content: ImageContent | AudioContent | VideoContent;
  source?: EmailContent | WebPageContent | CalendarInviteContent;
}

/**
 * @hidden
 *
 * Interface for a catch all type content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MixedContent {
  emails?: EmailContent[];
  texts?: TextSelection[];
  media?: (ImageContent | AudioContent | VideoContent)[];
  calendarInvites?: CalendarInviteContent[];
  webPages?: WebPageContent[];
  otherContent?: Array<Record<string, unknown>> | undefined; // Other content types that don't fit into the above categories
}

/**
 * @hidden
 *
 * Interface for content data we get from hub
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type ContentItem =
  | EmailContent
  | TextSelection
  | MediaSelection
  | CalendarInviteContent
  | WebPageContent
  | MixedContent;

export interface Content {
  userAction?: string;
  contentType:
    | ContentType.CALENDAR_INVITE
    | ContentType.EMAIL
    | ContentType.MEDIA
    | ContentType.TEXT
    | ContentType.WEB_PAGE
    | ContentType.MIXED;
  formCode?: string; // Unique identifier for the content
  contentItems: ContentItem[];
  metadata?: string;
  description?: string;
  error_code?: string; // Optional error code if the content retrieval failed
  status?: string; // Optional status message
}

/**
 * @hidden
 *
 * Interface for the response context used during user consent pre-checks.
 * Contains information about the user's consent status and whether to show the consent card.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface PreCheckContextResponse {
  error_code?: string; // Optional error code if the pre-check failed
  status?: string; // Optional status message
  user_consent: UserConsent; // The user's consent status (accepted or not accepted)
  show_consent_card: boolean; // Whether the consent card should be shown to the user
}

/**
 * @hidden
 *
 * Enum representing possible user consent states.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum UserConsent {
  Accepted = 'accepted', // User has accepted/consented
  NotAccepted = 'not_accepted', // User has not accepted/consented
}

/**
 * @hidden
 *
 * Type for user action handler functions that receive content data.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum SidePanelErrorCode {
  BLOCKED_BY_POLICY = 'page_content_blocked_by_policy',
  BLOCKED_BY_DLP = 'page_content_blocked_by_dlp',
  MEDIA_NOT_SUPPORTED = 'media_not_supported',
  USER_CONSENT_REQUIRED = 'user_consent_required',
  EXTRACTION_FAILED = 'content_extraction_failed',
  CONTENT_NOT_FOUND = 'content_not_found',
  CONTENT_NOT_SUPPORTED = 'content_not_supported',
  CONTENT_CHANGED = 'content_changed',
  UNKNOWN_ERROR = 'unknown_error',
  INTERNAL_ERROR = 'internal_error', // catch all error code for unexpected issues
  NOT_SUPPORTED_ON_PLATFORM = 'not_supported_on_platform', // API not supported on the current platform
}

/**
 * @hidden
 *
 * Interface for errors related to side panel operations.
 * Contains an error code and an optional message.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface SidePanelError {
  errorCode: SidePanelErrorCode;
  message?: string;
}
