import {
  app,
  Context,
  executeDeepLink,
  getContext,
  registerOnThemeChangeHandler,
  ResumeContext,
} from '@microsoft/teams-js';

export const registerOnResume = async (): Promise<string> => {
  console.log("Calling registerOnResume API");

  try {

    app.lifecycle.registerOnResumeHandler((context: ResumeContext): void => {
      console.log('Successfully called with context: ' + JSON.stringify(context));
      app.notifySuccess();
    });

    console.log("Registered on resume handler successfully");

    return app.Messages.Success;
  } catch (error: any) {
      console.error(error);
      throw error;
  }
};

export const getContextV2 = async (): Promise<string> => {
  console.log("Calling getContext API");

  try {
    const context = await app.getContext();
    console.log('Context retrieved successfully');
    return JSON.stringify(context);
  } catch (error: any) {
    const contextError = new Error(`Failed to get context: ${error.toString()}`);
    console.error(contextError.message);
    throw contextError;
  }
};

export const registerOnThemeChangeHandlerV2 = async (): Promise<string> => {
  console.log("Calling registerOnThemeChangeHandler API");

  try {
    app.registerOnThemeChangeHandler((theme: string) => {
      console.log('Theme changed to: ' + theme);
    });

    console.log("Registered on theme change handler successfully");
    return 'Success';
  } catch (error: any) {
    const themeChangeError = new Error(`Failed to register theme change handler: ${error.toString()}`);
    console.error(themeChangeError.message);
    throw themeChangeError;
  }
};

export const registerBeforeSuspendOrTerminateHandler = async (delay: number): Promise<string> => {
  console.log("Calling registerBeforeSuspendOrTerminateHandler API");

  try {
    if (typeof delay !== 'number') {
      throw new Error('Delay should be a number');
    }

    app.lifecycle.registerBeforeSuspendOrTerminateHandler(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('Before suspend or terminate handler called');
          resolve();
        }, delay);
      });
    });

    console.log("Registered before suspend or terminate handler successfully");
    return 'Success';
  } catch (error: any) {
    const suspendError = new Error(`Failed to register before suspend or terminate handler: ${error.toString()}`);
    console.error(suspendError.message);
    throw suspendError;
  }
};
