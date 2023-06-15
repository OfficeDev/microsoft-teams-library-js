# How to Contribute

One of the best ways to contribute is to participate in discussions and discuss issues. You can also contribute by submitting pull requests with code changes.

## API Design Guidelines

Please review the [architectural guidelines](https://github.com/OfficeDev/microsoft-teams-library-js/wiki/Library-Architecture) when adding/changing functionality in the teams-js library.

## General Contribution Guide

1. Unless it is a trivial change, make sure that there is a corresponding issue for your change first. If there is none, create one.
2. If you would like to share code changes with our team please look at the [Contribution Guide for Users Without Write Access](#contribution-guide-for-users-without-write-access)

## Contribution Guide for Users with Write Access

1. Clone this GitHub repository. If you are an internal Microsoft employee, see [here](#q-im-a-microsoft-employee-how-do-i-gain-write-access)
2. Create a branch off the `main` branch in your cloned repository. Name it something that that makes sense, such as `issue-123` or `githubhandle-issue`. This makes it easy for everyone to figure out what the branch is used for. It also makes it easier to isolate your change from incoming changes from the upstream repo.
3. Commit your changes.
4. Run `pnpm changefile`, answer the following prompts, and push your changes to GitHub. **Important! Our pipeline checks will fail if you skip this step.** More on this below in our Change Log section.
5. Create a [pull request against the `main` branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests). If you don't know what a pull request is read [this article](https://help.github.com/articles/using-pull-requests).

### Commits

Please format commit messages as follows (based on this [excellent post](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)):

```console
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

## CHANGE LOG using Beachball

[Beachball](https://microsoft.github.io/beachball/) is a semantic version bumper that also has an automated tool to ask contributors to log changes in a simple CLI manner.

The TeamsJS Client library contains a [Change Log](./packages/teams-js/CHANGELOG.md) for substantial changes in the `<root>/packages/teams-js` directory. If you make any changes to the `<root>/packages/teams-js` directory (you can see the exception files and directories in [beachball.config.js](./beachball.config.js`)), you must run `pnpm changefile` from the monorepo root to generate change files.

Beachball generates JSON change files based on a few simple answers from you:

- Change type: this can be one of four types: Major, Minor, Patch, and None. In addition to the descriptions provided in the prompt, the following can help guide which type to choose:

  - Major - when you make incompatible API changes,
  - Minor - when you add functionality in a backwards compatible manner,
  - Patch - when you make backwards compatible bug fixes
  - None - when the change does not affect the published package in any way.

- Describe changes: Type your own message or choose one of the commit messages. Try to make it descriptive - it will help you if you need to locate the change file later.
  - Please use past tense (e.g., "Added comments to \`app.initialize\`")
  - Enclose function/interface/enum/etc. names in backticks

And that's it! As easy as hitting 'enter' twice. Beachball will automatically commit the change file you've created. All you have to do is run `pnpm changefile` in the monorepo root to do the above change file generation as the last step in your branch to make sure your PR is ready for review. Our pipelines will check to see if you generated a change file and will fail if you forgot. If they do, please create the change file as per the steps listed and update the content accordingly.

## Contributor License

You must sign a [Contributor License Agreement](https://cla.microsoft.com/) before submitting your pull request. To complete the Contributor License Agreement (CLA), you will need to submit a request via the [form](https://cla.microsoft.com/) and then electronically sign the CLA when you receive the email containing the link to the document. You need to sign the CLA only once to cover submission to any Microsoft OSS project.

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Q & A

### Q. I'm a Microsoft Employee, How Do I Gain Write Access?

1. Use or create a corporate-linked github account (if you already have a github account associated with Microsoft, you can skip this step)

2. With your github account ready, visit https://repos.opensource.microsoft.com/ and follow the instructions to link it to Microsoft and join the Microsoft organization.

3. Join the [OfficeDev](https://repos.opensource.microsoft.com/orgs/OfficeDev/join) organization

4. Request to join the [Teams Client SDK Contributors](https://github.com/orgs/OfficeDev/teams/teams-client-sdk-contributors) organization

### Q. Can I have more than one change file in one PR?

Each PR will not be able to have more than one change file. (e.g. A bug fix and a minor change should go through separate PRs.)

### Q. I made new changes during my PR after I already generated the change file/I made a mistake while generating the change file! How can I edit it?

You can manually edit the change file- it's actually just a JSON file. Locate your change file under the [change](./change) directory. If you're having trouble finding your change file, try searching the directory in your IDE for your change description or going through your branch's commit history for the change file you had committed.

## Contribution Guide for Users without Write Access

If you would like to share code changes with members of the team that have write access please do the following:

1. Either add a code snippet to the issue that was created in the first step of the [General Contribution Guide](#general-contribution-guide) or fork the repository and make the necessary changes on your forked repository. If you go with the latter option please refer to the following steps:
2. Create a [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks) in GitHub.
3. Create a branch off the `main` branch in your fork. Name it something that that makes sense, such as `issue-123` or `githubhandle-issue`. This makes it easy for everyone to figure out what the branch is used for. It also makes it easier to isolate your change from incoming changes from the upstream repo.
4. Commit your changes. [Commits](#commits)
5. Create a [pull request against the upstream's `main` branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork). If you don't know what a pull request is read [this article](https://help.github.com/articles/using-pull-requests).
6. Add a comment to the issue with a link to this pull request and an explanation of why this change is being made.
7. Upon review, a member of our team with write access will open a new PR containing these changes that will run checks against it.
8. Once these checks have successfully completed we will merge the code into the `main` branch and update the issue.

Before submitting a feature or substantial code contribution please discuss it with the team and ensure it follows the product roadmap. You might also read these two blogs posts on contributing code: [Open Source Contribution Etiquette](http://tirania.org/blog/archive/2010/Dec-31.html) by Miguel de Icaza and [Don't "Push" Your Pull Requests](http://www.igvita.com/2011/12/19/dont-push-your-pull-requests/) by Ilya Grigorik.
