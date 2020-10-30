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

## Original Repo
[https://github.com/OfficeDev/microsoft-teams-library-js](OfficeDev/microsoft-teams-library-js)

# [Microsoft Teams JavaScript Library](https://msdn.microsoft.com/en-us/microsoft-teams/)

This JavaScript library is part of the [Microsoft Teams developer platform](https://msdn.microsoft.com/en-us/microsoft-teams/). For documentation, see [Reference: Microsoft teamsjsAppSDK JavaScript library](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client).

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

`npm install --save @microsoft/teamsjsAppSDK-js`

#### yarn

`yarn add @microsoft/teamsjsAppSDK-js`

#### Production

You can access [these files on unpkg](https://statics.teams.cdn.office.net/sdk/v1.7.0/js/teamsjsAppSDK.min.js), download them, or point your package manager to them.

## Usage

### As a npm package

Install either using npm or yarn

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import * as teamsjsAppSDK from "@microsoft/teamsjsAppSDK-js";
```

### As a Script Tag

Reference the library inside of your `.html` page using:

```html
<!-- Microsoft teamsjsApp JavaScript API (via CDN) -->
<script src="https://statics.teams.cdn.office.net/sdk/v1.7.0/js/teamsjsAppSDK.min.js" integrity="sha384-00JbifySIlPvW32u9rSurgu8PujfL6XFdV9iNn4ZWyurJJ33MFvpwPqmCHDq9ADv" crossorigin="anonymous"></script>

<!-- Microsoft teamsjsApp JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teamsjsAppSDK-js@1.7.0/dist/teamsjsAppSDK.min.js"></script>

<!-- Microsoft teamsjsApp JavaScript API (via local) -->
<script src="teamsjsAppSDK.min.js"></script>
```

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
