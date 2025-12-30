param ($PIPELINE_WORKSPACE)

$version = Get-ChildItem -Path $PIPELINE_WORKSPACE/microsoft-teams-library-js-pipeline/CDNFeed -Directory -Name -Exclude _*
Write-Host "Releasing version $version"
Write-Host "CDN: https://res-sdf.cdn.office.net/teams-js/$version/js/MicrosoftTeams.min.js"
Write-Host "NPM: https://www.npmjs.com/package/@microsoft/teams-js/v/$version"
