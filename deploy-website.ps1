# =============================================================
# FOSHAN GarmentMaster - 一键部署脚本
# =============================================================
# 用途: 自动 commit + push 更改到 GitHub
# 安全: PAT 存储在 Windows 凭据管理器,不会在终端/聊天中明文显示
# 用法: 双击 deploy-website.bat 运行
# =============================================================

# 强制 UTF-8 输出 (避免中文乱码)
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$ErrorActionPreference = "Stop"

# ============================================================
# 配置
# ============================================================
$RemoteName   = "origin"
$BranchName   = "main"
$RemoteUrl    = "https://github.com/Gg-002/GarmentMaster"
$CredKeyTarget = "Gg-002@github.com"

# ============================================================
# 颜色输出 (UTF-8 安全的方框字符)
# ============================================================
function Write-Banner {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  FOSHAN GarmentMaster - GitHub Pages Deploy" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($n, $msg) {
    Write-Host ("[{0}] " -f $n) -ForegroundColor Yellow -NoNewline
    Write-Host $msg
}

function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "  ->  $msg" -ForegroundColor Gray }

# ============================================================
# 主流程
# ============================================================
Write-Banner

# 1. 切换到脚本所在目录
Write-Step "1" "切换到项目目录..."
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ScriptDir
Write-Ok "当前目录: $ScriptDir"

# 2. 检查 git
Write-Step "2" "检查 Git 环境..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "未找到 git,请先安装 Git for Windows"
    Pop-Location
    Read-Host "按回车退出"
    exit 1
}
Write-Ok "Git: $(git --version)"

# 3. 设置凭据管理器
Write-Step "3" "配置凭据管理器..."
git config credential.helper manager 2>&1 | Out-Null
Write-Ok "凭据管理器已启用 (token 将存储在 Windows 凭据管理器)"

# 4. 设置/读取身份
Write-Step "4" "检查 Git 身份..."
$existingName  = git config user.name
$existingEmail = git config user.email
if ([string]::IsNullOrEmpty($existingName)) {
    git config user.name "FOSHAN GarmentMaster Dev"
    Write-Info "已设置 user.name = FOSHAN GarmentMaster Dev"
} else {
    Write-Info "user.name = $existingName"
}
if ([string]::IsNullOrEmpty($existingEmail)) {
    git config user.email "dev@foshan-garmentmaster.com"
    Write-Info "已设置 user.email = dev@foshan-garmentmaster.com"
} else {
    Write-Info "user.email = $existingEmail"
}

# 5. 验证远程
Write-Step "5" "验证远程仓库..."
$currentRemote = git remote get-url $RemoteName 2>&1
if ($currentRemote -notmatch "Gg-002/GarmentMaster") {
    git remote remove $RemoteName 2>&1 | Out-Null
    git remote add $RemoteName $RemoteUrl
    Write-Info "已设置 remote: $RemoteUrl"
} else {
    Write-Info "remote: $currentRemote"
}

# 6. 拉取最新
Write-Step "6" "从远程拉取最新 (rebase)..."
try {
    git pull --rebase $RemoteName $BranchName 2>&1 | Out-Null
    Write-Ok "拉取完成"
} catch {
    Write-Info "首次拉取或无需拉取 (跳过)"
}

# 7. 检查变更
Write-Step "7" "检查文件变更..."
$statusOutput = git status --short
if ([string]::IsNullOrEmpty($statusOutput)) {
    Write-Info "工作区干净,无变更"
    Pop-Location
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host "  没有可推送的变更" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Yellow
    Read-Host "按回车退出"
    exit 0
}

Write-Info "变更文件:"
$statusOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

# 8. 暂存 + 提交
Write-Step "8" "暂存 + 创建提交..."
git add -A

$added    = (git diff --cached --name-only --diff-filter=A | Measure-Object).Count
$modified = (git diff --cached --name-only --diff-filter=M | Measure-Object).Count
$deleted  = (git diff --cached --name-only --diff-filter=D | Measure-Object).Count
$parts = @()
if ($added    -gt 0) { $parts += "$added added" }
if ($modified -gt 0) { $parts += "$modified modified" }
if ($deleted  -gt 0) { $parts += "$deleted deleted" }
$msg = "Update website content"
if ($parts.Count -gt 0) {
    $msg += " ($($parts -join ', '))"
}
$msg += "`n`nCo-Authored-By: Claude <noreply@anthropic.com>"

Write-Info "Commit message: $msg"
git commit -m "$msg" 2>&1 | Out-Null
Write-Ok "提交成功"

# 9. 推送
Write-Step "9" "推送到 GitHub (PAT 存储在 Windows 凭据管理器)..."

try {
    $pushOutput = git push $RemoteName $BranchName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "  部署成功！" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  网站地址: $RemoteUrl" -ForegroundColor Cyan
        Write-Host "  等待 1-2 分钟后访问" -ForegroundColor Gray
    } else {
        throw $pushOutput
    }
} catch {
    Write-Host ""
    Write-Err "推送失败,请检查:"
    Write-Host "    1. Token 是否有效 (https://github.com/settings/tokens)" -ForegroundColor Gray
    Write-Host "    2. Token 是否勾选了 'workflow' 权限" -ForegroundColor Gray
    Write-Host "    3. 网络是否可访问 github.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  重置 token: cmdkey /delete:$CredKeyTarget" -ForegroundColor Yellow
}

Pop-Location
Write-Host ""
Read-Host "按回车退出"
