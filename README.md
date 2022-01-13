# Microsoft Teams JavaScript client SDK

Welcome to the Teams client SDK monorepo! For breaking changes, please refer to our changelog in the monorepo root of the `2.0-preview` branch. This repository contains the core teams-client-sdk as well as tools and applications for use analyzing and testing.

This JavaScript library is part of the [Microsoft Teams developer platform](https://developer.microsoft.com/microsoft-teams/). See full [SDK reference documentation](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client).

[![Build Status](https://travis-ci.org/OfficeDev/microsoft-teams-library-js.svg?branch=2.0-preview)](https://travis-ci.org/OfficeDev/microsoft-teams-library-js)

[![Coverage Status](https://coveralls.io/repos/github/OfficeDev/microsoft-teams-library-js/badge.svg?branch=2.0-preview)](https://coveralls.io/github/OfficeDev/microsoft-teams-library-js?branch=2.0-preview)

# Apps

The apps folder contains applications used to test various aspects of the sdk.

### [Bundle Analysis App](./apps/bundle/analysis-app/README.md)

This application is responsible for testing the size of the final sdk bundle.

### [Teams Perf Test App](./apps/teams-perf-test-app/README.md)

React application used to locally test the loading times of the sdk.

### [Teams Test App](./apps/teams-test-app/README.md)

Application used to test the functionality of the various SDK APIs.

---

# Packages

Contain the core exports for the repository.

### [Bundle Size Tools](./packages/bundle-size-tools/README.md)

Package used to measure the difference in size between two recent commits.

### [Teams-Js](./packages/teams-js)

Used to integrate custom services and applications with Teams

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
