import { getClientSupportedVersion } from './private/privateAPIs';
import { Error } from './public/interfaces';

export namespace VersionUtils {
  var commandVersion = {};
  commandVersion['initialize'] = 0;
  commandVersion['enablePrintCapability'] = 0;
  commandVersion['executeDeepLink'] = 0;
  commandVersion['getContext'] = 0;
  commandVersion['getMruTabInstances'] = 0;
  commandVersion['getTabInstances'] = 0;
  commandVersion['initialize'] = 0;
  commandVersion['initializeWithFrameContext'] = 0;
  commandVersion['navigateBack'] = 0;
  commandVersion['navigateCrossDomain'] = 0;
  commandVersion['navigateToTab'] = 0;
  commandVersion['print'] = 0;
  commandVersion['registerBackButtonHandler'] = 0;
  commandVersion['registerBeforeUnloadHandler'] = 0;
  commandVersion['registerChangeSettingsHandler'] = 0;
  commandVersion['registerFullScreenHandler'] = 0;
  commandVersion['registerOnLoadHandler'] = 0;
  commandVersion['registerOnThemeChangeHandler'] = 0;
  commandVersion['setFrameContext'] = 0;
  commandVersion['shareDeepLink'] = 0;
  commandVersion['getCurrentLocation'] = 1;
  commandVersion['chooseLocationOnMap'] = 1;
  commandVersion['getLocationAddress'] = 1;
  commandVersion['getLocationMapImage'] = 1;
  commandVersion['showLocationOnMap'] = 1;

  export function IsCommandHandledOnPlatform(command: string, callback: (compatible: boolean) => void): void {
    if (!commandVersion.hasOwnProperty(command)) {
      callback(false);
    } else {
      getClientSupportedVersion((version: number) => {
        var commandRequiredVersion = commandVersion[command];
        var clientSupportedVersion = version;
        callback(commandRequiredVersion <= clientSupportedVersion);
      });
    }
  }

  export function getUpgradeErrorObject(): Error {
    return {
      errorCode: 100,
      description: 'The operation is not supported. Try upgrading build',
    };
  }
}
