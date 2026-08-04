/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { RenderingSurfaces } from '../../public';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ISecurityPolicy {
  connectDomains?: string[];
  resourceDomains?: string[];
  isTrusted?: boolean;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type Theme = 'light' | 'dark';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type SafeArea = {
  insets: SafeAreaInsets;
};

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};

/**
 * @hidden
 * Options for requesting a modal dialog
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IModalOptions {
  /** Unique identifier for the modal */
  id: string;
  /** Title at the top of the modal window */
  title?: string;
  /** Inner HTML string inserted into the modal's body */
  content: string;
  /** Preferred modal width in pixels */
  width?: number;
  /** Preferred modal height in pixels */
  height?: number;
}

/**
 * @hidden
 * Response from requesting a modal dialog
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IModalResponse {
  /** A DOM element representing the modal's root */
  modalElement: HTMLElement;
}

/**
 * @hidden
 * Declare generic JSON - serializable structure
 * @internal
 * Limited to Microsoft-internal use
 */
export interface JSONObject {
  [key: string]: JSONValue;
}
/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

/**
 * @hidden
 * Display mode
 * @internal
 * Limited to Microsoft-internal use
 */
export type DisplayMode = 'pip' | 'inline' | 'fullscreen';

/**
 * @hidden
 * MCP-compatible tool input structure following OpenAI MCP server specification
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IToolInput {
  /** The name of the tool to call */
  name: string;
  /** Arguments passed to the tool as key-value pairs */
  arguments?: Record<string, unknown>;
}

/**
 * @hidden
 * MCP-compatible tool output structure matching exact MCP schema
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IToolOutput {
  /** Whether the tool call resulted in an error */
  isError?: boolean;
  /** Array of content blocks returned by the tool */
  content: Array<{
    /** Type of content block */
    type: 'text' | 'image' | 'resource';
    /** Text content (for type: 'text') */
    text?: string;
    /** Image data (for type: 'image') */
    data?: string;
    /** MIME type (for type: 'image') */
    mimeType?: string;
    /** Resource URI (for type: 'resource') */
    uri?: string;
    /** Optional metadata for any content type */
    annotations?: {
      /** Audience for this content (user, assistant) */
      audience?: Array<'user' | 'assistant'>;
      /** Priority level */
      priority?: number;
    };
  }>;
  /** UI widget data */
  structuredContent?: unknown;
  /** MCP metadata object */
  _meta?: Record<string, unknown>;
}

/**
 * @hidden
 * Widget context similar to IWidgetHost structure - simplified for widget rendering
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IWidgetContext {
  /** Unique identifier for the widget instance */
  widgetId: string;
  /** Widget HTML content to render */
  html: string;
  /** widget domain that developer has registered their app to */
  domain: string;
  /** Content Security policy for the widget */
  securityPolicy?: ISecurityPolicy;
  /** OpenAI-compatible object with widget globals and API functions */
  openai: {
    // Widget globals
    theme?: Theme;
    userAgent?: UserAgent;
    locale?: string;
    displayMode?: DisplayMode;
    safeArea?: SafeArea;
    maxHeight?: number;
    view?: RenderingSurfaces; // TODO: need to convert this to view types supported by the openAI apps in the WHS app.

    // Widget state and data
    widgetState?: JSONValue;
  };
}
