/**
 * Plugin Interfaces
 *
 * Defines the types and interfaces for the plugin system,
 * enabling bidirectional communication between plugins and the Teams JS SDK.
 *
 * @remarks
 * The plugin system allows third-party or internal modules to extend the Teams JS SDK
 * without modifying its core handler dispatch logic. Plugins receive a {@link PluginContext}
 * during registration that provides two communication channels:
 *
 * - **sendMessage**: Send messages from the plugin to the Teams host (app → host direction).
 *   Wraps the SDK's `sendMessageToParent` internally.
 *
 * - **onReceiveMessage**: Subscribe to messages coming from the host (host → app direction).
 *   Chains the plugin's handler onto the existing handler in the SDK's handler registry,
 *   so both the original handler and the plugin handler execute when the event fires.
 *
 * @example
 * ```typescript
 * import { pluginService, PluginContext } from '@microsoft/teams-js';
 *
 * class MyPlugin {
 *   public readonly id = 'my-plugin';
 *   constructor(context: PluginContext) {
 *     context.onReceiveMessage('themeChange', (args) => {
 *       console.log('Theme changed:', args);
 *     });
 *     context.sendMessage('myPlugin.ready', [{ version: '1.0' }]);
 *   }
 *   async dispose() { // optional cleanup  }
 * }
 *
 * const plugin = await pluginService.register(MyPlugin);
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
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}

/**
 * Result of a plugin registration ({@link pluginService.register}) or
 * unregistration ({@link pluginService.unregister}) operation.
 *
 * @property success - `true` if the operation completed successfully.
 * @property pluginId - The ID of the plugin that was registered/unregistered (set on success).
 * @property error - Error message string if the operation failed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface PluginRegistrationResult {
  success: boolean;
  pluginId?: string;
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
 * Constructor type for plugin classes that can be registered with {@link pluginService.register}.
 *
 * @remarks
 * A plugin class must:
 * 1. Accept a {@link PluginContext} as its sole constructor parameter.
 * 2. Expose a public `id` property (a unique string identifier for the plugin).
 * 3. Optionally implement a `dispose(): Promise<void> | void` method for cleanup
 *    when the plugin is unregistered.
 *
 * @typeParam T - The plugin instance type. Must have at minimum an `id: string` property.
 *
 * @example
 * ```typescript
 * class MyPlugin {
 *   public readonly id = 'my-plugin';
 *   constructor(private context: PluginContext) {
 *     context.onReceiveMessage('themeChange', this.onThemeChange.bind(this));
 *   }
 *   private onThemeChange(args?: any[]): void { // handle theme change  }
 *   async dispose(): Promise<void> { // cleanup  }
 * }
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type PluginConstructor<
  T extends {
    /** Unique string identifier for the plugin instance. */
    id: string;
  },
> = new (context: PluginContext) => T;
