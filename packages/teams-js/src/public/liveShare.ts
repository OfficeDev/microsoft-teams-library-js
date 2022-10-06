import { LiveShareHost } from '../internal/liveShareHost';

/**
 * Namespace to interact with the Live Share module-specific part of the SDK.
 *
 * @beta
 */
export namespace liveShare {
  const LIVE_SHARE_HOST = new LiveShareHost();
  let client: LiveShareClient | undefined;
  let initializing = false;

  interface LiveShareClient {
    new (options?: LiveShareOptions, host?: LiveShareHost);
    joinContainer(
      fluidContainerSchema: ContainerSchema,
      onContainerFirstCreated?: (container: IFluidContainer) => void,
    ): Promise<{
      container: IFluidContainer;
      services: AzureContainerServices;
      created: boolean;
    }>;
  }

  /**
   * Options used to configure the Live Share client.
   *
   * @beta
   */
  export interface LiveShareOptions {
    /**
     * Optional. Configuration to use when connecting to a custom Azure Fluid Relay instance.
     */
    readonly connection?: AzureConnectionConfig;

    /**
     * Optional. A logger instance to receive diagnostic messages.
     */
    readonly logger?: ITelemetryBaseLogger;

    /**
     * Optional. Function to lookup the ID of the container to use for local testing.
     *
     * @remarks
     * The default implementation attempts to retrieve the containerId from the `window.location.hash`.
     *
     * If the function returns 'undefined' a new container will be created.
     * @returns ID of the container to connect to or `undefined` if a new container should be created.
     */
    readonly getLocalTestContainerId?: () => string | undefined;

    /**
     * Optional. Function to save the ID of a newly created local test container.
     *
     * @remarks
     * The default implementation updates `window.location.hash` with the ID of the newly created
     * container.
     * @param containerId The ID of the container that was created.
     */
    readonly setLocalTestContainerId?: (containerId: string) => void;
  }

  /**
   * Fluid interface to output telemetry events.
   *
   * @beta
   */
  export interface ITelemetryBaseLogger {
    /**
     * An optional boolean which indicates to the user of this interface that tags (i.e. `ITaggedTelemetryPropertyType`
     * objects) are in use. Eventually this will be a required property, but this is a stopgap that allows older hosts
     * to continue to pass through telemetry without trouble (this property will simply show up undefined), while our
     * current logger implementation in `telmetry-utils` handles tags in a separate manner.
     */
    supportsTags?: true;
    send(event: ITelemetryBaseEvent): void;
  }

  /**
   * Fluid interface for logging telemetry statements.
   * Can contain any number of properties that get serialized as json payload.
   * @param category - category of the event, like "error", "performance", "generic", etc.
   * @param eventName - name of the event.
   *
   * @beta
   */
  export interface ITelemetryBaseEvent {
    [index: string]: unknown;
    category: string;
    eventName: string;
  }

  /**
   * The type of connection.
   * - "local" for local connections to a Fluid relay instance running on the localhost
   * - "remote" for client connections to the Azure Fluid Relay service
   *
   * @beta
   */
  export type AzureConnectionConfigType = 'local' | 'remote';

  /**
   * Parameters for establishing a connection with the Azure Fluid Relay.
   *
   * @beta
   */
  export interface AzureConnectionConfig {
    /**
     * The type of connection. Whether we're connecting to a remote Fluid relay server or a local instance.
     */
    type: AzureConnectionConfigType;
    /**
     * URI to the Azure Fluid Relay service discovery endpoint.
     */
    endpoint: string;
    /**
     * Instance that provides Azure Fluid Relay endpoint tokens.
     */
    tokenProvider: unknown;
  }

  /**
   * Parameters for establishing a remote connection with the Azure Fluid Relay.
   *
   * @beta
   */
  export interface AzureRemoteConnectionConfig extends AzureConnectionConfig {
    /**
     * The type of connection. Set to a remote connection.
     */
    type: 'remote';
    /**
     * Unique tenant identifier.
     */
    tenantId: string;
  }

