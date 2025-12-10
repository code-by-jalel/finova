@echo off
REM Quick GitHub Push Script for FINOVA Project
REM Run this script to push changes to GitHub

echo.
echo ========================================
echo  FINOVA - GitHub Push Script
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [1/6] Initializing Git...
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)

echo.
echo [2/6] Checking Git Status...
git status
echo.

echo [3/6] Adding all files...
git add .
echo ✅ Files staged

echo.
echo [4/6] Creating commit...
set /p commitMsg="Enter commit message (default: 'Update FINOVA project'): "
if "%commitMsg%"=="" (
    set commitMsg=Update FINOVA project
)
git commit -m "%commitMsg%"
echo ✅ Commit created

echo.
echo [5/6] Checking remote...
git remote -v
echo.

echo [6/6] Pushing to GitHub...
git push -u origin main
echo ✅ Push completed!

echo.
echo ========================================
echo Your project is now on GitHub!
echo Visit: https://github.com/yourusername/finova
echo ========================================
echo.
pause
