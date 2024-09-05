export const checkCapabilitySupport = async (module: any, moduleName: string, supportedMessage: string, notSupportedMessage: string): Promise<void> => {
    console.log(`Executing Check${moduleName}Capability...`);
    try {
      const result = await module.isSupported();
      if (result) {
        console.log(supportedMessage);
      } else {
        console.log(notSupportedMessage);
        throw new Error(`${moduleName} capability is not supported`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Error checking ${moduleName} capability:`, errorMessage);
      if (error instanceof Error) {
        console.log('Stack trace:', error.stack);
      }
      throw error;
    }
  };
  
  export const checkPermission = async (module: any, moduleName: string, permissionGrantedMessage: string, errorMessage: string): Promise<void> => {
    console.log(`Executing Has${moduleName}Permission...`);
    try {
      await module.hasPermission();
      console.log(permissionGrantedMessage);
    } catch (error) {
      console.log(`Error checking ${moduleName} permission:`, JSON.stringify(error, null, 2));
      console.log(errorMessage);
      throw error;
    }
  };
