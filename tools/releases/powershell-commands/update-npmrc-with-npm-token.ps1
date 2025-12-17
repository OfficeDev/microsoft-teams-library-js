Set-Content -Path $(PIPELINE.WORKSPACE)/microsoft-teams-library-js-pipeline/NPMFeed/.npmrc -Value "//registry.npmjs.org/:_authToken=$(NPM-TOKEN)"

# TODO: Remove this test step when merging in. 
# Test that we wrote to .npmrc correctly and the token works
npm whoami --registry=https://registry.npmjs.org/