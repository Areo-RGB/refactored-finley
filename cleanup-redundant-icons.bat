@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Icon Cleanup Script
echo ========================================
echo.
echo This script will remove redundant icon files that are not used by the web application.
echo.

:: Create backup directory with timestamp
set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=!timestamp: =0!"
set "backup_dir=icon_backup_!timestamp!"

echo Creating backup directory: !backup_dir!
mkdir "!backup_dir!" 2>nul

:: Backup files before deletion
echo.
echo [1/3] Creating backup of files to be deleted...

:: Backup entire ici directory
if exist "ici" (
    echo Backing up ici directory...
    xcopy "ici" "!backup_dir!\ici\" /E /I /Q >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ ici directory backed up successfully
    ) else (
        echo ✗ Failed to backup ici directory
    )
)

:: Backup redundant files from app/icons
echo Backing up redundant files from app/icons...
set "redundant_files=android-chrome-192x192.png android-chrome-512x512.png apple-touch-icon.png favicon-16x16.png favicon-32x32.png favicon.ico site.webmanifest quovadis-logo.webp"

mkdir "!backup_dir!\app\icons" 2>nul

for %%f in (!redundant_files!) do (
    if exist "app\icons\%%f" (
        copy "app\icons\%%f" "!backup_dir!\app\icons\" >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✓ Backed up app/icons/%%f
        ) else (
            echo ✗ Failed to backup app/icons/%%f
        )
    )
)

echo.
echo [2/3] Deleting redundant files...

:: Delete entire ici directory
if exist "ici" (
    echo Deleting ici directory...
    rmdir /s /q "ici" 2>nul
    if not exist "ici" (
        echo ✓ ici directory deleted successfully
    ) else (
        echo ✗ Failed to delete ici directory
    )
) else (
    echo ℹ ici directory not found
)

:: Delete redundant files from app/icons
echo Deleting redundant files from app/icons...

for %%f in (!redundant_files!) do (
    if exist "app\icons\%%f" (
        del "app\icons\%%f" 2>nul
        if not exist "app\icons\%%f" (
            echo ✓ Deleted app/icons/%%f
        ) else (
            echo ✗ Failed to delete app/icons/%%f
        )
    ) else (
        echo ℹ app/icons/%%f not found
    )
)

echo.
echo [3/3] Cleanup summary...
echo.

:: Calculate space saved
echo Files and directories removed:
echo.
echo COMPLETELY REMOVED:
echo • ici/ directory (iOS/Android app assets - 40+ files)
echo   - Assets.xcassets/AppIcon.appiconset/ (40+ iOS icon files)
echo   - android/mipmap-*/ (5 Android icon files)
echo   - appstore.png, playstore.png
echo.
echo FROM app/icons/:
for %%f in (!redundant_files!) do (
    if not exist "app\icons\%%f" (
        echo • %%f
    )
)

echo.
echo KEPT (actively used by web app):
echo • app/icons/icon-72x72.png
echo • app/icons/icon-96x96.png
echo • app/icons/icon-128x128.png
echo • app/icons/icon-144x144.png
echo • app/icons/icon-152x152.png
echo • app/icons/icon-192x192.png
echo • app/icons/icon-384x384.png
echo • app/icons/icon-512x512.png

echo.
echo ========================================
echo Cleanup completed successfully!
echo ========================================
echo.
echo Backup created in: !backup_dir!
echo.
echo If everything works correctly, you can delete the backup directory.
echo To restore files if needed, copy them back from the backup directory.
echo.

:: Self-delete option
echo.
set /p "delete_script=Delete this cleanup script now? (y/n): "
if /i "!delete_script!"=="y" (
    echo.
    echo Deleting cleanup script...
    (goto) 2>nul & del "%~f0"
) else (
    echo.
    echo Cleanup script kept. You can delete it manually later.
)

echo.
pause
