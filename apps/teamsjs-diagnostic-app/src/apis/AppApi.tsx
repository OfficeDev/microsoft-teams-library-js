import { app, ResumeContext } from '@microsoft/teams-js';

export const registerOnResume = async (): Promise<string> => {
    console.log("Calling registerOnResume API");
  
    try {
  
      app.lifecycle.registerOnResumeHandler((context: ResumeContext): void => {
        console.log('Successfully called with context: ' + JSON.stringify(context));
        // Get the route from the context
        // const route = new URL(context.contentUrl);
        // Navigate to the correct path based on URL
        // navigate(route.pathname);
        app.notifySuccess();
      });
  
      console.log("Registered on resume handler successfully");
  
      return app.Messages.Success;
    } catch (error: any) {
      console.error(`Failed to register resume handler: ${error.toString()}`);
      throw new Error(`Failed to register resume handler: ${error.toString()}`);
    }
  };
  
