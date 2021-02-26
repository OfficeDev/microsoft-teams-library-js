# teamsjs App SDK

Welcome to the teamsjs App SDK monorepo! For breaking changes, please refer to our changelog in the monorepo root.

## Merging changes made in the original repo
```powershell
# Do once, adds a link to the original repo. Do *ONE* of these
git remote add upstream https://github.com/OfficeDev/microsoft-teams-library-js.git # HTTPS
git remote add upstream git@github.com:OfficeDev/microsoft-teams-library-js.git # SSH

# Do every time we want to merge (currently weekly on Tuesdays):
git fetch upstream
git checkout develop
git pull
git checkout -b <youralias>/pull-from-upstream
git merge upstream/master
# Address merge conflicts and commit to your branch if necessary
git push origin head
# Create a PR and wait for signoff and CI to pass
git checkout develop
git merge --ff <youralias>/pull-from-upstream
git push origin head
# If this push fails it's because someone else merged to develop in the meantime.
# You can fix this with a 'git pull' and then try the push again.
git branch -d <youralias>/pull-from-upstream
```

Note: the reason that we merge into develop locally and then push to origin is because we only allow squash merges from PRs on GitHub. When pulling from upstream we don't want to squash the commits because then Git won't know which upstream commits are included in that merge, resulting in future merges conflicting with merges we've already done. By committing as a merge commit instead, the history is preserved and subsequent merges from upstream will only need to merge the new commits.

## Original Repo
[https://github.com/OfficeDev/microsoft-teams-library-js](OfficeDev/microsoft-teams-library-js)

### [Microsoft Teams JavaScript Library](https://msdn.microsoft.com/en-us/microsoft-teams/)

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
You can access [these files on unpkg](https://statics.teams.cdn.office.net/sdk/v1.9.0/js/MicrosoftTeams.min.js), download them, or point your package manager to them.

## Usage

### As a package

Install either using npm or yarn.

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import { core } from "@microsoft/teamsjs-app-sdk";
```

### As a script tag

Reference the SDK inside of your `.html` page using:

```html
<!-- Microsoft Teams JavaScript API (via CDN) -->
<!-- TODO: Update URL (as above) -->
<script src="https://statics.teams.cdn.office.net/sdk/v1.9.0/js/MicrosoftTeams.min.js" integrity="sha384-bcRxWKfzRyPxg/waVm3IsOnaH2Inoh5gGIJNOat79+wq22/BZ+mFuSTUmVc7l2el" crossorigin="anonymous"></script>

<!-- Microsoft teamsjs App JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teamsjs-app-sdk@0.0.6/dist/teamsjs.min.js"></script>

<!-- Microsoft teamsjs App JavaScript API (via local) -->
<script src="teamsjs.min.js"></script>
```

## Examples

Stay tuned for examples coming soon.

## Testing

The [teamsjs Test App](./examples/teamsjs-test-app/README.md) is used to validate the teamsjs App SDK APIs.

## Contributing

We strongly welcome and encourage contributions to this project. Please read the [contributor's guide](CONTRIBUTING.md).

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