  /**
   * Parameters for establishing a local connection with a local instance of the Azure Fluid Relay.
   *
   * @beta
   */
  export interface AzureLocalConnectionConfig extends AzureConnectionConfig {
    /**
     * The type of connection. Set to a remote connection.
     */
    type: 'local';
  }

  /**
   * AzureContainerServices is returned by the AzureClient alongside a FluidContainer.
   * It holds the functionality specifically tied to the Azure Fluid Relay, and how the data stored in
   * the FluidContainer is persisted in the backend and consumed by users. Any functionality regarding
   * how the data is handled within the FluidContainer itself, i.e. which data objects or DDSes to use,
   * will not be included here but rather on the FluidContainer class itself.
   *
   * @beta
   */
  export interface AzureContainerServices {
    /**
     * Provides an object that can be used to get the users that are present in this Fluid session and
     * listeners for when the roster has any changes from users joining/leaving the session
     */
    audience: unknown;
  }

  /**
   * The ContainerSchema declares the Fluid objects that will be available in the container.  It includes both the
   * instances of objects that are initially available upon container creation, as well as the types of objects that may
   * be dynamically created throughout the lifetime of the container.
   *
   * @beta
   */
  export interface ContainerSchema {
    /**
     * Defines loadable objects that will be created when the `Container` is first created.
     * It uses the key as the id and the value as the loadable object to create.
     *
     * @example
     * In the example below two objects will be created when the Container is first
     * created. One with id "map1" that will return a `SharedMap` and the other with
     * id "pair1" that will return a `KeyValueDataObject`.
     *
     * ```
     * {
     *   map1: SharedMap,
     *   pair1: KeyValueDataObject,
     * }
     * ```
     */
    initialObjects: LoadableObjectClassRecord;

    /**
     * Dynamic objects are Loadable objects that can be created after the initial Container creation.
     *
     * Types defined in `initialObjects` will always be available and are not required to be provided here.
     *
     * For best practice it's recommended to define all the dynamic types you create even if they are
     * included via initialObjects.
     */
    dynamicObjectTypes?: LoadableObjectClass<unknown>[];
  }

  /**
   * A mapping of string identifiers to classes that will later be used to instantiate a corresponding DataObject
   * or SharedObject in a LoadableObjectRecord.
   *
   * @beta
   */
  export type LoadableObjectClassRecord = Record<string, LoadableObjectClass<unknown>>;

  /**
   * An object with a constructor that will return an `IFluidLoadable`.
   * @typeParam T - The class of the loadable object
   *
   * @beta
   */
  export type LoadableObjectClass<T> = new (...args: unknown[]) => T;

  /**
   * Fluid container interface returned by joinContainer().
   *
   * @beta
   */
  export interface IFluidContainer {
    /**
     * Registers to receive an event.
     * @param event Name of event.
     * @param listener Function to receive event.
     */
    on(event: string, listener: (...args: unknown[]) => void);

    /**
     * Registers to receive an event only once.
     * @param event Name of event.
     * @param listener Function to receive event.
     */
    once(event: string, listener: (...args: unknown[]) => void);

    /**
     * Un-registers a previously registered event handler.
     * @param event Name of event.
     * @param listener Function previously registered.
     */
    off(event: string, listener: (...args: unknown[]) => void);

    /**
     * Provides the current connected state of the container
     */
    readonly connectionState: unknown;

    /**
     * A container is considered **dirty** if it has local changes that have not yet been acknowledged by the service.
     * You should always check the `isDirty` flag before closing the container or navigating away from the page.
     * Closing the container while `isDirty === true` may result in the loss of operations that have not yet been
     * acknowledged by the service.
     *
     * A container is considered dirty in the following cases:
     *
     * 1. The container has been created in the detached state, and either it has not been attached yet or it is
     * in the process of being attached (container is in `attaching` state). If container is closed prior to being
     * attached, host may never know if the file was created or not.
     *
     * 2. The container was attached, but it has local changes that have not yet been saved to service endpoint.
     * This occurs as part of normal op flow where pending operation (changes) are awaiting acknowledgement from the
     * service. In some cases this can be due to lack of network connection. If the network connection is down,
     * it needs to be restored for the pending changes to be acknowledged.
     */
    readonly isDirty: boolean;

