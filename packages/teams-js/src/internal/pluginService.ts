/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Plugin Service
 *
 * Manages plugin activation and lifecycle, enabling bidirectional communication
 * between plugins and the Teams JS SDK.
 *
 * @remarks
 * Plugins are created by the consumer and passed to {@link activatePlugins} as an array.
 * The consumer retains direct references to plugin instances and can call plugin-specific
 * methods at any time.
 *
 * ```typescript
 * import { pluginService, IPlugin, PluginContext } from '@microsoft/teams-js';
 *
 * const catalystPlugin = new CatalystPlugin();
 * pluginService.activatePlugins([catalystPlugin]);
 * catalystPlugin.triggerPrompt('hello');
 * ```
 *
 * **How message receiving works:**
 *
 * When a plugin calls `context.onReceiveMessage(func, handler)` inside `activate()`,
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
 * - {@link activatePlugins} — Calls `activate(context)` on each plugin, wires up communication, stores them.
 * - {@link deactivatePlugin} — Restores original handlers, calls `dispose()` if present, removes the plugin.
 * - {@link deactivateAll} — Deactivates all plugins.
 * - {@link broadcastReceivedMessage} — Dispatches an incoming message to plugin handlers.
 * - {@link reset} — Clears all plugin state (used during SDK uninitialization).
 *
 * @internal
 * Limited to Microsoft-internal use
 */

import { sendMessageToParent } from './communication';
import { addPluginHandler, callHandler, getHandler, restoreHandlers } from './handlers';
import {
  IPlugin,
  IWebContentRequestMessage,
  PluginContext,
  PluginRegistrationResult,
  PluginResponse,
  ReceiveMessageCallback,
  SendMessageCallback,
} from './plugin';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from './telemetry';

const pluginServiceLogger = getLogger('pluginService');

// Module-level state
let plugins: Map<string, IPlugin> = new Map();
/** Tracks per-plugin: which handler names were registered and what the original handler was before chaining */
// eslint-disable-next-line @typescript-eslint/ban-types
let pluginOriginalHandlers: Map<string, Map<string, Function | undefined>> = new Map();

/**
 * Activate an array of plugins.
 *
 * @remarks
 * For each plugin, creates a {@link PluginContext} that provides:
 * - `sendMessage` — forwards messages to the Teams host via `sendMessageToParent`.
 * - `onReceiveMessage` — chains the plugin's handler onto the existing handler in
 *   `HandlersPrivate.handlers`, so both the original SDK handler and the plugin
 *   handler run when the event fires.
 *
 * Then calls `plugin.activate(context)`. If a plugin with the same ID is already active,
 * it is skipped with a warning.
 *
 * @param pluginList - Array of plugin instances implementing {@link IPlugin}.
 *
 * @example
 * ```typescript
 * import { pluginService, IPlugin, PluginContext } from '@microsoft/teams-js';
 *
 * class ThemeLoggerPlugin implements IPlugin {
 *   public readonly id = 'theme-logger';
 *   activate(context: PluginContext): void {
 *     context.onReceiveMessage('themeChange', (args) => {
 *       console.log('Theme changed to:', args?.[0]);
 *     });
 *   }
 * }
 *
 * const plugin = new ThemeLoggerPlugin();
 * pluginService.activatePlugins([plugin]);
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function activatePlugins(pluginList: IPlugin[]): void {
  for (const plugin of pluginList) {
    if (plugins.has(plugin.id)) {
      pluginServiceLogger('Plugin already active, skipping: %s', plugin.id);
      continue;
    }

    const sendMessage: SendMessageCallback = async (
      func: string,
      args?: (object | string | boolean)[],
    ): Promise<PluginResponse> => {
      try {
        const apiVersionTag = getApiVersionTag(ApiVersionNumber.V_2, ApiName.Plugin_SendMessage);
        sendMessageToParent(apiVersionTag, func, args);
        return { success: true, data: undefined };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        pluginServiceLogger('Error sending plugin message: %s', errorMessage);
        return { success: false, error: errorMessage };
      }
    };

    const onReceiveMessage: ReceiveMessageCallback = (func: string, handler: (args?: any[]) => void): void => {
      if (!pluginOriginalHandlers.has(plugin.id)) {
        pluginOriginalHandlers.set(plugin.id, new Map());
      }
      const originals = pluginOriginalHandlers.get(plugin.id)!;
      if (!originals.has(func)) {
        originals.set(func, getHandler(func));
      }
      addPluginHandler(func, handler);
    };

    const context: PluginContext = { sendMessage, onReceiveMessage };

    plugin.activate(context);
    plugins.set(plugin.id, plugin);
    pluginServiceLogger('Activated plugin: %s', plugin.id);
  }
}

/**
 * Deactivate a plugin by ID.
 *
 * @remarks
 * Performs the following cleanup in order:
 * 1. Restores any handlers in `HandlersPrivate.handlers` that were modified when the
 *    plugin chained its handlers via `onReceiveMessage`.
 * 2. Calls the plugin's `dispose()` method if one exists, awaiting its completion.
 * 3. Removes the plugin from the internal registry.
 *
 * @param pluginId - The unique ID of the plugin to deactivate.
 * @returns A promise that resolves with a {@link PluginRegistrationResult}.
 *
 * @example
 * ```typescript
 * const result = await pluginService.deactivatePlugin('catalyst');
 * if (!result.success) {
 *   console.error('Failed to deactivate:', result.error);
 * }
 * ```
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function deactivatePlugin(pluginId: string): Promise<PluginRegistrationResult> {
  try {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin with ID ${pluginId} not found` };
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
    pluginServiceLogger('Deactivated plugin: %s', pluginId);

    return { success: true, pluginId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Retrieve an active plugin instance by its ID.
 *
 * @param pluginId - The unique ID of the plugin.
 * @returns The plugin instance, or `undefined` if not active.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getPlugin(pluginId: string): IPlugin | undefined {
  return plugins.get(pluginId);
}

/**
 * Retrieve all currently active plugin instances.
 *
 * @returns An array of all active plugin instances.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getAllPlugins(): IPlugin[] {
  return Array.from(plugins.values());
}

/**
 * Deactivate all currently active plugins.
 *
 * @remarks
 * Iterates over all active plugins and calls {@link deactivatePlugin} for each one.
 * This restores all chained handlers and calls `dispose()` on each plugin that
 * implements it.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function deactivateAll(): Promise<void> {
  const pluginIds = Array.from(plugins.keys());
  for (const pluginId of pluginIds) {
    await deactivatePlugin(pluginId);
  }
}

/**
 * Broadcast a received message to all plugins that have registered handlers for it.
 *
 * @remarks
 * Dispatches the message through the SDK's handler registry via `callHandler`, which
 * will invoke any plugin handlers that were chained onto the given function name.
 *
 * @param message - The message to broadcast.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function broadcastReceivedMessage(message: IWebContentRequestMessage): void {
  pluginServiceLogger('Broadcasting message to plugins: %s', message.func);
  callHandler(message.func, message.args);
}

/**
 * Reset all plugin state without calling `dispose()` on plugins.
 *
 * @remarks
 * Unlike {@link deactivateAll}, this does **not** call `dispose()` on plugins or restore
 * chained handlers. It simply clears all internal maps. Intended for use during SDK
 * uninitialization where the entire handler registry is being wiped anyway.
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
