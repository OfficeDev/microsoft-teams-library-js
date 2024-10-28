import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const interactiveTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * APIs involving Live Share, a framework for building real-time collaborative apps.
 * For more information, visit https://aka.ms/teamsliveshare
 *
 * @see LiveShareHost
 */

/**
 * @hidden
 * The meeting roles of a user.
 * Used in Live Share for its role verification feature.
 * For more information, visit https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/teams-live-share-capabilities?tabs=javascript#role-verification-for-live-data-structures
 */
export enum UserMeetingRole {
  /**
   * Guest role.
   */
  guest = 'Guest',
  /**
   * Attendee role.
   */
  attendee = 'Attendee',
  /**
   * Presenter role.
   */
  presenter = 'Presenter',
  /**
   * Organizer role.
   */
  organizer = 'Organizer',
}

/**
 * @hidden
 * State of the current Live Share session's Fluid container.
 * This is used internally by the `LiveShareClient` when joining a Live Share session.
 */
export enum ContainerState {
  /**
   * The call to `LiveShareHost.setContainerId()` successfully created the container mapping
   * for the current Live Share session.
   */
  added = 'Added',
/**
 * @hidden
 * State of the current Live Share session's Fluid container.
 * This is used internally by the `LiveShareClient` when joining a Live Share session.
 */
export enum ContainerState {
  /**
   * The call to `LiveShareHost.setContainerId()` successfully created the container mapping
   * for the current Live Share session.
   */
  added = 'Added',

  /**
   * A container mapping for the current Live Share session already exists.
   * This indicates to Live Share that a new container does not need be created.
   */
  alreadyExists = 'AlreadyExists',
  /**
   * A container mapping for the current Live Share session already exists.
   * This indicates to Live Share that a new container does not need be created.
   */
  alreadyExists = 'AlreadyExists',

  /**
   * The call to `LiveShareHost.setContainerId()` failed to create the container mapping.
   * This happens when another client has already set the container ID for the session.
   */
  conflict = 'Conflict',
  /**
   * The call to `LiveShareHost.setContainerId()` failed to create the container mapping.
   * This happens when another client has already set the container ID for the session.
   */
  conflict = 'Conflict',

  /**
   * A container mapping for the current Live Share session does not yet exist.
   * This indicates to Live Share that a new container should be created.
   */
  notFound = 'NotFound',
}
  /**
   * A container mapping for the current Live Share session does not yet exist.
   * This indicates to Live Share that a new container should be created.
   */
  notFound = 'NotFound',
}

/**
 * @hidden
 * Returned from `LiveShareHost.getFluidContainerId()` and `LiveShareHost.setFluidContainerId`.
 * This response specifies the container mapping information for the current Live Share session.
 */
export interface IFluidContainerInfo {
  /**
   * State of the containerId mapping.
   */
  containerState: ContainerState;
/**
 * @hidden
 * Returned from `LiveShareHost.getFluidContainerId()` and `LiveShareHost.setFluidContainerId`.
 * This response specifies the container mapping information for the current Live Share session.
 */
export interface IFluidContainerInfo {
  /**
   * State of the containerId mapping.
   */
  containerState: ContainerState;

  /**
   * ID of the container to join for the meeting. Undefined if the container hasn't been
   * created yet.
   */
  containerId: string | undefined;
  /**
   * ID of the container to join for the meeting. Undefined if the container hasn't been
   * created yet.
   */
  containerId: string | undefined;

  /**
   * If true, the local client should create the container and then save the created containers
   * ID to the mapping service.
   */
  shouldCreate: boolean;
  /**
   * If true, the local client should create the container and then save the created containers
   * ID to the mapping service.
   */
  shouldCreate: boolean;

