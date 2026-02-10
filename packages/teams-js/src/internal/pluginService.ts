/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Plugin Service
 *
 * Manages plugin registration and lifecycle, enabling bidirectional communication
 * between plugins and the Teams JS SDK.
 *
 * @remarks
 * The plugin service is exposed as a set of module-level functions that can be
 * imported as a namespace:
 *
 * ```typescript
 * import { pluginService } from '@microsoft/teams-js';
 *
 * const plugin = await pluginService.register(MyPlugin);
 * ```
 *
 * **How message receiving works:**
 *
 * When a plugin calls `context.onReceiveMessage(func, handler)` during construction,
 * the handler is chained onto the existing handler in `HandlersPrivate.handlers` via
 * {@link addPluginHandler}. This means the core dispatch logic in `callHandler` is
 * never modified — plugin handlers execute as part of the normal handler chain.
 *
 * **How message sending works:**
 *
 * When a plugin calls `context.sendMessage(func, args)`, the call is forwarded to
 * `sendMessageToParent`, which sends the message to the Teams host through the
 * SDK's standard messaging infrastructure.
 *
 * **Lifecycle:**
 *
 * - {@link register} — Instantiates a plugin, wires up communication, stores it.
 * - {@link unregister} — Restores original handlers, calls `dispose()` if present, removes the plugin.
 * - {@link cleanup} — Unregisters all plugins.
 * - {@link reset} — Clears all plugin state (used during SDK uninitialization).
 *
 * @internal
 * Limited to Microsoft-internal use
 */

import { sendMessageToParent } from './communication';
import { addPluginHandler, getHandler, restoreHandlers } from './handlers';
import {
  PluginConstructor,
  PluginContext,
  PluginRegistrationResult,
  PluginResponse,
  ReceiveMessageCallback,
  SendMessageCallback,
} from './plugin';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from './telemetry';

const pluginServiceLogger = getLogger('pluginService');

// Module-level state
let plugins: Map<string, any> = new Map();
/** Tracks per-plugin: which handler names were registered and what the original handler was before chaining */
// eslint-disable-next-line @typescript-eslint/ban-types
let pluginOriginalHandlers: Map<string, Map<string, Function | undefined>> = new Map();

/**
 * Register a plugin class with the Teams JS SDK.
 *
 * @remarks
 * Instantiates the plugin class with a {@link PluginContext} that provides:
 * - `sendMessage` — forwards messages to the Teams host via `sendMessageToParent`.
 * - `onReceiveMessage` — chains the plugin's handler onto the existing handler in
 *   `HandlersPrivate.handlers`, so both the original SDK handler and the plugin
 *   handler run when the event fires.
 *
 * The plugin's constructor is called synchronously. If the plugin needs to perform
 * async setup, it should do so internally after construction.
 *
 * @typeParam T - The plugin instance type. Must have at minimum an `id: string` property.
 * @param PluginClass - The plugin class constructor. See {@link PluginConstructor}.
 * @returns A promise that resolves with the plugin instance.
 * @throws Will reject if the plugin constructor throws.
 *
 * @example
 * ```typescript
 * import { pluginService, PluginContext } from '@microsoft/teams-js';
 *
 * class ThemeLoggerPlugin {
 *   public readonly id = 'theme-logger';
 *   constructor(context: PluginContext) {
 *     context.onReceiveMessage('themeChange', (args) => {
 *       console.log('Theme changed to:', args?.[0]);
 *     });
 *   }
 * }
 *
 * const plugin = await pluginService.register(ThemeLoggerPlugin);
 * console.log(plugin.id); // 'theme-logger'
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function register<
  T extends {
    /** Unique string identifier for the plugin instance. */
    id: string;
  },
