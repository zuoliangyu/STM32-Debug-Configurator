# ----------------------------------------------------------------
# 干净构建 + 打 .vsix
# 用法：./scripts/package.ps1 [-SkipTests]
#   -SkipTests   跳过测试，直接打包（默认会先跑一遍测试）
# ----------------------------------------------------------------

param(
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

if (-not $SkipTests) {
    Write-Host "==> running tests first" -ForegroundColor Cyan
    & "$PSScriptRoot/test.ps1"
    if ($LASTEXITCODE -ne 0) { throw "tests failed; refusing to package" }
}

Write-Host "`n==> clean out/" -ForegroundColor Cyan
if (Test-Path "$repoRoot/out") {
    Remove-Item "$repoRoot/out" -Recurse -Force
}

Write-Host "`n==> compile" -ForegroundColor Cyan
npm run compile
if ($LASTEXITCODE -ne 0) { throw "compile failed" }

# .vscodeignore 已经覆盖大部分排除项，这里再清一遍 out/ 里的测试产物，避免源码在 watch
# 模式下偶尔留下脏文件被打进 vsix
Write-Host "`n==> strip test artifacts from out/" -ForegroundColor Cyan
Get-ChildItem "$repoRoot/out" -Recurse -File -Include *.test.js, *.test.js.map, *.bak |
    ForEach-Object {
        Write-Host "   - $($_.FullName.Substring($repoRoot.Length + 1))"
        Remove-Item $_.FullName -Force
    }
foreach ($d in @('test', 'demo')) {
    $p = Join-Path $repoRoot "out/$d"
    if (Test-Path $p) {
        Write-Host "   - out/$d/"
        Remove-Item $p -Recurse -Force
    }
}

Write-Host "`n==> package vsix" -ForegroundColor Cyan
npx @vscode/vsce package
if ($LASTEXITCODE -ne 0) { throw "vsce package failed" }

$vsix = Get-ChildItem $repoRoot -Filter '*.vsix' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
Write-Host "`nProduced: $($vsix.Name) ($([math]::Round($vsix.Length / 1KB, 1)) KB)" -ForegroundColor Green
Write-Host "Sideload locally with: code --install-extension $($vsix.Name)"
