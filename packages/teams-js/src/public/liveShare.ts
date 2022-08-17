import type { AzureConnectionConfig, AzureContainerServices, ITelemetryBaseLogger } from '@fluidframework/azure-client';
import type { ContainerSchema, IFluidContainer } from '@fluidframework/fluid-static';

import { LiveShareHost } from '../internal/liveShareHost';

/**
 * Namespace to interact with the Live Share module-specific part of the SDK.
 *
 * @beta
 */
export namespace liveShare {
  const LIVE_SHARE_PACKAGE = '@microsoft/live-share';
  const LIVE_SHARE_HOST = new LiveShareHost();
  let client: LiveShareClient;

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
   * Initializes the Live Share client.
   * @param options Optional. Configuration options passed to the Live Share client.
   *
   * @beta
   */
  export async function initialize(options?: LiveShareOptions): Promise<void> {
    if (client) {
      throw new Error('Live Share has already been initialized.');
    }

    try {
      const pkg = (await import(LIVE_SHARE_PACKAGE)) as { TeamsFluidClient: LiveShareClient };
      client = new pkg.TeamsFluidClient(options, LIVE_SHARE_HOST);
    } catch (err: unknown) {
      throw new Error(
        'Unable to initialize Live Share client. Ensure that your project includes "@microsoft/live-share"',
      );
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
   */
  export function getHost(): LiveShareHost {
    return LIVE_SHARE_HOST;
  }
}
