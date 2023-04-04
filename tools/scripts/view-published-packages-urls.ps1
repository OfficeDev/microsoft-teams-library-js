$version = Get-ChildItem -Path $Env:SYSTEM_DEFAULTWORKINGDIRECTORY/_OfficeDev.microsoft-teams-library-js/CDNFeed -Directory -Name
Write-Host "Releasing version $version"
Write-Host "CDN: https://res-sdf.cdn.office.net/teams-js/$version/js/MicrosoftTeams.min.js "
Write-Host "NPM: https://www.npmjs.com/package/@microsoft/teams-js/v/$version"