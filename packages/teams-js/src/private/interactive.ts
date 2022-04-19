import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

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
    containerState: ContainerState;
    containerId: string | undefined;
    shouldCreate: boolean;
    retryAfter: number;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * The global time servers current timestamp.
   */
  export interface NtpTimeInfo {
    ntpTime: string;
    ntpTimeInUTC: number;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Information about the fluid service to connect to.
   */
  export interface FluidTenantInfo {
    tenantId: string;
    ordererEndpoint: string;
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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
   * @returns True if the client created the container that's being used.
   */
  export function setFluidContainerId(containerId: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.meetingStage, FrameContexts.sidePanel);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      resolve(sendAndHandleSdkError('interactive.getClientRoles', clientId));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.meeting ? true : false;
  }
}
