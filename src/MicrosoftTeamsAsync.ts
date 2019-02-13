import { Context, getContext } from "./MicrosoftTeams";

export function getContextAsync(): Promise<Context> {
  return new Promise<Context>((resolve, reject) => {
    try {
      getContext(context => {
        resolve(context);
      });
    } catch (error) {
      reject(error);
    }
  });
}
