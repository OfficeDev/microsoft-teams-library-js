# Blazor Test App

The Blazor Test App is a test app written in C#/Blazor used to ensure any changes made to the teams-js package do not break any functionality for C# teams apps.

## Getting Started

### Running the Test App on its own

If you would like to run this app on its own locally, please follow the steps below.

```
cd {monorepo root}

// Ensuring you have installed and built the Teams JavaScript client SDK
pnpm install
pnpm build

pnpm start-blazor-app
```

or if you have already built the Teams JavaScript client SDK and would like to build and run directly from the project directory blazor-test-app, simply `pnpm build` and `pnpm start` there.

Once starting the app, it will run on https://localhost:44302. Upon visiting the page, the text `Congratulations` on the page indicates the c# app is working properly, otherwise an error will be thrown in the console and the webpage will not render.

_NOTE: The Blazor Test App Needs to have the latest compiled version of MicrosoftTeams.min.js located inside the blazor-test-app/wwwroot/js directory. This can be copied over manually, however this will be done automatically when building the entire teams-js package from the monorepo root, so that course of action is recommended_