>(PluginClass: PluginConstructor<T>): Promise<T> {
  const sendMessage: SendMessageCallback = async (
    func: string,
    args?: (object | string | boolean)[],
  ): Promise<PluginResponse> => {
    try {
      const apiVersionTag = getApiVersionTag(ApiVersionNumber.V_2, ApiName.Plugin_SendMessage);
      sendMessageToParent(apiVersionTag, func, args);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      pluginServiceLogger('Error sending plugin message: %s', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Mutable reference to pluginId, set after plugin construction
  const ref = { pluginId: '' };

  const onReceiveMessage: ReceiveMessageCallback = (func: string, handler: (args?: any[]) => void): void => {
    // Snapshot the current handler before chaining, so we can restore it on unregister
    if (!pluginOriginalHandlers.has(ref.pluginId)) {
      pluginOriginalHandlers.set(ref.pluginId, new Map());
    }
    const originals = pluginOriginalHandlers.get(ref.pluginId)!;
    if (!originals.has(func)) {
      originals.set(func, getHandler(func));
    }

    // Chain onto the existing handler in HandlersPrivate.handlers
    addPluginHandler(func, handler);
  };

  const context: PluginContext = {
    sendMessage,
    onReceiveMessage,
  };

  // Instantiate plugin with context
  const plugin = new PluginClass(context);
  ref.pluginId = plugin.id;

  // Store plugin
  plugins.set(plugin.id, plugin);

  pluginServiceLogger('Registered plugin: %s', plugin.id);

  return plugin;
}

/**
 * Unregister a plugin from the SDK.
 *
 * @remarks
 * Performs the following cleanup in order:
 * 1. Restores any handlers in `HandlersPrivate.handlers` that were modified when the
 *    plugin chained its handlers via `onReceiveMessage`. The original handler (or absence
 *    of handler) is restored for each affected event name.
 * 2. Calls the plugin's `dispose()` method if one exists, awaiting its completion.
 * 3. Removes the plugin from the internal registry.
 *
 * If the plugin ID is not found, returns `{ success: false, error: '...' }` without
 * throwing.
 *
 * @param pluginId - The unique ID of the plugin to unregister (must match the plugin's
 *                   `id` property).
 * @returns A promise that resolves with a {@link PluginRegistrationResult} indicating
 *          whether the unregistration succeeded.
 *
 * @example
 * ```typescript
 * const result = await pluginService.unregister('my-plugin');
 * if (!result.success) {
 *   console.error('Failed to unregister:', result.error);
 * }
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function unregister(pluginId: string): Promise<PluginRegistrationResult> {
  try {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return {
        success: false,
        error: `Plugin with ID ${pluginId} not found`,
      };
    }

    // Restore original handlers that this plugin chained onto
    const originals = pluginOriginalHandlers.get(pluginId);
    if (originals) {
      restoreHandlers(Array.from(originals.keys()), originals);
      pluginOriginalHandlers.delete(pluginId);
    }

    // Call dispose if available
    if (plugin.dispose) {
      await plugin.dispose();
    }

    plugins.delete(pluginId);

    pluginServiceLogger('Unregistered plugin: %s', pluginId);

    return {
      success: true,
      pluginId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Retrieve a registered plugin instance by its ID.
 *
 * @param pluginId - The unique ID of the plugin (must match the plugin's `id` property).
 * @returns The plugin instance, or `undefined` if no plugin with the given ID is registered.
 *
 * @example
 * ```typescript
 * const plugin = pluginService.getPlugin('my-plugin');
 * if (plugin) {
 *   console.log('Found plugin:', plugin.id);
 * }
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getPlugin(pluginId: string): any | undefined {
  return plugins.get(pluginId);
}

/**
 * Retrieve all currently registered plugin instances.
 *
 * @returns An array of all registered plugin instances. Returns an empty array if
 *          no plugins are registered.
 *
 * @example
 * ```typescript
 * const allPlugins = pluginService.getAllPlugins();
 * console.log(`${allPlugins.length} plugin(s) registered`);
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getAllPlugins(): any[] {
  return Array.from(plugins.values());
}

/**
 * Unregister all currently registered plugins.
 *
 * @remarks
 * Iterates over all registered plugins and calls {@link unregister} for each one.
 * This restores all chained handlers and calls `dispose()` on each plugin that
 * implements it. After this call, the plugin registry is empty.
 *
 * @example
 * ```typescript
 * // Clean up all plugins before re-initialization
 * await pluginService.cleanup();
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function cleanup(): Promise<void> {
  const pluginIds = Array.from(plugins.keys());
  for (const pluginId of pluginIds) {
    await unregister(pluginId);
  }
}

/**
 * Reset all plugin state without calling `dispose()` on plugins.
 *
 * @remarks
 * Unlike {@link cleanup}, this does **not** call `dispose()` on plugins or restore
 * chained handlers. It simply clears all internal maps. This is intended for use
 * during SDK uninitialization (`_uninitialize`) where the entire handler registry
 * is being wiped anyway.
 *
 * For graceful plugin teardown, use {@link cleanup} instead.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function reset(): void {
  plugins.clear();
  pluginOriginalHandlers.clear();
  plugins = new Map();
  pluginOriginalHandlers = new Map();
}
