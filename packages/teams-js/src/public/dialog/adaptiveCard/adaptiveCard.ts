import { sendMessageToParent } from '../../internal/communication';
import { botUrlOpenHelper, updateResizeHelper, urlOpenHelper, urlSubmitHelper } from '../../internal/dialogHelpers';
import { GlobalVars } from '../../internal/globalVars';
import { registerHandler, removeHandler } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { isHostAdaptiveCardSchemaVersionUnsupported } from '../../internal/utils';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import {
  AdaptiveCardDialogInfo,
  BotAdaptiveCardDialogInfo,
  BotUrlDialogInfo,
  DialogInfo,
  DialogSize,
  M365ContentAction,
  UrlDialogInfo,
} from '../interfaces';
import { runtime } from '../runtime';
