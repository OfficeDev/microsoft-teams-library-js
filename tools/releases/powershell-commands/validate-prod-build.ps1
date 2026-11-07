# Runs in the Prod release pipeline before the Lockbox approval stage. Checks that the pinned CI build is the one for
# the queued release branch: built from the same branch and commit, with an npm package and a CDN bundle of the
# branch's version, using the offline checks in check-release.js. Read-only.
param ($CDNFeed, $NPMFeed, $CISourceBranch, $CISourceCommit, $QueuedBranch, $QueuedCommit)

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
if (-not $CDNFeed -or -not (Test-Path -LiteralPath $CDNFeed)) {
  Fail "The CDNFeed artifact was not found at '$CDNFeed'."
}
if (-not $NPMFeed -or -not (Test-Path $NPMFeed)) {
  Fail "The NPMFeed artifact was not found at '$NPMFeed'."
}

$runValues = [ordered]@{
  "the CI build's source branch" = $CISourceBranch
  "the CI build's source commit" = $CISourceCommit
  'the queued branch'             = $QueuedBranch
  'the queued commit'             = $QueuedCommit
}
foreach ($name in $runValues.Keys) {
  $value = $runValues[$name]
  if (-not $value -or $value -match '\$\(') {
    Fail "The stage did not receive $name (got '$value'); check the stage's arguments in prod-release.yml."
  }
}
foreach ($commit in @($CISourceCommit, $QueuedCommit)) {
  if ($commit -notmatch '^[0-9a-fA-F]{40}$') {
    Fail "'$commit' is not a full commit SHA."
  }
}
if ($CISourceBranch -cne $QueuedBranch) {
  Fail "The pinned CI build is from $CISourceBranch but this run was queued from $QueuedBranch. Queue Prod from the release branch, with a CI run of that branch."
}
if ($CISourceCommit -ne $QueuedCommit) {
  Fail "The pinned CI build is of commit $CISourceCommit but $QueuedBranch was at $QueuedCommit when this run was queued. Queue again with the CI run of $QueuedCommit."
}

$versionDirectories = @(Get-ChildItem -LiteralPath $CDNFeed -Directory -Force | Where-Object { $_.Name -notlike '_*' })
$versions = @($versionDirectories.Name)
if ($versions.Count -ne 1) {
  Fail "The pinned CI build's CDNFeed holds version folders [$($versions -join ', ')], expected exactly one. Queue again with the CI run from the prep PR merge."
}
if (($versionDirectories[0].Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
  Fail "The pinned CI build's version folder is a link, expected an artifact directory."
}
$version = $versions[0]

if ($QueuedBranch -cne "refs/heads/release/$version") {
  Fail "The pinned CI build is $version, so Prod must be queued from release/$version, not $QueuedBranch."
}

$branchVersion = (Get-Content -Raw packages/teams-js/package.json | ConvertFrom-Json).version
if ($version -ne $branchVersion) {
  Fail "The pinned CI build is $version but packages/teams-js/package.json on this branch is $branchVersion. Queue again with the CI run from the prep PR merge."
}

$npmPackageFile = Join-Path $NPMFeed 'package.json'
if (-not (Test-Path -LiteralPath $npmPackageFile -PathType Leaf)) {
  Fail "The pinned CI build's NPMFeed has no package.json, so the npm package it would publish cannot be checked."
}
$npmPackage = Get-Content -Raw -LiteralPath $npmPackageFile | ConvertFrom-Json
if ($npmPackage.name -cne '@microsoft/teams-js' -or $npmPackage.version -cne $version) {
  Fail "The pinned CI build's npm package is $($npmPackage.name)@$($npmPackage.version), but its CDN bundle and this branch are $version. Queue again with the CI run from the prep PR merge."
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

Write-Host "The pinned CI build $version ($CISourceCommit) matches this branch, and its npm package is @microsoft/teams-js@$version."
