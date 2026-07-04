@echo off
title VISIONX GitHub Deployer
echo ==================================================
echo         VISIONX GITHUB PAGES DEPLOYMENT
echo ==================================================
echo.
echo This script will help initialize Git and push the 
echo VISIONX project directly to GitHub!
echo.
echo Make sure you have:
echo 1. Installed Git (from https://git-scm.com)
echo 2. Created a public repository named "visionx-portal"
echo    on your GitHub account (do NOT add README, LICENSE or gitignore)
echo.
set /p username="Enter your GitHub Username: "
if "%username%"=="" (
  echo Error: Username cannot be blank.
  pause
  exit /b
)

echo.
echo Initializing Git repository...
git init
git add .
git commit -m "Deploy VISIONX to GitHub Pages"
git branch -M main

echo.
echo Linking repository to origin...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%username%/visionx-portal.git

echo.
echo Pushing code to GitHub...
echo (You may be prompted to log in to GitHub in a popup window)
git push -u origin main --force

echo.
echo ==================================================
echo               DEPLOYMENT INITIATED
echo ==================================================
echo If the push succeeded, perform these steps:
echo 1. Go to https://github.com/%username%/visionx-portal
echo 2. Navigate to Settings -> Pages
echo 3. Set Build/Deployment source to "Deploy from branch"
echo 4. Choose "main" branch and click Save.
echo.
echo Your portal will go live shortly at:
echo https://%username%.github.io/visionx-portal/
echo.
pause
