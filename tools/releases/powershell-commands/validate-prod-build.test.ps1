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

function Assert-Exit([string]$name, [scriptblock]$arrange, [int]$expected, [string]$pattern = '') {
  $cdn = Join-Path $repo 'CDNFeed'
  Remove-Item $cdn -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force $cdn | Out-Null
  & $arrange $cdn
  $output = & $shell -NoProfile -File $script -CDNFeed $cdn 2>&1 | Out-String
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

  Assert-Exit valid { param($cdn) New-Item -ItemType Directory (Join-Path $cdn '2.59.0') | Out-Null } 0
  Assert-Exit empty { param($cdn) } 1 'expected exactly one'
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
} finally {
  $env:PATH = $oldPath
  Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
}
