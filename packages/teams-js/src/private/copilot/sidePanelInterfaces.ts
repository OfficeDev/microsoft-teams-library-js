/**
 * @hidden
 *
 * Interface for content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ContentItemType {
  EMAIL = 'email',
  TEXT = 'text',
  MEDIA = 'media',
  CALENDAR_INVITE = 'calendarInvite',
  WEB_PAGE = 'webPage',
  MIXED = 'mixed',
  TEAMS = 'teams', // Represents Teams-related content, such as chat or channel messages
  FILE = 'file', // Represents file content, such as documents or attachments
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
  responseToEmailId?: string; // Optional, if this is a response to another email
  savedTime?: Date;
  composeType?: 'new' | 'reply' | 'replyAll' | 'forward'; // Type of compose action
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
  source?: EmailContent | WebPageContent | CalendarInviteContent | TeamsContent | FileContent;
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
  source?: EmailContent | WebPageContent | CalendarInviteContent | TeamsContent | FileContent;
}
/**
 * @hidden
 *
 * Interface representing the context of a Microsoft Teams chat.
 * Contains identifying information for a specific Teams chat session.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsChatContext {
  chatId: string; // Unique identifier for the chat
}
/**
 * @hidden
 *
 * Interface representing the context of a Microsoft Teams channel.
 * Contains identifying information for a specific Teams channel and related content.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsChannelContext {
  channelId: string; // Unique identifier for the channel
  teamId: string; // Unique identifier for the team
  channelName?: string; // Name of the channel
  postId?: string; // Unique identifier for the post in the channel
  replyChainId?: string; // Unique identifier for the reply chain in the channel
  clientConversationId?: string; // Unique identifier for the client conversation
}

/**
 * @hidden
 *
 * Interface representing the context of a Microsoft Teams meeting.
 * Contains configuration and identifying information for Teams meeting sessions including Copilot features.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsMeetingContext {
  callId: string;
  threadId: string;
  organizerId: string;
  messageId?: string;
  groupId?: string;
  sessionType?: TeamsSessionType;
  vroomId?: string;
  iCalUid?: string;
  conversationId?: string;
  locale?: string;
  disableHistory?: boolean;
  Dimensions?: TeamsDimension[];
  UtteranceInfo?: TeamsUtteranceInfo;
  copilotMode?: CopilotMode;
  transcriptState?: TranscriptState;
  enableMeetingCopilotResponseHandoff?: boolean;
  enableCopilotResponseCopyRestriction?: boolean;
  enableMeetingCopilotVisualInsights?: boolean;
  enableMeetingCopilotCitation?: boolean;
}

/**
 * @hidden
 *
 * Enum representing different types of Teams session contexts.
 * Defines the various meeting and chat session types within Microsoft Teams.
 *
 * @internal
 * Limited to Microsoft-internal use
 */

export enum TeamsSessionType {
  Private = 'Private',
  Shared = 'Shared',
  Recap = 'Recap',
  RecapCall = 'RecapCall',
  PrivateViewCall = 'PrivateViewCall',
  Chat = 'Chat',
  Compose = 'Compose',
}
/**
 * @hidden
 *
 * Interface for telemetry dimension data used in analytics and reporting.
 * Contains dimension name-value pairs for categorizing telemetry data.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsDimension {
  DimensionName: TeamsDimensionName;
  DimensionValue: string;
}
/**
 * @hidden
 *
 * Enum defining telemetry dimension names for categorizing analytics data.
 * Used to specify the type of dimension being tracked in telemetry systems.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum TeamsDimensionName {
  ClientDeviceType = 'ClientDeviceType',
  ClientRing = 'ClientRing',
  ClientScenarioName = 'ClientScenarioName',
}
/**
 * @hidden
 *
 * Interface for utterance identification information used in conversation tracking.
 * Contains unique identifiers for individual utterances in chat or meeting contexts.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsUtteranceInfo {
  utteranceId?: string;
}
/**
 * @hidden
 *
 * Enum defining different Copilot operational modes.
 * Specifies whether Copilot is enabled and how it should function in Teams contexts.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum CopilotMode {
  Enabled = 'enabled',
  Disabled = 'disabled',
  EnabledWithTranscript = 'enabledWithTranscript',
}
/**
 * @hidden
 *
 * Enum defining different transcript states for meeting recordings.
 * Indicates the current status of transcript generation and availability.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum TranscriptState {
  NotStarted = 'notStarted',
  Active = 'active',
  Inactive = 'inactive',
  UnknownFutureValue = 'unknownFutureValue',
}
/**
 * @hidden
 *
 * Interface for Teams-related content data including app information and context.
 * Contains metadata about Teams applications and their execution contexts.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsContent {
  appName?: string;
  appVersion?: string;
  appPlatform?: string;
  appRingInfo?: string;
  chatContext?: TeamsChatContext;
  channelContext?: TeamsChannelContext;
  meetingContext?: TeamsMeetingContext;
}

/**
 * @hidden
 *
 * Interface for file content data including URLs and metadata.
 * Represents file attachments and documents referenced in content.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface FileContent {
  fileUrl?: string; // URL of the file
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
  files?: FileContent[];
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
  | TeamsContent
  | FileContent
  | MixedContent;

/**
 * @hidden
 *
 * The Content interface represents the content data structure used in the side panel.
 * It si the payload received by the copilot app from the hub.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface Content {
  userAction?: string;
  contentType:
    | ContentItemType.CALENDAR_INVITE
    | ContentItemType.EMAIL
    | ContentItemType.MEDIA
    | ContentItemType.TEXT
    | ContentItemType.TEAMS
    | ContentItemType.FILE
    | ContentItemType.WEB_PAGE
    | ContentItemType.MIXED;
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
 * The ContentRequest interface represents the request params sent to the hub to fetch content.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ContentRequest {
  localEndpointInfo: string; // local endpoint information for the request- used by Edge
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
  ConsentNotAccepted = 'consent_not_accepted',
  PageContentBlockedPolicy = 'page_content_blocked_policy',
  PageContentBlockedDlp = 'page_content_blocked_dlp',
  PageContentTypeNotSupportedYet = 'page_content_type_not_supported_yet',
  PageContentSizeNotSupported = 'page_content_size_not_supported',
  PageContextChanged = 'page_context_changed',
  PageContentExtractionFailed = 'page_content_extraction_failed',
  PageContentSizeNotSupportedPDF = 'page_content_size_not_supported_pdf',
  NotSupportedOnPlatform = 'not_supported_on_platform', // API not supported on the current platform
  OtherError = 'other_error', // catch all error code for unexpected issues
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

/**
 * @hidden
 * @beta
 * Implementation of the SidePanelError interface.
 * This class extends the built-in Error class and includes an error code.
 * It is used to represent errors that occur during side panel operations.
 * The error code can be one of the SidePanelErrorCode values or a general ErrorCode.
 */
export class SidePanelErrorImpl extends Error implements SidePanelError {
  public errorCode: SidePanelErrorCode;
  public constructor(errorCode: SidePanelErrorCode, message?: string) {
    super(message);
    this.errorCode = errorCode;
    this.name = 'SidePanelError';
  }
}
