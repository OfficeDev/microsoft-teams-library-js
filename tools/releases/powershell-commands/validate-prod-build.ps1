# Runs in the Prod release pipeline before the Lockbox approval stage. Checks that the pinned CI build is the one for
# the queued release branch, using the offline checks in check-release.js. Read-only.
param ($CDNFeed)

$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '../../..'))

function Fail($message) {
  Write-Host "##vso[task.logissue type=error]$message"
  exit 1
}

$checkScript = '.github/skills/release-teamsjs/check-release.js'
if (-not (Test-Path $checkScript)) {
  Fail "$checkScript is not on this branch. Update the release branch from main, then queue again."
}
if (-not $CDNFeed -or -not (Test-Path $CDNFeed)) {
  Fail "The CDNFeed artifact was not found at '$CDNFeed'."
}

$versions = @(Get-ChildItem -Path $CDNFeed -Directory -Name -Exclude _*)
if ($versions.Count -ne 1) {
  Fail "The pinned CI build's CDNFeed holds version folders [$($versions -join ', ')], expected exactly one. Queue again with the CI run from the prep PR merge."
}
$version = $versions[0]

$branchVersion = (Get-Content -Raw packages/teams-js/package.json | ConvertFrom-Json).version
if ($version -ne $branchVersion) {
  Fail "The pinned CI build is $version but packages/teams-js/package.json on this branch is $branchVersion. Queue again with the CI run from the prep PR merge."
}

node $checkScript carriers --version $version
if ($LASTEXITCODE -ne 0) {
  Fail "The version carriers on this branch disagree. Fix the release branch, then queue again with its new CI run."
}

node $checkScript artifact --version $version --file (Join-Path $CDNFeed "$version/js/MicrosoftTeams.min.js")
if ($LASTEXITCODE -ne 0) {
  Fail "The pinned CI build's bundle does not match this branch's SRI. Queue again with the CI run from the prep PR merge."
}

node $checkScript pipeline-config
if ($LASTEXITCODE -ne 0) {
  Fail "The release pipeline YAML on this branch failed its checks. Fix it through a reviewed PR, then queue again."
}

Write-Host "The pinned CI build $version matches this branch."
