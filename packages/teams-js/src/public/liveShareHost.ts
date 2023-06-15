import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

export namespace liveShare {
  /**
   * Meeting Roles.
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
   * State of the current Live Share sessions backing fluid container.
   */
  export enum ContainerState {
    /**
     * The call to `LiveShareHost.setContainerId()` successfully created the container mapping
     * for the current Live Share session.
     */
    added = 'Added',

    /**
     * A container mapping for the current Live Share Session already exists and should be used
     * when joining the sessions Fluid container.
     */
    alreadyExists = 'AlreadyExists',

    /**
     * The call to `LiveShareHost.setContainerId()` failed to create the container mapping due to
     * another client having already set the container ID for the current Live Share session.
     */
    conflict = 'Conflict',

    /**
     * A container mapping for the current Live Share session doesn't exist yet.
     */
    notFound = 'NotFound',
  }

  /**
   * Returned from `LiveShareHost.get/setFluidContainerId()` to specify the container mapping for the
   * current Live Share session.
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
     * If true, the local client should create the container and then save the created containers
     * ID to the mapping service.
     */
    shouldCreate: boolean;

    /**
     * If `containerId` is undefined and `shouldCreate` is false, the container isn't ready but
     * another client is creating it. The local client should wait the specified amount of time and
     * then ask for the container info again.
     */
    retryAfter: number;
  }

  /**
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
   * Returned from `LiveShareHost.getClientInfo()` to specify the client info for a
   * particular client in a Live Share session.
   */
  export interface IClientInfo {
    /**
     * Teams userId associated with clientId
     */
    userId: string;
    /**
     * Meeting roles associated with clientId
     */
    roles: UserMeetingRole[];
    /**
     * DisplayName associated with clientId
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
    return ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel) &&
      runtime.supports.interactive
      ? true
      : false;
  }
}

/**
 * Live Share host implementation for connecting to real-time collaborative sessions.
 * Designed for use with the `LiveShareClient` class in the `@microsoft/live-share` package.
 * Learn more at https://aka.ms/teamsliveshare
 */
export class LiveShareHost {
  /**
   * Returns the Fluid Tenant connection info for user's current context.
   */
  public getFluidTenantInfo(): Promise<liveShare.IFluidTenantInfo> {
    ensureSupported();
    return new Promise<liveShare.IFluidTenantInfo>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.getFluidTenantInfo'));
    });
  }

  /**
   * Returns the fluid access token for mapped container Id.
   *
   * @param containerId Fluid's container Id for the request. Undefined for new containers.
   * @returns token for connecting to Fluid's session.
   */
  public getFluidToken(containerId?: string): Promise<string> {
    ensureSupported();
    return new Promise<string>((resolve) => {
      // eslint-disable-next-line strict-null-checks/all
      resolve(sendAndHandleSdkError('interactive.getFluidToken', containerId));
    });
  }

  /**
   * Returns the ID of the fluid container associated with the user's current context.
   */
  public getFluidContainerId(): Promise<liveShare.IFluidContainerInfo> {
    ensureSupported();
    return new Promise<liveShare.IFluidContainerInfo>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.getFluidContainerId'));
    });
  }

  /**
   * Sets the ID of the fluid container associated with the current context.
   *
   * @remarks
   * If this returns false, the client should delete the container they created and then call
   * `getFluidContainerId()` to get the ID of the container being used.
   * @param containerId ID of the fluid container the client created.
   * @returns A data structure with a `containerState` indicating the success or failure of the request.
   */
  public setFluidContainerId(containerId: string): Promise<liveShare.IFluidContainerInfo> {
    ensureSupported();
    return new Promise<liveShare.IFluidContainerInfo>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.setFluidContainerId', containerId));
    });
  }

  /**
   * Returns the shared clock server's current time.
   */
  public getNtpTime(): Promise<liveShare.INtpTimeInfo> {
    ensureSupported();
    return new Promise<liveShare.INtpTimeInfo>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.getNtpTime'));
    });
  }

  /**
   * Associates the fluid client ID with a set of user roles.
   *
   * @param clientId The ID for the current user's Fluid client. Changes on reconnects.
   * @returns The roles for the current user.
   */
  public registerClientId(clientId: string): Promise<liveShare.UserMeetingRole[]> {
    ensureSupported();
    return new Promise<liveShare.UserMeetingRole[]>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.registerClientId', clientId));
    });
  }

  /**
   * Returns the roles associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The roles for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   */
  public getClientRoles(clientId: string): Promise<liveShare.UserMeetingRole[] | undefined> {
    ensureSupported();
    return new Promise<liveShare.UserMeetingRole[] | undefined>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.getClientRoles', clientId));
    });
  }

  /**
   * Returns the `IClientInfo` associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The info for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   */
  public getClientInfo(clientId: string): Promise<liveShare.IClientInfo | undefined> {
    ensureSupported();
    return new Promise<liveShare.IClientInfo | undefined>((resolve) => {
      resolve(sendAndHandleSdkError('interactive.getClientInfo', clientId));
    });
  }

  /**
   * Returns a host instance for the client that can be passed to the `LiveShareClient` class.
   *
   * @remarks
   * The application must first be initialized and may only be called from `meetingStage` or `sidePanel` contexts.
   */
  public static create(): LiveShareHost {
    ensureSupported();

    return new LiveShareHost();
  }
}

function ensureSupported(): void {
  if (!liveShare.isSupported()) {
    throw new Error('LiveShareHost Not supported');
  }
}