  /**
   * If `containerId` is undefined and `shouldCreate` is false, the container isn't ready
   * but another client is creating it. In this case, the local client should wait the specified
   * amount of time before calling `LiveShareHost.getFluidContainerId()` again.
   */
  retryAfter: number;
}
  /**
   * If `containerId` is undefined and `shouldCreate` is false, the container isn't ready
   * but another client is creating it. In this case, the local client should wait the specified
   * amount of time before calling `LiveShareHost.getFluidContainerId()` again.
   */
  retryAfter: number;
}

/**
 * @hidden
 * Returned from `LiveShareHost.getNtpTime()` to specify the global timestamp for the current
 * Live Share session.
 */
export interface INtpTimeInfo {
  /**
   * ISO 8601 formatted server time. For example: '2019-09-07T15:50-04:00'
   */
  ntpTime: string;
/**
 * @hidden
 * Returned from `LiveShareHost.getNtpTime()` to specify the global timestamp for the current
 * Live Share session.
 */
export interface INtpTimeInfo {
  /**
   * ISO 8601 formatted server time. For example: '2019-09-07T15:50-04:00'
   */
  ntpTime: string;

  /**
   * Server time expressed as the number of milliseconds since the ECMAScript epoch.
   */
  ntpTimeInUTC: number;
}
  /**
   * Server time expressed as the number of milliseconds since the ECMAScript epoch.
   */
  ntpTimeInUTC: number;
}

/**
 * @hidden
 * Returned from `LiveShareHost.getFluidTenantInfo()` to specify the Fluid service to use for the
 * current Live Share session.
 */
export interface IFluidTenantInfo {
  /**
   * The Fluid Tenant ID Live Share should use.
   */
  tenantId: string;
/**
 * @hidden
 * Returned from `LiveShareHost.getFluidTenantInfo()` to specify the Fluid service to use for the
 * current Live Share session.
 */
export interface IFluidTenantInfo {
  /**
   * The Fluid Tenant ID Live Share should use.
   */
  tenantId: string;

  /**
   * The Fluid service endpoint Live Share should use.
   */
  serviceEndpoint: string;
}
  /**
   * The Fluid service endpoint Live Share should use.
   */
  serviceEndpoint: string;
}

/**
 * @hidden
 * Returned from `LiveShareHost.getClientInfo()` to specify the client info for a
 * particular client in a Live Share session.
 */
export interface IClientInfo {
  /**
   * The host user's `userId` associated with a given `clientId`
   */
  userId: string;
  /**
   * User's meeting roles associated with a given `clientId`
   */
  roles: UserMeetingRole[];
  /**
   * The user's display name associated with a given `clientId`.
   * If this returns as `undefined`, the user may need to update their host client.
   */
  displayName?: string;
}
/**
 * @hidden
 * Returned from `LiveShareHost.getClientInfo()` to specify the client info for a
 * particular client in a Live Share session.
 */
export interface IClientInfo {
  /**
   * The host user's `userId` associated with a given `clientId`
   */
  userId: string;
  /**
   * User's meeting roles associated with a given `clientId`
   */
  roles: UserMeetingRole[];
  /**
   * The user's display name associated with a given `clientId`.
   * If this returns as `undefined`, the user may need to update their host client.
   */
  displayName?: string;
}

/**
 * Checks if the interactive capability is supported by the host
 * @returns boolean to represent whether the interactive capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel, FrameContexts.content) &&
    runtime.supports.interactive
    ? true
    : false;
}

/**
 * Live Share host implementation for connecting to real-time collaborative sessions.
 * Designed for use with the `LiveShareClient` class in the `@microsoft/live-share` package.
 * Learn more at https://aka.ms/teamsliveshare
 *
 * @remarks
 * The `LiveShareClient` class from Live Share uses the hidden API's to join/manage the session.
 * To create a new `LiveShareHost` instance use the static `LiveShareHost.create()` function.
 */
