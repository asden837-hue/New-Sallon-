@echo off
title صالون الأناقة - نظام الحجز
color 0A

echo ============================================
echo    🏪 صالون الأناقة - نظام الحجز
echo ============================================
echo.

:: Check if server is already running
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ Server already running on port 3000
) else (
    echo 🚀 Starting server...
    start "Node Server" cmd /c "node server.js"
    timeout /t 3 /nobreak >nul
)

echo 🚇 Starting ngrok tunnel...
echo.
echo ⏳ Generating public URL...
echo.

:: Run ngrok and capture the URL
ngrok http 3000 --log=stdout > ngrok_output.txt 2>&1

:: Give ngrok time to start
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo    ✅ الموقع أصبح متاحاً من أي مكان!
echo ============================================
echo.
echo 📱 الرابط العام (افتحه في الجوال):
echo.
findstr "url=" ngrok_output.txt 2>nul | findstr "https" 
echo.
echo ⚡ أو افتح: http://localhost:4040 لعرض الرابط
echo.
echo ============================================
echo 📌 اضغط Ctrl+C لإيقاف ngrok
echo ============================================
pause
