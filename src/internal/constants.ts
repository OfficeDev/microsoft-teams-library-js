import { generateRegExpFromUrls } from './utils';

export const version = '1.9.0-beta.3';
/**
 * This is the SDK version when all SDK APIs started to check platform compatibility for the APIs.
 */
export const defaultSDKVersionForCompatCheck = '1.6.0';

/**
 * List of supported Host origins
 */
export const validOrigins = [
  'https://teams.microsoft.com',
  'https://teams.microsoft.us',
  'https://gov.teams.microsoft.us',
  'https://dod.teams.microsoft.us',
  'https://int.teams.microsoft.com',
  'https://devspaces.skype.com',
  'https://ssauth.skype.com',
  'https://local.teams.office.com', // local development
  'https://local.teams.office.com:8080', // local development
  'https://msft.spoppe.com',
  'https://*.sharepoint.com',
  'https://*.sharepoint-df.com',
  'https://*.sharepointonline.com',
  'https://outlook.office.com',
  'https://outlook-sdf.office.com',
  'https://*.teams.microsoft.com',
  'https://www.office.com',
  'https://word.office.com',
  'https://excel.office.com',
  'https://powerpoint.office.com',
  'https://www.officeppe.com',
  'https://*.www.office.com',
  'http://127.0.0.1:5000', // local Development
];

export const validOriginRegExp = generateRegExpFromUrls(validOrigins);

/**
 * USer specified message origins should satisfy this test
 */
export const userOriginUrlValidationRegExp = /^https\:\/\//;
