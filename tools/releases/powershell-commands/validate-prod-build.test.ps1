$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'validate-prod-build.ps1'
$shell = (Get-Process -Id $PID).Path
$root = Join-Path $env:TEMP ("validate-prod-build-tests-" + [guid]::NewGuid().ToString('N'))
$repo = Join-Path $root 'repo'
$script = Join-Path $repo 'tools\releases\powershell-commands\validate-prod-build.ps1'
$check = Join-Path $repo '.github\skills\release-teamsjs\check-release.js'
$package = Join-Path $repo 'packages\teams-js\package.json'
$stub = Join-Path $root 'stub'
$oldPath = $env:PATH
$sha = 'aaea9331ec300e4e3b9191f9964b874c2da7bdd8'
$branch = 'refs/heads/release/2.59.0'

function Invoke-Validation([string]$cdn, [hashtable]$over = @{}) {
  $npm = Join-Path $repo 'NPMFeed'
  $arguments = [ordered]@{
    CDNFeed        = $cdn
    NPMFeed        = $npm
    CISourceBranch = $branch
    CISourceCommit = $sha
    QueuedBranch   = $branch
    QueuedCommit   = $sha
  }
  foreach ($key in $over.Keys) { $arguments[$key] = $over[$key] }
  $argv = @()
  foreach ($key in $arguments.Keys) { $argv += "-$key"; $argv += $arguments[$key] }
  & $shell -NoProfile -File $script @argv 2>&1 | Out-String
}

function Assert-Exit(
  [string]$name,
  [scriptblock]$arrange,
  [int]$expected,
  [string]$pattern = '',
  [hashtable]$over = @{},
  [string]$npmPackage = '{"name":"@microsoft/teams-js","version":"2.59.0"}'
) {
  $cdn = Join-Path $repo 'CDNFeed'
  $npm = Join-Path $repo 'NPMFeed'
  Remove-Item $cdn, $npm -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force $cdn, $npm | Out-Null
  Set-Content -Encoding ascii (Join-Path $npm 'package.json') $npmPackage
  & $arrange $cdn
  $output = Invoke-Validation $cdn $over
  if ($LASTEXITCODE -ne $expected) {
    throw "$name expected exit $expected, got $LASTEXITCODE`: $output"
  }
  if ($pattern -and $output -notmatch $pattern) {
    throw "$name output did not match '$pattern': $output"
  }
  Write-Host "Passed: $name"
}

try {
  New-Item -ItemType Directory -Force (Split-Path $script), (Split-Path $check), (Split-Path $package), $stub | Out-Null
  Copy-Item $source $script
  Set-Content -Encoding ascii $check '// stub'
  Set-Content -Encoding ascii $package '{"version":"2.59.0"}'
  "@echo off`r`nexit /b 0" | Set-Content -Encoding ascii (Join-Path $stub 'node.cmd')
  $env:PATH = "$stub;$oldPath"

  Assert-Exit valid {
    param($cdn)
    New-Item -ItemType Directory (Join-Path $cdn '2.59.0'), (Join-Path $cdn '_manifest') | Out-Null
  } 0
  Assert-Exit empty { param($cdn) } 1 'expected exactly one'
  Assert-Exit file-named-version { param($cdn) Set-Content -Encoding ascii (Join-Path $cdn '2.59.0') x } 1
  Assert-Exit hidden-extra-version {
    param($cdn)
    New-Item -ItemType Directory (Join-Path $cdn '2.59.0') | Out-Null
    $extra = New-Item -ItemType Directory (Join-Path $cdn '9.9.9')
    $extra.Attributes = $extra.Attributes -bor [IO.FileAttributes]::Hidden
  } 1
  try {
    Assert-Exit symlink-version {
      param($cdn)
      $target = Join-Path (Split-Path $cdn) 'outside'
      New-Item -ItemType Directory -Force $target | Out-Null
      New-Item -ItemType SymbolicLink -Path (Join-Path $cdn '2.59.0') -Target $target | Out-Null
    } 1
  } catch {
    if ($_.Exception.Message -match 'privilege required') {
      Write-Host 'Skipped: symlink-version (symbolic links require elevation)'
    } else {
      throw
    }
  }

  $version = { param($cdn) New-Item -ItemType Directory (Join-Path $cdn '2.59.0') | Out-Null }
  Assert-Exit npm-package-other-version $version 1 'npm package is @microsoft/teams-js@2.58.0' @{} '{"name":"@microsoft/teams-js","version":"2.58.0"}'
  Assert-Exit ci-build-other-branch $version 1 'queued from' @{ CISourceBranch = 'refs/heads/main' }
  Assert-Exit ci-build-other-commit $version 1 'when this run was queued' @{ CISourceCommit = 'b' * 40 }
  Assert-Exit unexpanded-variable $version 1 'did not receive' @{ QueuedCommit = '$(Build.SourceVersion)' }

  $missing = Join-Path $repo 'missing-CDNFeed'
  $output = Invoke-Validation $missing
  if ($LASTEXITCODE -ne 1 -or $output -notmatch 'artifact was not found') {
    throw "missing-CDNFeed did not fail at the existence check: $output"
  }
  Write-Host 'Passed: missing-CDNFeed'

  Remove-Item $check
  Assert-Exit missing-check { param($cdn) New-Item -ItemType Directory (Join-Path $cdn '2.59.0') | Out-Null } 1 'not on this branch'
} finally {
  $env:PATH = $oldPath
  Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
}
