# Implementing Plugins

This guide covers how to create plugins for the Hub SDK.

## Dependencies

The Hub SDK should be a **dev dependency** (`devDependencies`) in your plugin package:

```json
{
  "devDependencies": {
    "@metaos/hub-sdk": "^9.8.0"
  }
}
```

The Hub SDK is only needed at development time for type checking and IDE support. The actual Hub SDK is provided at runtime by the hosting MetaOS application, so it should not be bundled with your plugin.

## Plugin Lifecycle

Plugins follow a **two-phase lifecycle**:

1. **Consumer creates instances** — plain classes with no SDK dependencies in the constructor
2. **SDK calls `initialize(context)`** — once messaging infrastructure is ready, the SDK provides `sendMessage` and `registerMessageHandler` callbacks

This decouples instance creation from SDK wiring, letting the consumer hold a direct reference for runtime access (e.g., calling methods on the plugin).

## Creating a Plugin

A plugin implements the `IPlugin` interface:

```typescript
import type { IPlugin, PluginContext, SendMessageCallback } from '@metaos/hub-sdk';

export class MyPlugin implements IPlugin {
  readonly id = 'my-plugin';

  private sendMessage!: SendMessageCallback;

  initialize(context: PluginContext): void {
    this.sendMessage = context.sendMessage;
    context.registerMessageHandler('my.response', (args) => {
      console.log('Response received:', args);
    });
  }

  dispose(): void {
    // Cleanup resources
  }

  async myMethod(param: string): Promise<void> {
    await this.sendMessage('my.function', [param]);
  }
}
```

## Plugin Structure

### Required Properties

- `id: string` — unique plugin identifier
- `initialize(context: PluginContext): void` — called by the SDK when messaging is ready

### Optional Properties

- `dispose(): void` — called by the SDK when the plugin is removed or the container unmounts

### Sending Messages

Use the `sendMessage` callback from the context:

```typescript
async myMethod(param: string): Promise<void> {
  const response = await this.sendMessage('my.function', [param]);
  if (!response.success) {
    throw new Error(response.error);
  }
}
```

### Receiving Messages

Use `registerMessageHandler` in `initialize()`:

```typescript
initialize(context: PluginContext): void {
  context.registerMessageHandler('my.event', (data?: any[]) => {
    console.log('Event:', data);
  });
}
```

## Using Plugins

Create plugin instances and pass them via the `plugins` prop on `MetaOsAppContainer`:

```tsx
import { MyPlugin } from './my-plugin';

// Create instance — no SDK dependencies needed
const myPlugin = new MyPlugin();

// Pass via props — SDK handles initialization
<MetaOsAppContainer plugins={[myPlugin]} ... />

// Call methods directly on the instance at runtime
await myPlugin.myMethod('hello');
```

## Example: CatalystPlugin

Full reference implementation:

```typescript
import type { IPlugin, PluginContext, SendMessageCallback } from '@metaos/hub-sdk';

export class CatalystPlugin implements IPlugin {
  readonly id = 'catalyst-plugin';

  private sendMessage!: SendMessageCallback;
  private promptSentHandlers: Array<(response?: string) => void> = [];

  initialize(context: PluginContext): void {
    this.sendMessage = context.sendMessage;
    context.registerMessageHandler('catalyst.promptSent', (args?: any[]) => {
      const response = args?.[0];
      this.promptSentHandlers.forEach((handler) => handler(response));
    });
  }

  dispose(): void {
    this.promptSentHandlers = [];
  }

  async triggerPrompt(prompt: string): Promise<void> {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }
    await this.sendMessage('catalyst.triggerPrompt', [prompt]);
  }

  onPromptSent(handler: (response?: string) => void): void {
    this.promptSentHandlers.push(handler);
  }
}
```

Usage:

```tsx
const catalystPlugin = new CatalystPlugin();

<MetaOsAppContainer plugins={[catalystPlugin]} ... />

// Call methods directly
await catalystPlugin.triggerPrompt('What is your name?');

// Listen for responses
catalystPlugin.onPromptSent((response) => {
  console.log('User said:', response);
});
```

## Message Format

### Sending Messages

When you call `sendMessage()`, it passes this format to the hub:

```typescript
{
  func: string;       // Function name (e.g., 'catalyst.triggerPrompt')
  args?: unknown[];   // Optional arguments
}
```

### Handling Errors

Use try/catch or validate before sending:

```typescript
async myMethod(param: string): Promise<void> {
  if (!param) {
    throw new Error('param is required');
  }
  await this.sendMessage('my.function', [param]);
}
```

## How Plugin Initialization Works

When `MetaOsAppContainer` receives the `plugins` prop:

1. The SDK creates a `PluginContext` for each plugin with:
   - `sendMessage` — sends messages to the iframe application
   - `registerMessageHandler` — registers handlers on the `MessageRouter` for incoming messages
2. The SDK calls `plugin.initialize(context)` on each plugin
3. The plugin stores callbacks and registers handlers
4. When the plugin is removed or the container unmounts, the SDK calls `plugin.dispose()`

## Message Routing

Plugin handlers participate directly in the standard message routing pipeline:

1. Message arrives from the iframe application
2. `MessageRouter` checks eager handlers, then lazy handlers, then plugin handlers
3. If a plugin registered a handler for that message func, the `PluginMessageHandler` is invoked
4. Each handler registered for that func is called with the message arguments
5. Multiple plugins can handle the same message (publish-subscribe pattern)

Plugin handlers are registered on the `MessageRouter` automatically when a plugin calls `registerMessageHandler` during `initialize()`. Plugins are first-class participants in the routing pipeline.

## Complete Plugin Example

```typescript
import type { IPlugin, PluginContext, SendMessageCallback } from '@metaos/hub-sdk';

export class AnalyticsPlugin implements IPlugin {
  readonly id = 'analytics-plugin';

  private sendMessage!: SendMessageCallback;

  initialize(context: PluginContext): void {
    this.sendMessage = context.sendMessage;
    context.registerMessageHandler('analytics.tracking', (args?: any[]) => {
      const [event, data] = args || [];
      console.log(`Analytics: ${event}`, data);
    });
  }

  dispose(): void {
    // Cleanup
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!eventName) {
      throw new Error('Event name is required');
    }
    await this.sendMessage('analytics.track', [eventName, properties]);
  }
}
```

Usage:

```tsx
const analyticsPlugin = new AnalyticsPlugin();

<MetaOsAppContainer plugins={[analyticsPlugin]} ... />

await analyticsPlugin.trackEvent('user_login', { userId: 123 });
```

## See Also

- [@1js/copilot-catalyst-plugin](../catalyst-plugin/README.md) - Reference implementation
- [Hub SDK Documentation](README.md) - General Hub SDK documentation
