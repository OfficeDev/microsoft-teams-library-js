const fs = require('fs');

const postbump = (packagePath, packageName, packageVersion) => {
  fs.rm(`${packagePath}/CHANGELOG.json`, (err) => {
    if (err) {
      console.log(err.message);
      return;
    }
    return;
  });
};

// Overriding the default entry renderer so that it just shows the comment without the author.
const customRenderEntry = (ChangelogEntry) => new Promise((res) => res(`- ${ChangelogEntry.comment}`));
const changePromptFunction = (DefaultPrompt, string) => new Promise((res) => res(`- ${ChangelogEntry.comment}`));

module.exports = {
  branch: 'origin/main',
  bumpDeps: false,
  changeFilePrompt: {
    changePrompt: (prompt) => {
      // see https://github.com/microsoft/beachball/blob/master/src/types/ChangeFilePrompt.ts
      const { changeType } = prompt;
      changeType.choices &&
        changeType.choices.forEach((choice) => {
          if (choice.value === 'patch') {
            choice.title = ' �[1mPatch�[22m      - Changes that bumps packge with patch version.';
          } else if (choice.value === 'minor') {
            choice.title = ' �[1mMinor�[22m      - Changes that bumps packge with minor version.';
          }
        });

      const changeAreaPrompt = {
        type: 'select',
        name: 'area',
        message: 'Change area',
        choices: [
          { value: 'fix', title: 'Bug fix' },
          { value: 'perf', title: 'Performance' },
          { value: 'doc', title: 'Documentation' },
        ],
      };
      return [prompt.changeType, changeAreaPrompt, prompt.description];
    },
  },
  disallowedChangeTypes: ['prerelease'],
  generateChangelog: true,
  hooks: { postbump },
  ignorePatterns: ['.*ignore', '*config.js', '*.md', '**/test/**'],
  publish: false,
  push: false,
  scope: ['packages/teams-js'],
  changelog: {
    customRenderers: {
      renderEntry: customRenderEntry,
    },
  },
};
