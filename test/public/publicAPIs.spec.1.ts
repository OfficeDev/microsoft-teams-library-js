import * as microsoftTeams from "../../src/public/publicAPIs";
import * as microsoftTeamsPrivate from "../../src/private/privateAPIs";
import { settings as microsoftTeamsSettings } from "../../src/public/settings";
import { authentication as microsoftTeamsAuthentication } from "../../src/public/authentication";
import { TabInstanceParameters, Context, TaskInfo, OpenConversationRequest } from "../../src/public/interfaces";
import { TeamInstanceParameters } from "../../src/private/interfaces";
import { TeamType, UserTeamRole, HostClientType, TaskModuleDimension } from "../../src/public/constants";
import { tasks } from "../../src/public/tasks";
import { bot } from "../../src/private/bot";
import { conversations } from "../../src/private/conversations";
import { executeDeepLink } from "../../src/public/publicAPIs";
import { frameContexts } from "../../src/internal/constants";
import { Utils, MessageResponse } from '../utils';

describe("MicrosoftTeams", () => {
  // Use to send a mock message from the app.

  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (microsoftTeams._uninitialize) {
      microsoftTeams._uninitialize();
    }
  });

});