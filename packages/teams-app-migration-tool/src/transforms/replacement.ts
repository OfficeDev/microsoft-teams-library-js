/**
 * interface replacement is to define how 1 on 1 mapping would be looked like in code
 * i.e. "microsoftTeams.initialize   =>    teamsjs.core.initialize" is one of mappings in mappings.json file,
 * it should be defined using replacement interface and looks like below:
 * {
 *  sourcePackage : 'microsoftTeams';
 *  targetPackage : 'teamsjs';
 *  sourcePrefixTokens : [];
 *  targetPrefixTokens : ['core'];
 *  sourceMethod : 'initialize';
 *  targetMethod : 'initialize';
 *  sourceTokens : ['microsoftTeams', 'initialize'];
 * }
 * This structure would help developer to do the replacement.
 */
export interface replacement {
  sourcePackage: string;
  targetPackage: string;
  sourcePrefixTokens: Array<string>;
  targetPrefixTokens: Array<string>;
  sourceMethod: string;
  targetMethod: string;
  sourceTokens: Array<string>;
}
