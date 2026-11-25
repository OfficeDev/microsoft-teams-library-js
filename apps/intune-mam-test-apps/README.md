# Intune MAM test app packages

This folder contains Teams app packages for manual Intune MAM validation in MetaOS HubSDK WebView hosts.

## Packages

| Folder | Purpose |
| --- | --- |
| `partner-connect-mam-intune` | Test app package with manifest `intuneInfo.supportedMobileAppManagementVersion` enabled. |
| `partner-connect-mam-control` | Control app package without manifest `intuneInfo`. |

Each package folder contains the app `manifest.json` and icon assets needed to upload the app package for testing.

These are manifest-only app packages and are not part of the monorepo build.
