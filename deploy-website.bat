@echo off
rem =============================================================
rem FOSHAN GarmentMaster - 一键部署启动器 (v2.0)
rem =============================================================

rem 强制 UTF-8 代码页
chcp 65001 >nul 2>&1

rem 切换到脚本所在目录
cd /d "%~dp0"

rem 启动新 PowerShell 窗口并保留
rem /WAIT 让 .bat 窗口在 PowerShell 期间保留
rem -NoExit 保持 PowerShell 窗口不退出
start "FOSHAN GarmentMaster Deploy" /WAIT powershell.exe -NoExit -ExecutionPolicy Bypass -WindowStyle Normal -File "%~dp0deploy-website.ps1"

echo.
echo ===========================================
echo  PowerShell 部署窗口已关闭
echo ===========================================
echo.
echo  部署完成或失败,请查看上方窗口的输出。
echo.
pause
