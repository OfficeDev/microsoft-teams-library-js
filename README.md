# teamsjs App SDK

Welcome to the teamsjs App SDK monorepo! For breaking changes, please refer to our changelog in the monorepo root.

## Original Repo

### [Microsoft Teams JavaScript Library](https://github.com/OfficeDev/microsoft-teams-library-js)

This JavaScript library is part of the [Microsoft Teams developer platform](https://developer.microsoft.com/microsoft-teams/). See full [SDK reference documentation](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client).

[![Build Status](https://travis-ci.org/OfficeDev/microsoft-teams-library-js.svg?branch=master)](https://travis-ci.org/OfficeDev/microsoft-teams-library-js)
[![Coverage Status](https://coveralls.io/repos/github/OfficeDev/microsoft-teams-library-js/badge.svg?branch=master)](https://coveralls.io/github/OfficeDev/microsoft-teams-library-js?branch=master)

## Getting Started

1.  Clone the repo
2.  Navigate to the repo root and run `yarn install`
3.  `yarn build-sdk` from repo root
4.  to run Unit test `yarn test-sdk`

TIP: whenever building or testing the teamsjs App SDK, you can run `yarn build` or `yarn test` from the teamsjs-app-sdk directory.

## Installation

To install the stable version:

#### npm

`npm install --save @microsoft/teamsjs-app-sdk`

#### yarn

`yarn add @microsoft/teamsjs-app-sdk`

#### Production

**TODO:** Update this URL once we have released the App SDK publicly and published it to a CDN (currently the URL points to the Teams SDK)
You can access [these files on unpkg](https://statics.teams.cdn.office.net/sdk/v1.10.0/js/MicrosoftTeams.min.js), download them, or point your package manager to them.

## Usage

### As a package

Install either using npm or yarn.

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import { core } from '@microsoft/teamsjs-app-sdk';
```

### As a script tag

Reference the SDK inside of your `.html` page using:

```html
<!-- Microsoft Teams JavaScript API (via CDN) -->
<!-- TODO: Update URL (as above) -->
<script
  src="https://statics.teams.cdn.office.net/sdk/v1.10.0/js/MicrosoftTeams.min.js"
  integrity="sha384-6oUzHUqESdbT3hNPDDZUa/OunUj5SoxuMXNek1Dwe6AmChzqc6EJhjVrJ93DY/Bv"
  crossorigin="anonymous"
></script>

<!-- Microsoft teamsjs App JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teamsjs-app-sdk@0.1.6/dist/teamsjs.min.js"></script>

<!-- Microsoft teamsjs App JavaScript API (via local) -->
<script src="teamsjs.min.js"></script>
```

### Dependencies

teamsjs App SDK depends on [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) type. If you support older browsers and devices which may not yet provide it natively (e.g. IE 11), you need to provide a global polyfill, such as [es6-promise](https://www.npmjs.com/package/es6-promise), in your bundled application. If you're using a script tag to reference the teamsjs App SDK, you need to make sure the polyfill is included and initialized before the teamsjs App SDK is.

## Examples

Stay tuned for examples coming soon.

## Testing

The [teamsjs Test App](./examples/teamsjs-test-app/README.md) is used to validate the teamsjs App SDK APIs.

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
