# Bundle size tools

This is a package which is responsible for comparing the bundle analysis of two commits. In a nutshell, this package is responsible for first finding and downloading the baseline commit's analysis in ADO And then comparing against the local bundle analysis thereby generating a summary result. This is a slightly modified version of the fluid framework package which contains specifically two changes on top of it.

| No. | Change                                                                        | AffectedFiles                                      |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| 1.  | Pass branch-name to find LCA/merge-base of it and git HEAD of current branch. | utilities\gitCommands.ts, ADO\AdoSizeComparator.ts |
| 2.  | Remove newlines from html markups while generating comment message            | ADO\getCommentForBundleDiff.ts                     |

## Building package

```
pnpm build
```

Reference:
bundle-size-tools : https://github.com/microsoft/FluidFramework/tree/main/tools/bundle-size-tools
