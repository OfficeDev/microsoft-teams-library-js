import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';

export namespace interactive {
  /**
   * @hidden
   * Hide from docs
   * ------
   * Allowed roles during a meeting.
   */
  export enum UserMeetingRole {
    guest = 'Guest',
    attendee = 'Attendee',
    presenter = 'Presenter',
    organizer = 'Organizer',
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * State of the meetings backing fluid container.
   */
  export enum ContainerState {
    added = 'Added',
    alreadyExists = 'AlreadyExists',
    conflict = 'Conflict',
    notFound = 'NotFound',
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Information about the meetings backing fluid container.
   */
  export interface FluidContainerInfo {
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
   * Hide from docs
   * ------
   * The global time servers current timestamp.
   */
  export interface NtpTimeInfo {
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
   * Hide from docs
   * ------
   * Information about the fluid service to connect to.
   */
  export interface FluidTenantInfo {
    /**
     * ID of the Fluid Relay Service tenant to use.
     */
    tenantId: string;

    /**
     * Endpoint to configure for the orderer.
     */
    ordererEndpoint: string;

    /**
     * Endpoint to configure for storage.
     */
    storageEndpoint: string;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the Fluid Tenant connection info for user's current context.
   */
  export function getFluidTenantInfo(): Promise<FluidTenantInfo> {
    return new Promise<FluidTenantInfo>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getFluidTenantInfo'));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the fluid access token for mapped container Id.
   *
   * @param containerId Fluid's container Id for the request. Undefined for new containers.
   * @returns token for connecting to Fluid's session.
   */
  export function getFluidToken(containerId?: string): Promise<string> {
    return new Promise<string>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getFluidToken', containerId));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the ID of the fluid container associated with the user's current context.
   */
  export function getFluidContainerId(): Promise<FluidContainerInfo> {
    return new Promise<FluidContainerInfo>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getFluidContainerId'));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Sets the ID of the fluid container associated with the current context.
   *
   * @remarks
   * If this returns false, the client should delete the container they created and then call
   * `getFluidContainerId()` to get the ID of the container being used.
   * @param containerId ID of the fluid container the client created.
   * @returns A data structure with a `containerState` indicating the success or failure of the request.
   */
  export function setFluidContainerId(containerId: string): Promise<FluidContainerInfo> {
    return new Promise<FluidContainerInfo>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.setFluidContainerId', containerId));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the shared clock server's current time.
   */
  export function getNtpTime(): Promise<NtpTimeInfo> {
    return new Promise<NtpTimeInfo>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getNtpTime'));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Associates the fluid client ID with a set of user roles.
   *
   * @param clientId The ID for the current user's Fluid client. Changes on reconnects.
   * @returns The roles for the current user.
   */
  export function registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    return new Promise<UserMeetingRole[]>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.registerClientId', clientId));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the roles associated with a client ID.
   *
   * @param clientId The Client ID the message was received from.
   * @returns The roles for a given client. Returns `undefined` if the client ID hasn't been registered yet.
   */
  export function getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
    return new Promise<UserMeetingRole[] | undefined>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);

      resolve(sendAndHandleSdkError('interactive.getClientRoles', clientId));
    });
  }
}
