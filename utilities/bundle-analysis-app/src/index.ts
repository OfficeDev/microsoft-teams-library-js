import { core, appInitialization } from "@microsoft/teamsjs-app-sdk";


(function () {
  core.initialize();
  appInitialization.notifyAppLoaded();
})();
