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

export enum NotificationTypes {
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
 *
 * Data structure to represent a meeting room.
 */
export interface MeetingRoomInfo {
  /**
   * endpoint id of the meeting room.
   */
  endpointId: string;
  /**
   * device name of the meeting room.
   */
  deviceName: string;
  /**
   * client type of the meeting room.
   */
  clientType: string;
  /**
   * client version of the meeting room.
   */
  clientVersion: string;
}
/**
 * @private
 * Hide from docs
 *
 * Data structure to represent capabilities of a meeting room.
 */
export interface MeetingRoomCapability {
  /**
   * media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
   */
  mediaControls: string[];
  /**
   * main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
   */
  stageLayoutControls: string[];
  /**
   * meeting control capabilities, value can be "leaveMeeting".
   */
  meetingControls: string[];
}

/**
 * @private
 * Hide from docs
 *
 * Data structure to represent states of a meeting room.
 */
export interface MeetingRoomState {
  /**
   * current mute state, true: mute, false: unmute.
   */
  toggleMute: boolean;
  /**
   * current camera state, true: camera on, false: camera off.
   */
  toggleCamera: boolean;
  /**
   * current captions state, true: captions on, false: captions off.
   */
  toggleCaptions: boolean;
  /**
   * current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
   */
  stageLayout: string;
  /**
   * current leaveMeeting state, true: leave, false: no-op.
   */
  leaveMeeting: boolean;
}
