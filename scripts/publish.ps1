# ----------------------------------------------------------------
# 发布到 VS Code Marketplace
# 前置：需要 publisher PAT (用 `npx @vscode/vsce login zuolan` 登过)
# 用法：
#   ./scripts/publish.ps1                  # 用 package.json 当前版本号发布
#   ./scripts/publish.ps1 -Pat <token>     # 临时传 PAT 不污染本地登录
#   ./scripts/publish.ps1 -SkipTests       # 跳过测试（不推荐）
# ----------------------------------------------------------------

param(
    [string]$Pat,
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

# 1. 先打包（顺带跑测试）
& "$PSScriptRoot/package.ps1" @(if ($SkipTests) { '-SkipTests' })
if ($LASTEXITCODE -ne 0) { throw "package step failed" }

# 2. 显示将要发布的版本号
$pkg = Get-Content "$repoRoot/package.json" | ConvertFrom-Json
$version = $pkg.version
$publisher = $pkg.publisher
$name = $pkg.name
Write-Host "`n==> about to publish $publisher.$name@$version" -ForegroundColor Yellow

$confirm = Read-Host "继续发布到 Marketplace? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# 3. 发布
Write-Host "`n==> vsce publish" -ForegroundColor Cyan
if ($Pat) {
    npx @vscode/vsce publish --pat $Pat
} else {
    npx @vscode/vsce publish
}
if ($LASTEXITCODE -ne 0) { throw "vsce publish failed" }

Write-Host "`nPublished $publisher.$name@$version successfully." -ForegroundColor Green
Write-Host "Marketplace: https://marketplace.visualstudio.com/items?itemName=$publisher.$name"
