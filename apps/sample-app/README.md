# Sample App

The sample app leverages TeamsJS v2 SDK for creating a multi host app experience. The sample app displays the usage of the following TeamsJS v2 APIs:

- core.openLink
- authentication.authenticate
- isSupported
- app.getContext
- app.initialize
- app.registerOnThemeChangeHandler
- call.startCall
- chat.openChat
- mail.openMailItem
- calendar.composeMeeting
- pages.navigatetoApp
- pages.shareDeepLink

## Set up the Sample App

1. Clone the TeamsJS v2 repository on your local machine using the following command in the terminal:
   `git clone https://github.com/OfficeDev/microsoft-teams-library-js.git`
2. Run `pnpm install` from the repository root
3. Run `pnpm build` form repository root
4. Change directory to the sample app by running the following command
   `cd apps/sample-app`
5. Run `pnpm start`
   - Open https://localhost:4003 window in your browser.
   - Proceed to 'continue to localhost' upon receiving 'Your Connection isn't private' warning.
   - An alert will pop up stating the app must be sideloaded onto a host (Teams).
   - Follow the steps below to sideload the app onto Teams.

## Running the Sample App

### Sideload the App to Teams Web

6. Open Microsoft Teams Web
   - Click '+ Apps'>Manage your apps> Upload an app> Upload custom app
   - You have to upload sample-app-zipped.zip file here. This file can be found in your local copy of microsoft-teams-library-js from step 1 and head to apps -> sample-app -> sample-app-zipped.zip
   - After uploading sample-app-zipped.zip, click ‘+Add’

The app will start running on Teams and will automatically sideload onto Outlook and Office Web.

### Sideload the App to Teams Desktop

To have the app run on the desktop applications of Teams, Outlook and Office, an SSL certificate will have to be created.

1. In the sample-app folder, run
   ```
   npx mkcert create-ca
   npx mkcert create-cert
   ```
2. Go to your File explorer and click on `ca.crt` file \* > Install Certificate > Current User > Place all certificates in the following store > Trusted Root Certification Authorities > Next > Finish > Yes
3. Change the code for 'https' under 'devServer' in webpack.config.js file in the sample-app folder:

   ```
   devServer: {
   // ...
   https: {
   key: fs.readFileSync("cert.key"),
   cert: fs.readFileSync("cert.crt"),
   ca: fs.readFileSync("ca.crt"),
   },
   // ....
   }
   ```

4. Sideload the App onto Teams Desktop.
   - Click '+ Apps'>Manage your apps> Upload an app> Upload custom app
   - You have to upload sample-app-zipped.zip file here. This file can be found in your local copy of microsoft-teams-library-js from step 1 and head to apps -> sample-app -> sample-app-zipped.zip
   - After uploading sample-app-zipped.zip, click ‘+Add’

\*ca.crt file will be found in microsoft-teams-library-js/apps/sample-app folder
