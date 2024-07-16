import { app, ResumeContext } from '@microsoft/teams-js';

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
        const registerError = new Error(`Failed to register resume handler: ${error.toString()}`);
        console.error(registerError.message);
        throw registerError;
    }
  };
  
