
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
  MIXED = 'mixed'
}

/**
 * @hidden
 *
 * Interface for email content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface EmailContent {
    id: string; // Unique identifier for the email
    subject: string;
    body: string;
    sender: string;
    recipients: string[]; // List of recipient email addresses
    cc?: string[]; // List of CC email addresses
    bcc?: string[]; // List of BCC email addresses
    attachments?: string[]; // List of attachment file names or URLs
    receivedTime: Date; // Date and time when the email was received
    sentTime: Date; // Date and time when the email was sent
    renderedHtml?: string;
    // Add other relevant email properties
}

/**
 * @hidden
 *
 * Interface for email content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface CalendarInviteContent {
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
interface WebPageContent {
    url: string; // URL of the web page
    title: string; // Title of the web page
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
interface TextSelection {
    content: string;
    source?: EmailContent | WebPageContent | CalendarInviteContent; 
}

/**
 * @hidden
 *
 * Interface for user selected media data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface MediaSelection {
    type: 'image' | 'video' | 'audio';
    altText: string;
    source?: EmailContent | WebPageContent | CalendarInviteContent; 
    // Consider adding dimensions, file size, etc.
}
/**
 * @hidden
 *
 * Interface for a catch all type content data
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface MixedContent {
  emails?: EmailContent[];
  texts?: TextSelection[];
  media?: MediaSelection[];
  calendarInvites?: CalendarInviteContent[];
  webPages?: WebPageContent[];
  otherContent?: Array<Record<string, any>> | undefined; // Other content types that don't fit into the above categories
}

/**
 * @hidden
 *
 * Interface for content data we get from hub
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type ContentItem = EmailContent | TextSelection | MediaSelection | CalendarInviteContent | WebPageContent | MixedContent; 

export interface Content {
  userAction: string;
  contentType: ContentType.CALENDAR_INVITE | ContentType.EMAIL | ContentType.MEDIA | ContentType.TEXT | ContentType.WEB_PAGE | ContentType.MIXED;
  contentId: string; // Unique identifier for the content
  content: ContentItem[];
  metadata?: string;
  description?: string;
}