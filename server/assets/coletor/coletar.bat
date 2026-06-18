@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -File "%~dp0coletar-desktop.ps1" -ApiBase http://SEU-FRONTEND/api
pause
