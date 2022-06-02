# How to Contribute

One of the best ways to contribute is to participate in discussions and discuss issues. You can also contribute by submitting pull requests with code changes.

## General Contributing Guide

1. Unless it is a trivial change, make sure that there is a corresponding issue for your change first. If there is none, create one.
2. Create a [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks) in GitHub.
3. Create a branch off the `main` branch in your fork. Name it something that that makes sense, such as `issue-123` or `githubhandle-issue`. This makes it easy for everyone to figure out what the branch is used for. It also makes it easier to isolate your change from incoming changes from the upstream repo.
4. Commit your changes.
5. Run `yarn changefile`, answer the following prompts, and push your changes to GitHub. **Important! Our pipeline checks will fail if you skip this step.** More on this below in our Change Log section.
6. Create a [pull request against the upstream's `main` branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork). If you don't know what a pull request is read [this article](https://help.github.com/articles/using-pull-requests).
7. A user with write access to the upstream repo will need to trigger the checks that run on pull requests in the repo.
8. Once your pull request is approved, a user with write access will need to merge your pull request into the upstream repo. You can then delete your branch and/or fork.

Before submitting a feature or substantial code contribution please discuss it with the team and ensure it follows the product roadmap. You might also read these two blogs posts on contributing code: [Open Source Contribution Etiquette](http://tirania.org/blog/archive/2010/Dec-31.html) by Miguel de Icaza and [Don't "Push" Your Pull Requests](http://www.igvita.com/2011/12/19/dont-push-your-pull-requests/) by Ilya Grigorik.

### Commits

Please format commit messages as follows (based on this [excellent post](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)):

```
Summarize change in 50 characters or less

Provide more detail after the first line. Leave one blank line below the
summary and wrap all lines at 72 characters or less.

If the change fixes an issue, leave another blank line after the final
paragraph and indicate which issue is fixed in the specific format
below.

Fix #42
```

Also do your best to factor commits appropriately, i.e not too large with unrelated
things in the same commit, and not too small with the same small change applied N
times in N different commits. If there was some accidental reformatting or whitespace
changes during the course of your commits, please rebase them away before submitting
the PR.

### Adding an API that utilizes version checks for compatibility

This option should only be used for work that meets ALL of the below requirements:

- Features which have already been discussed with the TeamsJS owners and for which approval to use this approach has been granted,
- Feature implementation that has a requirement of running in host clients that have not onboarded to the new declarative capability support architecture

Here are the steps for adding an API that utilizes version checks (e.g. `if (!isCurrentSDKVersionAtLeast(captureImageMobileSupportVersion)...`):

1. Add the API as a new capability or subcapability rather than adding to an existing capability. Please look at other capabilities such as [calendar.ts](packages/teams-js/src/public/calendar.ts) for examples of how to structure a capability. There must be an isSupported() function with every capability which is a simple boolean check for seeing if `runtime.supports` contains the capability.

e.g.

```
export function isSupported(): boolean {
  return runtime.supports.newCapability? true : false;
}
```

2. In [runtime.ts](packages/teams-js/src/public/runtime.ts), add an object describing the new capability and its compatibility requirements to `versionConstants`. The version number your new capability should go under

e.g.

```
// Object key is type string, value is type Array<ICapabilityReqs>
'1.9.0': [
    {
      capability: { anAndroidCapability: {} },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
      ],
    },
  ],
```

If you're adding a capability to an already existing version requirement, simply add your object to the existing array.

e.g.

```
// Object key is type string, value is type Array<ICapabilityReqs>
'1.9.0': [
    {
      capability: { anAndroidCapability: {} },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
      ],
    },
    {
      capability: { aSecondCapability: {} },
      hostClientTypes: v1HostClientTypes,
    },
  ],
```

3. And that's it! Our unit tests are designed to automatically integrate the new capability, so if the unit tests pass, you're good to go.

### CHANGE LOG using Beachball

[Beachball](https://microsoft.github.io/beachball/) is a semantic version bumper that also has an automated tool to ask contributors to log changes in a simple CLI manner.

The TeamsJS Client SDK contains a [Change Log](./packages/teams-js/CHANGELOG.md) for substantial changes in the `<root>/packages/teams-js` directory. If you make any changes to the `<root>/packages/teams-js` directory (you can see the exception files and directories in [beachball.config.js](./beachball.config.js`)), you must run `yarn changefile` from the monorepo root to generate change files.

Beachball generates JSON change files based on a few simple answers from you:

- Change type: this can be one of four types: Patch, Minor, None, and Major.

  - Patch - bug fixes; no API changes.

  - Minor - small feature; backwards compatible API changes.

  - None - this change does not affect the published package in any way.

  - Major - major feature; breaking changes.

- Describe changes: Type your own message or choose one of the commit messages. Try to make it descriptive - it will help you if you need to locate the change file later.
  - Please use past tense (e.g., "Added comments to \`app.initialize\`")
  - Enclose function/interface/enum/etc. names in backticks

And that's it! As easy as hitting 'enter' twice. Beachball will automatically commit the change file you've created. All you have to do is run `yarn changefile` in the monorepo root to do the above change file generation as the last step in your branch to make sure your PR is ready for review. Our pipelines will check to see if you generated a change file and will fail if you forgot. If they do, please create the change file as per the steps listed and update the content accordingly.

## Contributor License

You must sign a [Contributor License Agreement](https://cla.microsoft.com/) before submitting your pull request. To complete the Contributor License Agreement (CLA), you will need to submit a request via the [form](https://cla.microsoft.com/) and then electronically sign the CLA when you receive the email containing the link to the document. You need to sign the CLA only once to cover submission to any Microsoft OSS project.

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Q & A

### Q. Can I have more than one change file in one PR?

Each PR will not be able to have more than one change file. (e.g. A bug fix and a minor change should go through separate PRs.)

### Q. I made new changes during my PR after I already generated the change file/I made a mistake while generating the change file! How can I edit it?

You can manually edit the change file- it's actually just a JSON file. Locate your change file under the [change](./change) directory. If you're having trouble finding your change file, try searching the directory in your IDE for your change description or going through your branch's commit history for the change file you had committed.
