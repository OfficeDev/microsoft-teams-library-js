Write-Host "Testing Token ${NPM_TOKEN}"
Set-Content -Path $Env:SYSTEM_DEFAULTWORKINGDIRECTORY/_OfficeDev.microsoft-teams-library-js/NPMFeed/.npmrc -Value "//registry.npmjs.org/:_authToken=${NPM_TOKEN}"
$registry = Get-Content -Path $Env:SYSTEM_DEFAULTWORKINGDIRECTORY/_OfficeDev.microsoft-teams-library-js/NPMFeed/.npmrc
Write-Host "Testing npmrc: $registry"