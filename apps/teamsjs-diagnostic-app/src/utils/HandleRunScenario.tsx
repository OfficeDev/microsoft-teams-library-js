import { appInstallDialog_CheckAppInstallCapability, appInstallDialog_OpenAppInstallDialog } from '../apis/AppInstallDialogApi';
import { barCode_checkBarCodeCapability, barCode_hasBarCodePermission, barCode_requestBarCodePermission, barCode_scanBarCode } from '../apis/BarCodeApi';
import { ApiComponent } from '../components/sample/ApiComponents';


export const handleRunScenario = async (api: ApiComponent, func: string, input?: string) => {
  if (api.name === 'appInstallDialog') {
    switch (func) {
      case 'CheckAppInstallCapability':
        return await appInstallDialog_CheckAppInstallCapability();
      case 'OpenAppInstallDialog':
        return await appInstallDialog_OpenAppInstallDialog(input);
      default:
        throw new Error(`Unknown function ${func} for ${api.title}`);
    }
  } else if (api.name === 'barCode') {
    switch (func) {
      case 'checkBarCodeCapability':
        return await barCode_checkBarCodeCapability();
      case 'scanBarCode':
        return await barCode_scanBarCode(input);
      case 'hasBarCodePermission':
        return await barCode_hasBarCodePermission();
      case 'requestBarCodePermission':
        return await barCode_requestBarCodePermission();
      default:
        throw new Error(`Unknown function ${func} for ${api.title}`);
    }
  } else {
    throw new Error(`Unknown API component ${api.title}`);
  }
};
