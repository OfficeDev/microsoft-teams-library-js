/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Plugin Interfaces
 *
 * Defines the types and interfaces for the plugin system,
 * enabling bidirectional communication between plugins and the Teams JS SDK.
 *
 * @remarks
 * The plugin system allows third-party or internal modules to extend the Teams JS SDK
 * without modifying its core handler dispatch logic. Plugins implement the {@link IPlugin}
 * interface and are activated with a {@link PluginContext} that provides two communication
 * channels:
 *
 * - **sendMessage**: Send messages from the plugin to the Teams host (app → host direction).
 *   Wraps the SDK's `sendMessageToParent` internally.
 *
 * - **onReceiveMessage**: Subscribe to messages coming from the host (host → app direction).
 *   Chains the plugin's handler onto the existing handler in the SDK's handler registry,
 *   so both the original handler and the plugin handler execute when the event fires.
 *
 * Plugins are created by the consumer and passed as an array. The consumer retains a direct
 * reference to each plugin and can call plugin-specific methods at any time.
 *
 * @example
 * ```typescript
 * import { pluginService, IPlugin, PluginContext } from '@microsoft/teams-js';
 *
 * class CatalystPlugin implements IPlugin {
 *   public readonly id = 'catalyst';
 *   activate(context: PluginContext): void {
 *     context.onReceiveMessage('themeChange', (args) => {
 *       console.log('Theme changed:', args);
 *     });
 *   }
 *   async dispose(): Promise<void> { }
 * }
 *
 * const catalystPlugin = new CatalystPlugin();
 * pluginService.activatePlugins([catalystPlugin]);
 *
 * // Consumer holds the reference — call plugin methods directly:
 * catalystPlugin.triggerPrompt('hello');
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */

/**
 * Response returned from a plugin's {@link SendMessageCallback} invocation.
 *
 * @remarks
 * When a plugin calls `context.sendMessage(func, args)`, the message is forwarded
 * to the Teams host via `sendMessageToParent`. The returned `PluginResponse` indicates
 * whether the send operation itself succeeded, not whether the host processed the message.
 *
 * @property success - `true` if the message was sent without throwing an error.
 * @property data - Optional payload returned from the send operation (currently always `undefined`).
 * @property error - Error message string if the send operation failed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface PluginResponse {
  /** Whether the operation succeeded. */
  success: boolean;
  /** Optional payload returned from the operation. */
  data?: any;
  /** Error message if the operation failed. */
  error?: string;
}

/**
 * Result of a plugin activation ({@link pluginService.activatePlugins}) or
 * deactivation ({@link pluginService.deactivatePlugin}) operation.
 *
 * @property success - `true` if the operation completed successfully.
 * @property pluginId - The ID of the plugin that was activated/deactivated (set on success).
 * @property error - Error message string if the operation failed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface PluginRegistrationResult {
  /** Whether the operation succeeded. */
  success: boolean;
  /** The ID of the affected plugin. */
  pluginId?: string;
  /** Error message if the operation failed. */
  error?: string;
}

/**
 * Callback provided to plugins for sending messages to the Teams host.
 *
 * @remarks
 * This wraps the SDK's internal `sendMessageToParent` call. The plugin does not need
 * to know about API version tags or the underlying messaging protocol.
 *
 * @param func - The message function name (e.g., `'myPlugin.doAction'`).
 * @param args - Optional array of arguments to pass with the message.
 * @param messageArgs - Optional additional message metadata.
 * @returns A promise that resolves with a {@link PluginResponse} indicating whether the
 *          send operation succeeded.
 *
 * @example
 * ```typescript
 * const response = await context.sendMessage('myPlugin.doAction', [{ key: 'value' }]);
 * if (!response.success) {
 *   console.error('Failed to send:', response.error);
 * }
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type SendMessageCallback = (
  func: string,
  args?: (object | string | boolean)[],
  messageArgs?: object,
) => Promise<PluginResponse>;

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Callback provided to plugins for subscribing to incoming messages from the Teams host.
 *
 * @remarks
 * When called, this chains the plugin's handler onto the existing handler registered in
 * the SDK's handler registry (`HandlersPrivate.handlers`). If a built-in handler already
 * exists for the given function name (e.g., `'themeChange'`), both the original handler
 * and the plugin handler will execute when the event fires. The original handler's return
 * value is preserved.
 *
 * Multiple plugins can subscribe to the same event; each call adds another handler in
 * the chain.
 *
 * @param func - The event/function name to subscribe to (e.g., `'themeChange'`, `'contextChange'`).
 * @param handler - The function to invoke when the event is dispatched. Receives the event's
 *                  arguments array.
 *
 * @example
 * ```typescript
 * context.onReceiveMessage('themeChange', (args) => {
 *   const theme = args?.[0];
 *   console.log('New theme:', theme);
 * });
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */

/**
 * Handler function invoked when a subscribed event fires.
 *
 * @param args - The arguments passed along with the event, if any.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type ReceiveMessageHandler = (args?: any[]) => void;

/**
 * Callback provided to plugins for subscribing to incoming messages from the Teams host.
 *
 * @remarks
 * When called, this chains the plugin's handler onto the existing handler registered in
 * the SDK's handler registry. If a built-in handler already exists for the given function
 * name (e.g., `'themeChange'`), both the original handler and the plugin handler will
 * execute when the event fires.
 *
 * @param func - The event/function name to subscribe to (e.g., `'themeChange'`, `'contextChange'`).
 * @param handler - The function to invoke when the event is dispatched.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ReceiveMessageCallback {
  /** Subscribes to the named event with the given handler. */
  (func: string, handler: ReceiveMessageHandler): void;
}

/**
 * Context object provided to a plugin during registration via {@link pluginService.register}.
 *
 * @remarks
 * The `PluginContext` is the plugin's sole interface for communicating with the Teams host
 * through the SDK. It is passed to the plugin's constructor and should be stored by the
 * plugin for use throughout its lifecycle.
 *
 * @property sendMessage - Send a message from the plugin to the Teams host.
 *           See {@link SendMessageCallback}.
 * @property onReceiveMessage - Subscribe to messages/events coming from the Teams host.
 *           See {@link ReceiveMessageCallback}.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface PluginContext {
  sendMessage: SendMessageCallback;
  onReceiveMessage: ReceiveMessageCallback;
}

/**
 * Interface that all plugins must implement.
 *
 * @remarks
 * Plugins are created by the consumer and passed to {@link pluginService.activatePlugins}.
 * The consumer retains a direct reference to each plugin instance, so plugin-specific
 * methods can be called at any time without going through the plugin service.
 *
 * A plugin must:
 * 1. Expose a readonly `id` property (a unique string identifier).
 * 2. Implement `activate(context)` which is called by the service to wire up communication.
 * 3. Optionally implement `dispose()` for cleanup when deactivated.
 *
 * @example
 * ```typescript
 * class CatalystPlugin implements IPlugin {
 *   public readonly id = 'catalyst';
 *   private context?: PluginContext;
 *
 *   activate(context: PluginContext): void {
 *     this.context = context;
 *     context.onReceiveMessage('themeChange', (args) => {
 *       console.log('Theme changed:', args?.[0]);
 *     });
 *   }
 *
 *   async dispose(): Promise<void> { // cleanup }
 *
 *   triggerPrompt(text: string): void {
 *     this.context?.sendMessage('prompt', [text]);
 *   }
 * }
 *
 * const plugin = new CatalystPlugin();
 * pluginService.activatePlugins([plugin]);
 * plugin.triggerPrompt('hello');
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IPlugin {
  /** Unique string identifier for the plugin. */
  readonly id: string;

  /**
   * Called by the plugin service to activate the plugin with a communication context.
   *
   * @param context - The {@link PluginContext} providing send/receive capabilities.
   */
  activate(context: PluginContext): void;

  /**
   * Optional cleanup method called when the plugin is deactivated.
   * @returns A promise or void.
   */
  dispose?(): Promise<void> | void;
}

/**
 * Represents a message received from the web content layer (e.g., MetaOS application).
 *
 * @remarks
 * This interface is used by {@link IPluginService.broadcastReceivedMessage} to distribute
 * incoming messages to all plugins that have registered handlers for the given function name.
 *
 * @property func - The function/event name identifying the message type.
 * @property args - Optional arguments accompanying the message.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IWebContentRequestMessage {
  /** The function/event name identifying the message type. */
  func: string;
  /** Optional arguments accompanying the message. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
}

/**
 * Interface for the Plugin Service that manages plugin activation and lifecycle.
 *
 * @remarks
 * The plugin service enables bidirectional communication between plugins and the
 * Teams JS SDK / MetaOS host application. Plugins are created by the consumer and
 * passed to the service for activation.
 *
 * @example
 * ```typescript
 * const catalyst = new CatalystPlugin();
 * pluginService.activatePlugins([catalyst]);
 * catalyst.triggerPrompt('Hello?');
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IPluginService {
  /**
   * Activate an array of plugins by calling `activate(context)` on each one.
   *
   * @param plugins - The plugin instances to activate.
   */
  activatePlugins(plugins: IPlugin[]): void;

  /**
   * Deactivate a plugin by ID.
   *
   * @param pluginId - The ID of the plugin to deactivate.
   * @returns Result of the deactivation attempt.
   */
  deactivatePlugin(pluginId: string): Promise<PluginRegistrationResult>;

  /**
   * Get an active plugin by ID.
   *
   * @param pluginId - The ID of the plugin.
   * @returns The plugin instance, or undefined if not found.
   */
  getPlugin(pluginId: string): IPlugin | undefined;

  /**
   * Get all active plugins.
   *
   * @returns Array of all active plugins.
   */
  getAllPlugins(): IPlugin[];

  /**
   * Deactivate all plugins and clean up resources.
   */
  deactivateAll(): Promise<void>;
}
