# ----------------------------------------------------------------
# 跑全部独立测试套件
# 用法：./scripts/test.ps1
# ----------------------------------------------------------------

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

Write-Host "==> compile" -ForegroundColor Cyan
npm run compile
if ($LASTEXITCODE -ne 0) { throw "compile failed" }

$suites = @(
    @{ Name = 'device'; Path = 'scripts/test-device-detector.js' },
    @{ Name = 'arm';    Path = 'scripts/test-arm-toolchain.js' },
    @{ Name = 'target'; Path = 'scripts/test-target-inference.js' },
    @{ Name = 'exec';   Path = 'scripts/test-executable-detector.js' }
)

$failed = @()
foreach ($s in $suites) {
    Write-Host "`n==> test:$($s.Name)" -ForegroundColor Cyan
    node $s.Path
    if ($LASTEXITCODE -ne 0) { $failed += $s.Name }
}

Write-Host ''
if ($failed.Count -gt 0) {
    Write-Host "FAILED suites: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "All test suites passed." -ForegroundColor Green
