@echo off
title Usett - starter nettsiden
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo  Node.js er ikke installert paa denne maskinen.
    echo  1. Gaa til https://nodejs.org
    echo  2. Last ned og installer "LTS"-versjonen
    echo  3. Dobbeltklikk paa denne filen igjen
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo.
    echo  Foerste gangs oppsett - installerer det som trengs.
    echo  Dette tar noen minutter, kun noedvendig een gang...
    echo.
    call npm install
)

echo.
echo  Starter nettsiden... Nettleseren aapnes om ca 10 sekunder.
echo  La dette vinduet staa aapent mens du ser paa siden.
echo  Lukk vinduet for aa stoppe nettsiden.
echo.

start "" /b cmd /c "timeout /t 10 >nul & start http://localhost:3000"
call npm run dev
pause
