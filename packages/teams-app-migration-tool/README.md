# Teams Client SDK to MOS App SDK Migrating Tool
Welcome to (take over) the project! For testing details, please refer to this [testDoc](https://github.com/OfficeDev/teamsjs-app-sdk/blob/develop/packages/teams-app-migration-tool/src/transforms/testDoc.md).
## Getting Started
The following steps are preparation before using this migrating tool.
1. Clone the repo
2. Navigate to the repo root and run ```yarn install```
3. to run Unit test, use ```yarn test```
## Usage
For this unpublished tool, we use ```ts-node``` to compile and run the program. Go to the root of repo and type in command ```ts-node [absolute path of main.ts under this repo] ... ``` would work.  

To learn more details of this migrating tool, please use ```-help``` or ```-h```. An example of using command to migrate a project from one place to another would be shown below.  
- Example Command
```
ts-node c:\Users\[username]\teamsjs-app-sdk\packages\teams-app-migration-tool\src\main.ts --sourcePath C:\Users\[username]\Demo\Personal-Tab-Demo --targetPath C:\Users\[username]\Demo\Personal-Tab-Demo-Copy
```
This command would run this tool to copy the original project, which is ```Personal-Tab-Demo```, to another place and rename it to be ```Personal-Tab-Demo-Copy``` and then make the replacement.
