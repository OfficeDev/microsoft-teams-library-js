# Microsoft Teams JavaScript client SDK

Welcome to the Teams client SDK monorepo! For breaking changes, please refer to our changelog in the monorepo root of the `2.0-preview` branch. This repository contains the core teams-js package as well as tools and applications for analyzing and testing.

## Getting Started

1. Clone the repo
2. Run `yarn install` from repo root
3. Run `yarn build` from repo root
4. To run Unit tests, run `yarn test`

TIP: whenever building or testing the Teams client SDK, you can run `yarn build` or `yarn test` from the `packages/teams-js` directory.

This JavaScript library is part of the [Microsoft Teams developer platform](https://docs.microsoft.com/en-us/microsoftteams/platform/overview?view=msteams-client-js-beta). See full [SDK reference documentation](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client?view=msteams-client-js-beta).

[![Build Status](https://travis-ci.org/OfficeDev/microsoft-teams-library-js.svg?branch=2.0-preview)](https://travis-ci.org/OfficeDev/microsoft-teams-library-js)
[![Coverage Status](https://coveralls.io/repos/github/OfficeDev/microsoft-teams-library-js/badge.svg?branch=2.0-preview)](https://coveralls.io/github/OfficeDev/microsoft-teams-library-js?branch=2.0-preview)

# Packages

Contain the core exports for the repository.

### [teams-js](./packages/teams-js)

Used to integrate custom services and applications with Teams, Outlook, and Office.

### [Bundle Size Tools](./packages/bundle-size-tools/README.md)

Package used to measure the difference in size between two recent commits.

---

# Apps

The apps folder contains applications used to test various aspects of the SDK.

### [Bundle Analysis App](./apps/bundle/analysis-app/README.md)

Application responsible for testing the size of the final SDK bundle.

### [Teams Perf Test App](./apps/teams-perf-test-app/README.md)

React application used to locally test the loading times of the SDK.

### [Teams Test App](./apps/teams-test-app/README.md)

Application used to test the functionality of the various SDK APIs.

---

### Locally generating reference documentation

If you would like to locally generate reference documentation for TeamsJS v2, simply utilize the script `yarn docs` either from the monorepo root or inside the teams-js project root (`packages/teams-js`). This should output the generated documentation to `packages/teams-js/docs`.

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
