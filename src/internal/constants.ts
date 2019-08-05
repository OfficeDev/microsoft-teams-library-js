import { generateRegExpFromUrls } from './utils';

export const version = '1.5.0';

export const validOrigins = [
  'https://teams.microsoft.com',
  'https://teams.microsoft.us',
  'https://gov.teams.microsoft.us',
  'https://dod.teams.microsoft.us',
  'https://int.teams.microsoft.com',
  'https://devspaces.skype.com',
  'https://ssauth.skype.com',
  'http://dev.local', // local development
  'http://dev.local:8080', // local development
  'https://msft.spoppe.com',
  'https://*.sharepoint.com',
  'https://*.sharepoint-df.com',
  'https://*.sharepointonline.com',
  'https://outlook.office.com',
  'https://outlook-sdf.office.com',
];

// Ensure these declarations stay in sync with the framework.
export const frameContexts = {
  settings: 'settings',
  content: 'content',
  authentication: 'authentication',
  remove: 'remove',
  task: 'task',
};

export const validOriginRegExp = generateRegExpFromUrls(validOrigins);
