@echo off
title Usett - henter Nordic hero (blueprint til hus)
cd /d "%~dp0"

echo.
echo  Laster ned hero-videoen og bildesekvensen...
echo.

if not exist "public\hero" mkdir "public\hero"

curl -L -o "public\hero\nordic-hero.mp4" "https://d2ol7oe51mr4n9.cloudfront.net/user_3DwLQAm5YmY4or5nnp9mnrUCGNv/a3df7722-401e-4052-b055-9217c00cba1c.mp4"
curl -L -o "%TEMP%\nordic-hero-frames.zip" "https://d2ol7oe51mr4n9.cloudfront.net/user_3DwLQAm5YmY4or5nnp9mnrUCGNv/da7a8698-57b6-4e6b-8b73-bac2a0a9ea0c.zip"

echo.
echo  Pakker ut bildesekvensen (dette tar litt tid, 30 MB)...
echo.

powershell -NoProfile -Command "Expand-Archive -LiteralPath \"$env:TEMP\nordic-hero-frames.zip\" -DestinationPath \"public\hero\" -Force"
del "%TEMP%\nordic-hero-frames.zip"

echo.
echo  Ferdig. Du har naa:
echo    public\hero\nordic-hero.mp4      (6 sek, 1920x1080, 24 fps)
echo    public\hero\frames\              (144 bilder, 1600x900)
echo    public\hero\frames-mobile\       (144 bilder, 800x450)
echo    public\hero\poster-first.jpg     (forstebilde)
echo    public\hero\poster-last.jpg      (sistebilde)
echo.
echo  Gaa tilbake til Claude og si "hero er lastet ned".
echo.
pause
