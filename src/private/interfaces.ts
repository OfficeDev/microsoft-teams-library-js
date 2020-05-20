import { TeamInformation } from '../public/interfaces';
/**
 * @private
 * Hide from docs
 * --------
 * Information about all members in a chat
 */
export interface ChatMembersInformation {
  members: ThreadMember[];
}

/**
 * @private
 * Hide from docs
 * --------
 * Information about a chat member
 */
export interface ThreadMember {
  /**
   * The member's user principal name in the current tenant.
   */
  upn: string;
}

export const enum NotificationTypes {
  fileDownloadStart = 'fileDownloadStart',
  fileDownloadComplete = 'fileDownloadComplete',
}

export interface ShowNotificationParameters {
  message: string;
  notificationType: NotificationTypes;
}

/**
 * @private
 * Hide from docs.
 * ------
 */
export interface FilePreviewParameters {
  /**
   * The developer-defined unique ID for the file.
   */
  entityId: string;

  /**
   * The display name of the file.
   */
  title: string;

  /**
   * An optional description of the file.
   */
  description?: string;

  /**
   * The file extension; e.g. pptx, docx, etc.
   */
  type: string;

  /**
   * A url to the source of the file, used to open the content in the user's default browser
   */
  objectUrl: string;

  /**
   * Optional; an alternate self-authenticating url used to preview the file in Mobile clients and offer it for download by the user
   */
  downloadUrl?: string;

  /**
   * Optional; an alternate url optimized for previewing the file in Teams web and desktop clients
   */
  webPreviewUrl?: string;

  /**
   * Optional; an alternate url that allows editing of the file in Teams web and desktop clients
   */
  webEditUrl?: string;

  /**
   * Optional; the base url of the site where the file is hosted
   */
  baseUrl?: string;

  /**
   * Optional; indicates whether the file should be opened in edit mode
   */
  editFile?: boolean;

  /**
   * Optional; the developer-defined unique ID for the sub-entity to return to when the file stage closes.
   * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;
}

/**
 * @private
 * Hide from docs
 * --------
 * Query parameters used when fetching team information
 */
export interface TeamInstanceParameters {
  /**
   * Flag allowing to select favorite teams only
   */
  favoriteTeamsOnly?: boolean;
}

/**
 * @private
 * Hide from docs
 * --------
 * Information on userJoined Teams
 */
export interface UserJoinedTeamsInformation {
  /**
   * List of team information
   */
  userJoinedTeams: TeamInformation[];
}

/**
 * @private
 * Hide from docs
 * --------
 * Attachment object returned by the platform
 */
export interface Attachment {
  /**
   * Base 64 encoded attachment
   */
  encodedAttachment: string;
  /**
   * size of the attachment
   */
  size: number;
  /**
   * Platform's uri in string format
   */
  localPath: string;
  /**
   * Type of the attachment
   */
  attachmentMimeType: string;
}

/**
 * @private
 * Hide from docs
 * --------
 * todo: merge it with error common with location after those changes are checked in
 */
export interface Error {
  /**
  error code
  */
  errorCode: ErrorCode | number;
  /**
  Message for status code success or error if any
  */
  description: string;
}

/**
 * @private
 * Hide from docs
 * --------
 * Attachment Result object returned as the result of select attachment API
 */
export interface AttachmentResult {
  /**
   * List of attachments returned by the platform
   */
  attachments: Attachment[];
  /**
   * Error while selecting attachment returned by the platform
   */
  error: Error;
}

/**
 * @private
 * Hide from docs
 * --------
 * Input parameter supplied to the select Attachment API
 */
export interface AttachmentInputs {
  /**
   * List of attachment types allowed to be selected
   */
  attachmentTypes: AttachmentType[];
  /**
   * max limit of attachments allowed to be selected in one go, max limit is 10. Keep the max limit low to support low end devices.
   */
  maxAttachmentCount: number;
  /**
   * Additional properties for customization of select Attachment in mobile devices
   */
  props?: AttachmentProps;
}

/**
 *  All properties in AttachmentProps are optional and have default values
 */
export interface AttachmentProps {
  /**
   * Optional; Lets the developer specify the attachment source, more than one can be specified.
   * Default value is both camera and gallery
   */
  sources?: Source[];
  /**
   * Optional; Specify in which mode the camera will be opened.
   * Default value is Photo
   */
  startMode?: Mode;
  /**
   * Optional; indicate if inking on the selected Image is allowed or not
   * Default value is true
   */
  ink?: boolean;
  /**
   * Optional; indicate if user is allowed to move between front and back camera
   * Default value is true
   */
  cameraSwitcher?: boolean;
  /**
   * Optional; indicate if putting text stickers on the selected Image is allowed or not
   * Default value is true
   */
  textSticker?: boolean;
  /**
   * Optional; indicate if image filtering mode is enabled on the selected image
   * Default value is false
   */
  enableFilter?: boolean;
}

/**
 * The modes in which camera can be launched in select Attachment API
 */
export const enum Mode {
  Photo = 1,
  Document = 2,
  Whiteboard = 3,
  BusinessCard = 4,
}

/**
 * Specifies the image source
 */
export const enum Source {
  Camera = 1,
  Gallery = 2,
}

/**
 * Specifies the type of attachment
 */
export const enum AttachmentType {
  Image = 1,
  //todo: remove video while creating the PR
  Video = 2,
}

// todo: merge it with error common with location after those changes are checked in
export const enum ErrorCode {
  /**
  Sufficient permissions are not available
  */
  PERMISSION_DENIED = 100,
  /**
  Faced Network error
  */
  NETWORK_ERROR = 200,
  /**
  Hardware doesn't support this capability
  */
  NO_HW_SUPPORT = 300,
  /**
  One or more arguments are invalid
  */
  INVALID_ARGUMENTS = 400,
  /**
   * The file specified was not found on the given location
   */
  FILE_NOT_FOUND = 404,
  /**
   * The attachment selected is too big and has exceeded our size boundries
   */
  SIZE_EXCEEDED = 405,
  /**
  User is not authorized for this operation
  */
  UNAUTHORIZED_USER_OPERATION = 500,
  /**
  Could not complete the operation due to insufficient resources
  */
  INSUFFICIENT_RESOURCES = 600,
  /**
  Platform throttled the request because of API was invoked too frequently
  */
  THROTTLE = 700,
  /**
  Request timed out
  */
  TIMEOUT = 800,
  /**
  User aborted the request
  */
  USER_ABORT = 900,
  /**
  Platform code is old and doesn't implement this API
  */
  OLD_PLATFORM = 1000,
}

/**
 * Input to getAttachment API
 */
export interface FileUri {
  /**
   * Content uri of the file to read
   */
  localUri: string;
  /**
   * chunk sequence to read a particular chunk
   */
  chunkSequence?: number;
}
