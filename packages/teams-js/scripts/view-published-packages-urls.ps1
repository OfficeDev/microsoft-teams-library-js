param (
  $PIPELINE_WORKSPACE,
  # The CDN host this run published to: res.cdn.office.net for Prod, res-sdf.cdn.office.net for SDF.
  $CDN_HOST = 'res.cdn.office.net'
)

$version = Get-ChildItem -Path $PIPELINE_WORKSPACE/microsoft-teams-library-js-pipeline/CDNFeed -Directory -Name -Exclude _*
Write-Host "Releasing version $version"
Write-Host "CDN: https://$CDN_HOST/teams-js/$version/js/MicrosoftTeams.min.js"
Write-Host "NPM: https://www.npmjs.com/package/@microsoft/teams-js/v/$version"