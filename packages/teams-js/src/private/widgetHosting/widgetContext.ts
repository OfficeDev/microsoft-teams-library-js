export interface ISecurityPolicy {
  connectDomains?: string[];
  resourceDomains?: string[];
  isTrusted?: boolean;
}
export type UnknownObject = Record<string, unknown>;

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
export interface IToolOutput extends UnknownObject {
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
export interface IExternalAppWidgetContext {
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

    // Widget state and data
    toolInput?: IToolInput;
    toolOutput?: IToolOutput;
    toolResponseMetadata?: UnknownObject | null;
    widgetState?: UnknownObject | null;

    // API functions
    callTool?: (name: string, args: Record<string, unknown>) => Promise<IToolOutput>;
    sendFollowUpMessage?: (args: { prompt: string }) => Promise<void>;
    requestDisplayMode?: (args: { mode: DisplayMode }) => Promise<{ mode: DisplayMode }>;
    setWidgetState?: (state: UnknownObject) => Promise<void>;
    openExternal?: (payload: { href: string }) => void;
    contentSizeChanged?: (width: number, height: number) => void;
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
