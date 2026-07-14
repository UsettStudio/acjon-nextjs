@echo off
title Usett - henter nye 3D-klipp (stort hus, mer groent)
cd /d "%~dp0"
if not exist _klipp4 mkdir _klipp4

echo.
echo  Laster ned de to nye 3D-klippene (stort hus, frodig groent)...
echo.

curl -L -o "_klipp4\bygg.mp4" "https://d8j0ntlcm91z4.cloudfront.net/user_3DwLQAm5YmY4or5nnp9mnrUCGNv/hf_20260709_081219_2cef79ff-31e7-4457-8516-bbd47bca1142.mp4"
curl -L -o "_klipp4\orbit.mp4" "https://d8j0ntlcm91z4.cloudfront.net/user_3DwLQAm5YmY4or5nnp9mnrUCGNv/hf_20260709_081221_7bb91c7d-3142-46af-8352-55dab6c168f7.mp4"

echo.
echo  Ferdig! Filene ligger i mappen _klipp4.
echo  Gaa tilbake til Claude og si "klippene er lastet ned".
echo.
pause
