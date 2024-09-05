import { barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport, checkPermission } from '../utils/CheckCapabilityUtils';

export const barCode_CheckBarCodeCapability = async (): Promise<void> => {
  const module = barCode;
  const moduleName = 'BarCode';
  const supportedMessage = 'BarCode module is supported.';
  const notSupportedMessage = 'BarCode module is not supported. BarCode is not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile. Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const barCode_HasBarCodePermission = async (): Promise<void> => {
  const module = barCode;
  const moduleName = 'BarCode';
  const permissionGrantedMessage = 'BarCode permission has been granted.';
  const errorMessage = 'HasBarCodePermission functionality is currently not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile. Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.';
  
  await checkPermission(module, moduleName, permissionGrantedMessage, errorMessage);
};

export const barCode_ScanBarCode = async (config: barCode.BarCodeConfig = {}): Promise<string> => {
  console.log('Executing ScanBarCode with config:', JSON.stringify(config, null, 2));

  try {
    const scannedCode = await barCode.scanBarCode(config);
    console.log('Scanned code result:', scannedCode);
    return scannedCode;

  } catch (error) {
    console.log('Error scanning BarCode:', JSON.stringify(error, null, 2));
    console.log('ScanBarCode functionality is currently not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile.');
    console.log ('Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.');
    throw error;
  }
};

const functionsRequiringInput = [
  'ScanBarCode'
]; // List of functions requiring input

interface BarCodeAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const BarCodeAPIs: React.FC<BarCodeAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default BarCodeAPIs;
