/**
 * Catalyst Plugin Contract
 *
 * This file represents what would be a standalone shared types package possibly in 1js
 * (e.g. `@1js/bizchat-catalyst-plugins-metaos-hub`) in production.
 *
 * Both sides of the messaging boundary import from it:
 *   - Host (hub): uses it to type outbound send calls and inbound listener args
 *   - App (iframe): uses it to know what messages to handle and what to send back
 *
 * Neither side owns this file — it is the source of truth for the wire contract.
 */

// ── Message function name constants ──────────────────────────────────────────
// Both host and app reference the same constants so func names can never drift.

export const CatalystFuncs = {
  // Host → App
  triggerPrompt: 'catalyst.triggerPrompt',
  contextUpdate: 'catalyst.contextUpdate',

  // App → Host
  promptSent: 'catalyst.promptSent',
  contextUpdateReceived: 'catalyst.contextUpdateReceived',
} as const;

// ── Host → App payloads ───────────────────────────────────────────────────────

/** Payload the host sends when triggering a prompt in the app */
export type TriggerPromptArgs = {
  prompt: string;
};

/** Payload the host sends when pushing a context update to the app */
export type ContextUpdateArgs = {
  key: string;
  value: unknown;
};

// ── App → Host payloads ───────────────────────────────────────────────────────

/** Payload the app sends back after processing a triggered prompt */
export type PromptSentResponse = {
  promptId: string;
  status: 'accepted' | 'rejected' | 'error';
  message?: string;
};

/** Payload the app sends when it wants to notify the host of a context change */
export type ContextUpdateReceivedResponse = {
  key: string;
  updatedValue: unknown;
  timestamp: number;
};
