param ($PIPELINE_WORKSPACE, $NPM_TOKEN)

Set-Content -Path $PIPELINE_WORKSPACE/microsoft-teams-library-js-pipeline/NPMFeed/.npmrc -Value "//registry.npmjs.org/:_authToken=$NPM_TOKEN"
