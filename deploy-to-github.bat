@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===============================================
echo   FOSHAN GarmentMaster - GitHub Pages Deploy
echo ===============================================
echo.

cd /d "%~dp0"

:: Check if it's already a git repo
if exist ".git" (
    echo [信息] 已存在 Git 仓库,继续推送...
) else (
    echo [1/6] 初始化 Git 仓库...
    git init
    git checkout -b main 2>nul || git branch -M main
)

:: Set Git identity (try local first, then ask)
for /f "delims=" %%i in ('git config user.name') do set GIT_NAME=%%i
for /f "delims=" %%i in ('git config user.email') do set GIT_EMAIL=%%i

if "%GIT_NAME%"=="" (
    set /p GIT_NAME="请输入 Git 用户名 (例: Zhang San): "
    git config user.name "%GIT_NAME%"
)
if "%GIT_EMAIL%"=="" (
    set /p GIT_EMAIL="请输入 Git 邮箱 (例: you@example.com): "
    git config user.email "%GIT_EMAIL%"
)

:: Set remote
set REMOTE_URL=https://github.com/Gg-002/GarmentMaster.git
git remote remove origin 2>nul
git remote add origin %REMOTE_URL%

echo [2/6] 配置 remote: %REMOTE_URL%

:: Verify .gitignore exists
if not exist ".gitignore" (
    echo [3/6] 创建 .gitignore...
    (
        echo # 临时照片 ^(不入库^)
        echo photos/
        echo.
        echo # 系统文件
        echo .DS_Store
        echo Thumbs.db
        echo desktop.ini
        echo.
        echo # 编辑器
        echo .vscode/
        echo .idea/
        echo *.swp
        echo.
        echo # 日志
        echo *.log
        echo.
        echo # 环境
        echo .env
        echo .env.local
    ) > .gitignore
) else (
    echo [3/6] .gitignore 已存在
)

:: Stage files
echo [4/6] 添加文件到暂存区...
git add -A

:: Show status
echo.
echo === 当前变更文件 ===
git status --short
echo.

:: Commit
echo [5/6] 创建提交...
git commit -m "Update: 12 factories all in Foshan 5 clusters, 200+ count, remove region filter"

:: Push
echo [6/6] 推送到 GitHub...
git push -u origin main --force

echo.
echo ===============================================
echo   部署完成！
echo ===============================================
echo.
echo 接下来:
echo   1. 访问 GitHub 仓库 -^> Actions 标签
echo   2. 等待部署完成 ^(通常 1-2 分钟^)
echo   3. 访问 https://Gg-002.github.io/GarmentMaster/website/
echo.
echo 注意: GitHub 用户名区分大小写!
echo   正确: Gg-002 (首字母大写)
echo ===============================================
echo.
pause
