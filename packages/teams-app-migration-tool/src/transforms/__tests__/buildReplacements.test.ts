import { build } from '../replacementsGenerator';

test('build replacements through mappings.json', () => {
  expect(build()).toEqual([
    {
      sourcePackage: 'microsoftTeams',
      targetPackage: 'teamsjs',
      sourcePrefixTokens: [],
      targetPrefixTokens: ['core'],
      sourceMethod: 'initialize',
      targetMethod: 'initialize',
      sourceTokens: ['microsoftTeams', 'initialize'],
    },
    {
      sourcePackage: 'microsoftTeams',
      targetPackage: 'teamsjs',
      sourcePrefixTokens: [],
      targetPrefixTokens: ['core'],
      sourceMethod: 'getContext',
      targetMethod: 'getContext',
      sourceTokens: ['microsoftTeams', 'getContext'],
    },
    {
      sourcePackage: 'microsoftTeams',
      targetPackage: 'teamsjs',
      sourcePrefixTokens: [],
      targetPrefixTokens: ['core'],
      sourceMethod: 'shareDeepLink',
      targetMethod: 'shareDeepLink',
      sourceTokens: ['microsoftTeams', 'shareDeepLink'],
    },
    {
      sourcePackage: 'microsoftTeams',
      targetPackage: 'teamsjs',
      sourcePrefixTokens: [],
      targetPrefixTokens: ['core'],
      sourceMethod: 'executeDeepLink',
      targetMethod: 'executeDeepLink',
      sourceTokens: ['microsoftTeams', 'executeDeepLink'],
    },
    {
      sourcePackage: 'microsoftTeams',
      targetPackage: 'teamsjs',
      sourcePrefixTokens: [],
      targetPrefixTokens: ['core'],
      sourceMethod: 'registerOnThemeChangeHandler',
      targetMethod: 'registerOnThemeChangeHandler',
      sourceTokens: ['microsoftTeams', 'registerOnThemeChangeHandler'],
    },
  ]);
});
