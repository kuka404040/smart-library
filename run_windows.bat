@echo off
chcp 65001 > nul
echo ========================================================
echo   Smart Library — Цифрлық кітапхана (College Edition)
echo ========================================================
echo.

echo 1. Тексеру: Node.js орнатылған ба?
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ҚАТЕ] Node.js табылмады. nodejs.org сайтынан орнатыңыз.
    pause
    exit /b
)

echo 2. Тәуелділіктерді орнату...
call npm install

echo.
echo 3. Кітапхана серверін іске қосу (Port 3000)...
echo    Кітапханашы кіруі: http://localhost:3000/admin
echo    Құпиясөз: admin123
echo.

call npm run dev
pause
