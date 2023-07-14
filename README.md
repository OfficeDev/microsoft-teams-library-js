# Microsoft Teams JavaScript client library

[![Microsoft Teams Library JS CI](https://github.com/OfficeDev/microsoft-teams-library-js/actions/workflows/main.yml/badge.svg?event=push)](https://github.com/OfficeDev/microsoft-teams-library-js/actions/workflows/main.yml)
[![Build Status](https://office.visualstudio.com/ISS/_apis/build/status/Taos%20Platform/App%20SDK/OfficeDev.microsoft-teams-library-js)](https://office.visualstudio.com/ISS/_build/latest?definitionId=17483)

Welcome to the Teams client library monorepo! For breaking changes, please refer to our [changelog](./packages/teams-js/CHANGELOG.md) in the `<root>/packages/teams-js` directory. This repository contains the core teams-js package as well as tools and applications for analyzing and testing.

## Getting Started

The following guide references steps to build the entire project including TeamsJS and all of the included apps. For guidelines on just building an individual app please look at the [Apps](#apps).

### Building this Project

1. Clone this repository `git clone https://github.com/OfficeDev/microsoft-teams-library-js.git`
2. Run `pnpm install` from repo root
3. Run `pnpm build` from repo root
4. To run Unit tests, run `pnpm test`

### Submitting a Pull Request

Please look through our [Contributing Guide](CONTRIBUTING.md) for important details on how to submit a pull request and contribute to this repository.

NOTE: Make sure `pnpm@7.30.1` is installed as a global tool, by running `npm install -g pnpm@7.30.1`.

TIP: whenever building or testing the Teams client library, you can run `pnpm build` or `pnpm test` from the `packages/teams-js` directory.

This JavaScript library is part of the [Microsoft Teams developer platform](https://learn.microsoft.com/microsoftteams/platform/overview?view=msteams-client-js-latest). See full [library reference documentation](https://learn.microsoft.com/javascript/api/overview/msteams-client?view=msteams-client-js-latest).

# Packages

Contain the core exports for the repository.

### [teams-js](./packages/teams-js)

Used to integrate custom services and applications with Teams, Outlook, and Office.

---

# Apps

The apps folder contains applications used to test various aspects of the library.

### [Teams Perf Test App](./apps/teams-perf-test-app/README.md)

React application used to locally test the loading times of the library.

### [Teams Test App](./apps/teams-test-app/README.md)

Application used to test the functionality of the various library APIs.

### [SSR Test App](./apps/ssr-test-app/README.md)

Application used to ensure library changes do not break server-side rendering capabilities.

---

### Locally generating reference documentation

If you would like to locally generate reference documentation for TeamsJS v2, simply utilize the script `pnpm run docs` either from the monorepo root or inside the teams-js project root (`packages/teams-js`). This should output the generated documentation to `packages/teams-js/docs`.

# Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md) which contains important information.

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
