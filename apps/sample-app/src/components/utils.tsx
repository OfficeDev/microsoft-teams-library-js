import { teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme, Theme } from '@fluentui/react-components';
import { app } from '@microsoft/teams-js';

export const getTheme = (themeNow: string): Theme => {
  switch (themeNow) {
    case 'dark':
      return teamsDarkTheme;
      break;
    case 'contrast':
      return teamsHighContrastTheme;
      break;
    default:
      return teamsLightTheme;
  }
};
export function appInitializationFailed(): void {
  app.notifyFailure({
    reason: app.FailedReason.Other,
    message: 'App initialization failed',
  });
}
