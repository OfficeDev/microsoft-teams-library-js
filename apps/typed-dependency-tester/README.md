# Typed Dependency Tester

The Typed Dependency Tester is a tool used to detect if types in `MicrosoftTeams.d.ts` are importing types from other modules and giving them an implicit `any` resolution

## Getting Started

### Running the Dependency Tester

If you would like to use this tester locally, simply type `pnpm build` in your terminal. The tester will then proceed to install the workspace version of the TeamsJS library.

If you would like to test against a specific version of TeamsJS you will need to edit the `@microsoft/teams-js` version in the `package.json` file.

If a `TS2304` type error occurs during the build, then the tester has successfully detected a build failure in the `MicrosoftTeams.d.ts` file. Please investigate the generated typed file using the outputted build failure information.

## Troubleshooting

- If you see an error that is unrelated to types during the `pnpm build` check to make sure you have installed and built the `teams-js` package by running `pnpm i` and `pnpm build` from the repository root.
