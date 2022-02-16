# How to Contribute in 2.0-preview

One of the best ways to contribute is to participate in discussions and discuss issues. You can also contribute by submitting pull requests with code changes.

## General Contributing Guide

1. Unless it is a trivial change, make sure that there is a corresponding issue for your change first. If there is none, create one.
2. Create a fork in GitHub
3. Create a branch off the `2.0-preview` branch. Name it something that that makes sense, such as `issue-123` or `githubhandle-issue`. This makes it easy for everyone to figure out what the branch is used for. It also makes it easier to isolate your change from incoming changes from the origin.
4. Commit your changes
5. Run `yarn changefile`, answer the following prompts, and push your changes to GitHub. **Important! Our pipeline checks will fail if you skip this step.** More on this below in our Changelog section.
6. Create a pull request against the origin's `2.0-preview` branch. If you don't know what a pull request is read [this article](https://help.github.com/articles/using-pull-requests).

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

### CHANGELOG using Beachball

[Beachball](https://microsoft.github.io/beachball/) is a semantic version bumper that also has an automated tool to ask contributors to log changes in a simple CLI manner.

The TeamsJS Client SDK `2.0-preview` branch contains a [changelog](./packages/teams-js/CHANGELOG.md) for substantial changes in the `<root>/packages/teams-js` directory. If you make any changes to the `<root>/packages/teams-js` directory (you can see the exception files and directories in [beachball.config.js](./beachball.config.js`), you must run `yarn changefile` from the monorepo root to generate change files.

Beachball generates JSON change files based on a few simple answers from you:

- Change type: this can be one of four things. (The Prerelease option is not allowed in this repo at this time.) Patch, Minor, None, and Major.

  - Patch - bug fixes; no API changes.

  - Minor - small feature; backwards compatible API changes.

  - None - this change does not affect the published package in any way.

  - Major - major feature; breaking changes.

- Describe changes (type your own or choose one of the commit descriptions. Try to make it descriptive- it will help you if you need to locate the changefile later.)

And that's it! As easy as hitting 'enter' twice. Beachball will automatically commit the change file you've created. All you have to do is run `yarn changefile` in the monorepo root to do the above change file generation as the last step in your branch to make sure your PR is ready for review. Our pipelines will check to see if you haven't generated a changefile and they will fail if that's the case, so please remember to generate a changefile and update the content accordingly.

## Contributor License

You must sign a [Contributor License Agreement](https://cla.microsoft.com/) before submitting your pull request. To complete the Contributor License Agreement (CLA), you will need to submit a request via the [form](https://cla.microsoft.com/) and then electronically sign the CLA when you receive the email containing the link to the document. You need to sign the CLA only once to cover submission to any Microsoft OSS project.

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Q & A

### Q. Can I have more than one changefile in one PR?

Each PR will not be able to have more than one changefile. (e.g. A bug fix and a minor change should go through separate PRs.)

### Q. I made new changes during my PR after I already generated the changefile/I made a mistake while generating the changefile! How can I edit it?

You can manually edit the changefile- it's actually just a JSON file. Locate your changefile under the [change](./change) directory. If you're having trouble finding your changefile, try searching the directory in your IDE for your change description or going through your branch's commit history for the changefile you had committed.
