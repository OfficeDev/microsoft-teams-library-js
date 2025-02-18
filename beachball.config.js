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

module.exports = {
  branch: 'origin/main',
  bumpDeps: false,
  changeFilePrompt: {
    changePrompt: (prompt) => {
      // see https://github.com/microsoft/beachball/blob/master/src/types/ChangeFilePrompt.ts
      const { description } = prompt;

      description.message =
        'Describe changes (type or choose one). Afterwards, make sure to fill in any placeholder values in your created changefile.';
      if (description.choices) {
        while (description.choices.length > 0) {
          description.choices.pop();
        }
        description.choices.push({
          value: 'Updated documentation for `{namespace}` capability.',
          title: 'Updating documentation',
        });
        description.choices.push({
          value:
            'Added `{namespace}` capability that will {explain capability}. The capability is still awaiting support in one or most host applications. To track availability of this capability across different hosts see https://aka.ms/capmatrix',
          title: 'Initial release of alpha or beta capability',
        });
        description.choices.push({
          value:
            'Removed hidden tag on `{namespace}` capability as it is available on at least one host. To track availability of this capability across different hosts see https://aka.ms/capmatrix',
          title: 'Removing hidden tag from capability because it is now supported in at least one host',
        });
        description.choices.push({
          value:
            'Removed Beta/Preview tag on `{namespace}` capability. To track availability of this capability across different hosts see https://aka.ms/capmatrix',
          title: 'Releasing capability that is stable and fully supported',
        });
      }
      return [prompt.changeType, description];
    },
  },
  disallowedChangeTypes: ['major', 'prerelease'],
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
