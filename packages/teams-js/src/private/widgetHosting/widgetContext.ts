import { RenderingSurfaces } from '../../public';

export interface ISecurityPolicy {
  connectDomains?: string[];
  resourceDomains?: string[];
  isTrusted?: boolean;
}

export type Theme = 'light' | 'dark';

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};

/**
 * Options for requesting a modal dialog
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
 * Response from requesting a modal dialog
 */
export interface IModalResponse {
  /** A DOM element representing the modal's root */
  modalElement: HTMLElement;
}

/** Declare generic JSON - serializable structure */
export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

/** Display mode */
export type DisplayMode = 'pip' | 'inline' | 'fullscreen';

/**
 * MCP-compatible tool input structure following OpenAI MCP server specification
 */
export interface IToolInput {
  /** The name of the tool to call */
  name: string;
  /** Arguments passed to the tool as key-value pairs */
  arguments?: Record<string, unknown>;
}

/**
 * MCP-compatible tool output structure matching exact MCP schema
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
 * Widget context similar to IWidgetHost structure - simplified for widget rendering
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

/**
 * @hidden
 *
 * WidgetErrorCodes enum representing various error scenarios related to widget operations.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum WidgetErrorCode {
  NotSupportedOnPlatform = 'NotSupportedOnPlatform',
  UnknownError = 'UnknownError',
  InvalidResponseFormat = 'InvalidResponseFormat',
  InternalError = 'InternalError',
}

/**
 * @hidden
 *
 * Interface for errors related to widget operations.
 * Contains an error code and an optional message.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface WidgetError {
  errorCode: WidgetErrorCode;
  message?: string;
}
