@echo off
setlocal
set SITE_DIR=C:\Users\cwxjo\Documents\bizuogehao-website
cd /d "%SITE_DIR%"
if not exist logs mkdir logs
node scripts\auto-publish.js >> logs\auto-publish-bat.log 2>&1
endlocal