export class LiveShareHost {
  /**
   * @hidden
   * Returns the Fluid Tenant connection info for user's current context.
   */
  public getFluidTenantInfo(): Promise<IFluidTenantInfo> {
  public getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    ensureSupported();
    return new Promise<IFluidTenantInfo>((resolve) => {
    return new Promise<IFluidTenantInfo>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetFluidTenantInfo),
          'interactive.getFluidTenantInfo',
        ),
      );
    });
  }

  /**
   * @hidden
   * Returns the fluid access token for mapped container Id.
   *
   * @param containerId Fluid's container Id for the request. Undefined for new containers.
   * @returns token for connecting to Fluid's session.
   */
  public getFluidToken(containerId?: string): Promise<string> {
    ensureSupported();
    return new Promise<string>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetFluidToken),
          'interactive.getFluidToken',
          // eslint-disable-next-line strict-null-checks/all
          containerId,
        ),
      );
    });
  }

  /**
   * @hidden
   * Returns the ID of the fluid container associated with the user's current context.
   */
  public getFluidContainerId(): Promise<IFluidContainerInfo> {
  public getFluidContainerId(): Promise<IFluidContainerInfo> {
    ensureSupported();
    return new Promise<IFluidContainerInfo>((resolve) => {
    return new Promise<IFluidContainerInfo>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetFluidContainerId),
          'interactive.getFluidContainerId',
        ),
      );
    });
  }

  /**
   * @hidden
   * Sets the ID of the fluid container associated with the current context.
   *
   * @remarks
   * If this returns false, the client should delete the container they created and then call
   * `getFluidContainerId()` to get the ID of the container being used.
   * @param containerId ID of the fluid container the client created.
   * @returns A data structure with a `containerState` indicating the success or failure of the request.
   */
  public setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
  public setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    ensureSupported();
    return new Promise<IFluidContainerInfo>((resolve) => {
    return new Promise<IFluidContainerInfo>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_SetFluidContainerId),
          'interactive.setFluidContainerId',
          containerId,
        ),
      );
    });
  }

  /**
   * @hidden
   * Returns the shared clock server's current time.
   */
  public getNtpTime(): Promise<INtpTimeInfo> {
  public getNtpTime(): Promise<INtpTimeInfo> {
    ensureSupported();
    return new Promise<INtpTimeInfo>((resolve) => {
    return new Promise<INtpTimeInfo>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetNtpTime),
          'interactive.getNtpTime',
        ),
      );
    });
  }

  /**
   * @hidden
   * Associates the fluid client ID with a set of user roles.
   *
   * @param clientId The ID for the current user's Fluid client. Changes on reconnects.
   * @returns The roles for the current user.
   */
  public registerClientId(clientId: string): Promise<UserMeetingRole[]> {
  public registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    ensureSupported();
    return new Promise<UserMeetingRole[]>((resolve) => {
    return new Promise<UserMeetingRole[]>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_RegisterClientId),
          'interactive.registerClientId',
          clientId,
        ),
      );
    });
  }

  /**
   * @hidden
   * Returns the roles associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The roles for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   */
  public getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
  public getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
    ensureSupported();
    return new Promise<UserMeetingRole[] | undefined>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetClientRoles),
          'interactive.getClientRoles',
          clientId,
        ),
      );
    });
  }

  /**
   * @hidden
   * Returns the `IClientInfo` associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The info for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   */
  public getClientInfo(clientId: string): Promise<IClientInfo | undefined> {
    ensureSupported();
    return new Promise<IClientInfo | undefined>((resolve) => {
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(interactiveTelemetryVersionNumber, ApiName.Interactive_GetClientInfo),
          'interactive.getClientInfo',
          clientId,
        ),
      );
    });
  }

  /**
   * Factories a new `LiveShareHost` instance for use with the `LiveShareClient` class
   * in the `@microsoft/live-share` package.
   *
   * @remarks
   * `app.initialize()` must first be called before using this API.
   * This API can only be called from `meetingStage` or `sidePanel` contexts.
   */
  public static create(): LiveShareHost {
    ensureSupported();

    return new LiveShareHost();
  }
}

function ensureSupported(): void {
  if (!isSupported()) {
    throw new Error('LiveShareHost Not supported');
  }
}
