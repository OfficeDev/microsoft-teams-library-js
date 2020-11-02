# teamsjs App SDK

## Merging changes made in the original repo
```powershell
# Do once, adds a link to the original repo. Do *ONE* of these
git remote add upstream https://github.com/OfficeDev/microsoft-teams-library-js.git # HTTPS
git remote add upstream git@github.com:OfficeDev/microsoft-teams-library-js.git # SSH

# Do every time we want to merge
git fetch upstream
git merge upstream/master
```

## BREAKING CHANGES

The JavaScript library "teams-js" has been renamed to "teamsjs-app-sdk"
  - All the public API functions have been moved under 'core' namespace

## Original Repo
[https://github.com/OfficeDev/microsoft-teams-library-js](OfficeDev/microsoft-teams-library-js)

# [Microsoft Teams JavaScript Library](https://msdn.microsoft.com/en-us/microsoft-teams/)

This JavaScript library is part of the [Microsoft Teams developer platform](https://msdn.microsoft.com/en-us/microsoft-teams/). For documentation, see [Reference: Microsoft teamsjs App SDK JavaScript library](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client).

[![Build Status](https://travis-ci.org/OfficeDev/microsoft-teams-library-js.svg?branch=master)](https://travis-ci.org/OfficeDev/microsoft-teams-library-js)
[![Coverage Status](https://coveralls.io/repos/github/OfficeDev/microsoft-teams-library-js/badge.svg?branch=master)](https://coveralls.io/github/OfficeDev/microsoft-teams-library-js?branch=master)

## Getting Started

1.  Clone the repo
2.  Navigate to the repo root
3.  `yarn install`
4.  `yarn build`
5.  to run Unit test `yarn test`

### Installation

To install the stable version:

#### npm

`npm install --save @microsoft/teamsjs-app-sdk`

#### yarn

`yarn add @microsoft/teamsjs-app-sdk`

#### Production

You can access [these files on unpkg](https://statics.teams.cdn.office.net/sdk/v1.7.0/js/teamsjs.min.js), download them, or point your package manager to them.

## Usage

### As a npm package

Install either using npm or yarn

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import { core } from "@microsoft/teamsjs-app-sdk";
```

### As a Script Tag

Reference the library inside of your `.html` page using:

```html
<!-- Microsoft teamsjs App JavaScript API (via CDN) -->
<script src="https://statics.teams.cdn.office.net/sdk/v1.7.0/js/teamsjs.min.js" integrity="sha384-00JbifySIlPvW32u9rSurgu8PujfL6XFdV9iNn4ZWyurJJ33MFvpwPqmCHDq9ADv" crossorigin="anonymous"></script>

<!-- Microsoft teamsjs App JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teamsjs-app-sdk@1.7.0/dist/teamsjs.min.js"></script>

<!-- Microsoft teamsjs App JavaScript API (via local) -->
<script src="teamsjs.min.js"></script>
```

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