    /**
     * Whether the container is disposed, which permanently disables it.
     */
    readonly disposed: boolean;

    /**
     * The collection of data objects and Distributed Data Stores (DDSes) that were specified by the schema.
     * These data objects and DDSes exist for the lifetime of the container.
     */
    readonly initialObjects: Record<string, unknown>;

    /**
     * The current attachment state of the container.  Once a container has been attached, it remains attached.
     * When loading an existing container, it will already be attached.
     */
    readonly attachState: string;

    /**
     * A newly created container starts detached from the collaborative service.
     * Calling `attach()` uploads the new container to the service and connects to the collaborative service.
     *
     * @remarks This should only be called when the container is in the
     * {@link @fluidframework/container-definitions#AttachState.Detatched} state.
     *
     * This can be determined by observing {@link IFluidContainer.attachState}.
     *
     * @returns A promise which resolves when the attach is complete, with the string identifier of the container.
     */
    attach(): Promise<string>;

    /**
     * Attempts to connect the container to the delta stream and process operations.
     * Will throw an error if unsuccessful.
     *
     * @remarks This should only be called when the container is in the
     * {@link @fluidframework/container-definitions#ConnectionState.Disconnected} state.
     *
     * This can be determined by observing {@link IFluidContainer.connectionState}.
     */
    connect(): void;

    /**
     * Disconnects the container from the delta stream and stops processing operations.
     *
     * @remarks This should only be called when the container is in the
     * {@link @fluidframework/container-definitions#ConnectionState.Connected} state.
     *
     * This can be determined by observing {@link IFluidContainer.connectionState}.
     */
    disconnect(): void;

    /**
     * Create a new data object or Distributed Data Store (DDS) of the specified type.
     *
     * @remarks In order to share the data object or DDS with other
     * collaborators and retrieve it later, store its handle in a collection like a SharedDirectory from your
     * initialObjects.
     *
     * @param objectClass - The class of data object or DDS to create
     */
    create<T>(objectClass: LoadableObjectClass<T>): Promise<T>;

    /**
     * Dispose of the container instance, permanently disabling it.
     */
    dispose(): void;
  }

  /**
   * Initializes the Live Share client.
   * @param options Optional. Configuration options passed to the Live Share client.
   *
   * @beta
   */
  export async function initialize(options?: LiveShareOptions): Promise<void> {
    if (initializing || client) {
      throw new Error('Live Share has already been initialized.');
    }

    try {
      initializing = true;
      const LiveShareClient = window['53de46f8-db62-4b8d-ae81-330f828ac86c'] as LiveShareClient;
      client = new LiveShareClient(options, LIVE_SHARE_HOST);
    } catch (err: unknown) {
      throw new Error(
        'Unable to initialize Live Share client. Ensure that your project includes "@microsoft/live-share"',
      );
    } finally {
      initializing = false;
    }
  }

  /**
   * Connects to the fluid container for the current teams context.
   *
   * @remarks
   * The first client joining the container will create the container resulting in the
   * `onContainerFirstCreated` callback being called. This callback can be used to set the initial
   * state of of the containers object prior to the container being attached.
   * @param fluidContainerSchema Fluid objects to create.
   * @param onContainerFirstCreated Optional. Callback that's called when the container is first created.
   * @returns The fluid `container` and `services` objects to use along with a `created` flag that if true means the container had to be created.
   *
   * @beta
   */
  export async function joinContainer(
    fluidContainerSchema: ContainerSchema,
    onContainerFirstCreated?: (container: IFluidContainer) => void,
  ): Promise<{
    container: IFluidContainer;
    services: AzureContainerServices;
    created: boolean;
  }> {
    if (client) {
      return await client.joinContainer(fluidContainerSchema, onContainerFirstCreated);
    } else {
      throw new Error('Live Share must first be initialized');
    }
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Returns the LiveShareHost object. Called by existing apps that use the TeamsFluidClient
   * directly. This prevents existing apps from breaking and will be removed when Live Share
   * goes GA.
   *
   * @beta
   */
  export function getHost(): LiveShareHost {
    return LIVE_SHARE_HOST;
  }
}
