import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @hidden
 * Allowed roles during a meeting.
 *
 * @beta
 */
export enum UserMeetingRole {
  guest = 'Guest',
  attendee = 'Attendee',
  presenter = 'Presenter',
  organizer = 'Organizer',
}

/**
 * @hidden
 * State of the current Live Share sessions backing fluid container.
 *
 * @beta
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
 * @hidden
 * Returned from `LiveShareHost.get/setFluidContainerId()` to specify the container mapping for the
 * current Live Share session.
 *
 * @beta
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
 * @hidden
 * Returned from `LiveShareHost.getNtpTime()` to specify the global timestamp for the current
 * Live Share session.
 *
 * @beta
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
 * @hidden
 * Returned from `LiveShareHost.getFluidTenantInfo()` to specify the Fluid service to use for the
 * current Live Share session.
 *
 * @beta
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
 * Live Share host implementation for O365 and Teams clients.
 *
 * @beta
 */
export class LiveShareHost {
  /**
   * @hidden
   * Returns the Fluid Tenant connection info for user's current context.
   *
   * @beta
   */
  public getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    return new Promise<IFluidTenantInfo>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getFluidTenantInfo'));
    });
  }

  /**
   * @hidden
   * Returns the fluid access token for mapped container Id.
   *
   * @param containerId Fluid's container Id for the request. Undefined for new containers.
   * @returns token for connecting to Fluid's session.
   *
   * @beta
   */
  public getFluidToken(containerId?: string): Promise<string> {
    return new Promise<string>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      // eslint-disable-next-line strict-null-checks/all
      resolve(sendAndHandleSdkError('interactive.getFluidToken', containerId));
    });
  }

  /**
   * @hidden
   * Returns the ID of the fluid container associated with the user's current context.
   *
   * @beta
   */
  public getFluidContainerId(): Promise<IFluidContainerInfo> {
    return new Promise<IFluidContainerInfo>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getFluidContainerId'));
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
   *
   * @beta
   */
  public setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    return new Promise<IFluidContainerInfo>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.setFluidContainerId', containerId));
    });
  }

  /**
   * @hidden
   * Returns the shared clock server's current time.
   *
   * @beta
   */
  public getNtpTime(): Promise<INtpTimeInfo> {
    return new Promise<INtpTimeInfo>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getNtpTime'));
    });
  }

  /**
   * @hidden
   * Associates the fluid client ID with a set of user roles.
   *
   * @param clientId The ID for the current user's Fluid client. Changes on reconnects.
   * @returns The roles for the current user.
   *
   * @beta
   */
  public registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    return new Promise<UserMeetingRole[]>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.registerClientId', clientId));
    });
  }

  /**
   * @hidden
   * Returns the roles associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The roles for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   *
   * @beta
   */
  public getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
    return new Promise<UserMeetingRole[] | undefined>((resolve) => {
      ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getClientRoles', clientId));
    });
  }

  /**
   * Returns a host instance for the client that can be passed to the `LiveShareClient` class.
   *
   * @remarks
   * The application must first be initialized and may only be called from `meetingStage` or `sidePanel` contexts.
   *
   * @beta
   */
  public static create(): LiveShareHost {
    ensureInitialized(runtime, FrameContexts.meetingStage, FrameContexts.sidePanel);

    return new LiveShareHost();
  }
}
