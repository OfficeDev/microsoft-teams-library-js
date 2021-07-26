# Documentation for test and related operations
Here is a doc that might be helpful for developer(s) to understand working flow and custom of tests and take notice of some points, which are important for test.
## How to run tests
yarn is embedded and helps us to run tests by command ```yarn test```. Below would be an example to show what would you have after run ```yarn test```.
```
teams-app-migration-tool>yarn test
yarn run v1.22.10
$ jest
ts-jest[versions] (WARN) Version 4.1.3 of typescript installed has not been tested with ts-jest. If you're experiencing issues, consider using a supported version (>=2.7.0 <4.0.0). Please do not report issues in ts-jest if you are using unsupported versions.
 PASS  src/transforms/__tests__/replaceSDK.test.ts
 PASS  src/transforms/__tests__/buildReplacements.test.ts

Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        1.794s
Ran all test suites.
Done in 2.75s.
```
## Intro of some content under this folder
- ```__testfixtures___``` is the directory to put testcases. **The name of this folder cannot be changed** since jscodeshift would only search this folder for testcases automatically.
- ```__tests___``` is the directory having some test files that denote which testcases (under \_\_testfixtures\_\_ directory) they would like to test. **The name of this folder cannot be changed** since jscodeshift would only search this folder for tests automatically.
- ```mappings.json``` is a json file to record each one on one function mapping from Teams Client SDK to teamsjs App SDK.
- ```replaceSDK.ts``` is the core file to provide capability transforming the file as we need.
- ```testHelper.ts``` provides a template to test multiple tests. Recommend to use this template if neccessary.
### ```__testfixtures__``` name custom
- __Assumption__: each function in teamsjs App SDK has its namespace
- __Custom__
```  
packages\teams-app-migration-tool\src\transforms\__testfixtures\__\[namespace in teamsjs App SDK]\replace(-optional:[namespace in Teams Client SDK])-[function name in Teams Client SDK].[input/output].js.  
```
- __Example__:
```
packages\teams-app-migration-tool\src\transforms\__testfixtures__\appInitialization\replace-appInitialization-notifyAppLoaded.input.js
```
#### *.input.js and *.output.js  
Currently, input and output files cover the migration tests from Teams Client SDK to teamsjs App SDK about:  
1. Transforming function by fully qualified method reference
2. Transforming function by specific namespace and method reference (if it has a namespace in Teams Client SDK)
3. Transforming function by alias of specifc namespace and method reference (if it has a namespace in Teams Client SDK)

##### Format of *.input.js and corresponding *.output.js
###### if function has a namespace
- input  
```
import * as [alias for package namespace, i.e. msft as follow] from '@microsoft/teams-js';  
msft.[namespace for function, i.e.appInitialization as follow].[function name, i.e.notifyAppLoaded as follow]__(); // This test for point 1  
import { [appInitialization] as [alias for namespace, i.e. appInit as follow] } from '@microsoft/teams-js';  
appInit.notifyAppLoaded(); // This test for point 3  
appInitialization.notifyAppLoaded(); // This test for point 2  
```
- output  
```
import { [corresponding namespace in MOS App SDK, i.e. appInitialization as follow] } from '@microsoft/teamsjs-app-sdk';  
appInitialization.[corresponding function name in MOS APp SDK, i.e. notifyAppLoaded as follow](); // transformed by point 1  
appInitialization.notifyAppLoaded(); // transformed by point 3  
appInitialization.notifyAppLoaded(); // transformed by point 2  
```
###### if function has no namespace
- input
```
import * as [alias for package namespace, i.e. msft as follow] from '@microsoft/teams-js';  
msft.[namespace for function, i.e.appInitialization as follow](); // This test for point 1  
```
- output
```
import { [corresponding namespace in MOS App SDK, i.e. core as follow] } from '@microsoft/teamsjs-app-sdk'; 
core.[corresponding function name in MOS APp SDK, i.e. initialize as follow](); // transformed by point 1  
```
### listing tests custom in ```__tests__``` 
tests are suggested to be listed by alphabetical order of namespace in MOS App SDK with comment at each head of block. Since jscodeshift would automatically search testcases in ```__testfixtures__``` folder, only name of directory and filename are required in a list. Example below:  
```
const testList = [  
    ...  
  /**  
   * authentication namespace  
   */  
  'authentication/replace-authentication-authenticate',  
  'authentication/replace-authentication-getAuthToken',  
  'authentication/replace-authentication-notifyFailure',  
  'authentication/replace-authentication-notifySuccess',  
  'authentication/replace-authentication-initialize',  
  ...  
];
```
Further sort by function name in each namespace is welcomed.  
### structure in ```mappings.json```
There are lots of tuples and each one has a source attribute and target attribute. ```source``` attribute has fully qualified method reference from a function in Teams Client SDK.
```target``` attribute has fully qualified method reference of corresponding function in teamsjs App SDK.
- __Example__:
```
    {
      "source" : "microsoftTeams.authentication.notifyFailure",
      "target" : "teamsjs.authentication.notifyFailure"
    }
```
## Places to check when add/delete one on one mapping function
- ```mappings.json```
- ```__tests__\buildReplacements.test.ts```, it's a file to double check and avoid misoperation
- ```__testfixtures__```, whether you add the input and output test case
- ```__tests__```, whether you add the test in test driver
## Replacement order in ```mappings.json``` and ```__tests__\buildReplacements.test.ts``` should match
expect().toEqual() doesn't recognize two lists with exactly the same items in different order to be the same.
