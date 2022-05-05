# Microsoft Teams JavaScript client SDK

This SDK is part of the [Microsoft Teams developer platform](https://developer.microsoft.com/microsoft-teams). See full [SDK reference documentation](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client).

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

`npm install --save @microsoft/teams-js`

#### yarn

`yarn add @microsoft/teams-js`

#### Production

You can access [these files on unpkg](https://statics.teams.cdn.office.net/sdk/v1.11.0/js/MicrosoftTeams.min.js), download them, or point your package manager to them.

## Usage

### As a package

Install either using npm or yarn.

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import * as microsoftTeams from "@microsoft/teams-js";
```

### As a script tag

Reference the SDK inside of your `.html` page using:

```html
<!-- Microsoft Teams JavaScript API (via CDN) -->
<script src="https://statics.teams.cdn.office.net/sdk/v1.12.1/js/MicrosoftTeams.min.js" integrity="sha384-HmRb1xX74v8jZiukR88bXWmRgVO/3uU7eHP64Ng+fnU0kc9JPBauRiQCPkvEtSGF" crossorigin="anonymous"></script>

<!-- Microsoft Teams JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teams-js@1.11.0/dist/MicrosoftTeams.min.js"></script>

<!-- Microsoft Teams JavaScript API (via local) -->
<script src="MicrosoftTeams.min.js"></script>
```

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
