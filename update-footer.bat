@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Footer Bar Synchronization Script
echo ========================================
echo.

:: Check if index.html exists
if not exist "index.html" (
    echo ERROR: index.html not found in current directory!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Extract footer bar from index.html
echo [1/4] Extracting footer bar structure from index.html...

:: Create temporary file to store footer content
set "temp_footer=temp_footer.txt"
set "found_footer=false"
set "footer_content="

:: Read index.html line by line to extract footer bar
for /f "usebackq delims=" %%a in ("index.html") do (
    set "line=%%a"

    :: Check if we found the footer bar start
    if "!line!" == "    <div id=""footer-bar"" class=""footer-bar-1"">" (
        set "found_footer=true"
        set "footer_content=!footer_content!%%a"
        echo %%a >> "!temp_footer!"
    ) else if "!found_footer!" == "true" (
        echo %%a >> "!temp_footer!"
        set "footer_content=!footer_content!%%a"

        :: Check if we reached the end of footer bar
        if "!line!" == "    </div>" (
            set "found_footer=false"
            goto :footer_extracted
        )
    )
)

:footer_extracted
if not exist "!temp_footer!" (
    echo ERROR: Could not extract footer bar from index.html
    pause
    exit /b 1
)

echo Footer bar extracted successfully.
echo.

:: Function to update footer in a specific file
call :update_file_footer "page-statistiken.html" "Statistiken"
call :update_file_footer "page-profile-finley.html" "Finley"

:: Clean up
del "!temp_footer!" 2>nul

echo.
echo ========================================
echo Footer synchronization completed!
echo ========================================
echo.
echo All pages now have the same footer structure as index.html
echo with their respective active navigation states preserved.
echo.
pause
exit /b 0

:: Function to update footer in a specific file
:update_file_footer
set "target_file=%~1"
set "active_page=%~2"

if not exist "!target_file!" (
    echo WARNING: !target_file! not found, skipping...
    goto :eof
)

echo [2/4] Updating footer in !target_file!...

:: Create backup
copy "!target_file!" "!target_file!.backup" >nul 2>&1

:: Create temporary output file
set "temp_output=temp_output.txt"
set "in_footer=false"
set "footer_updated=false"

:: Process the target file
for /f "usebackq delims=" %%a in ("!target_file!") do (
    set "line=%%a"

    :: Check if we found the footer bar start
    if "!line!" == "    <div id=""footer-bar"" class=""footer-bar-1"">" (
        set "in_footer=true"

        :: Write the new footer content with correct active state
        for /f "usebackq delims=" %%b in ("!temp_footer!") do (
            set "footer_line=%%b"

            :: Remove any existing active-nav class
            set "footer_line=!footer_line: class=""active-nav""=!"
            set "footer_line=!footer_line:class=""active-nav"" =!"

            :: Add active-nav class to the correct page
            if "!active_page!" == "Statistiken" (
                set "footer_line=!footer_line:page-statistiken.html"">page-statistiken.html"" class=""active-nav"">"
            )
            if "!active_page!" == "Finley" (
                set "footer_line=!footer_line:page-profile-finley.html"">page-profile-finley.html"" class=""active-nav"">"
            )

            echo !footer_line! >> "!temp_output!"
        )
        set "footer_updated=true"
    ) else if "!in_footer!" == "true" (
        :: Skip original footer content until we reach the closing div
        if "!line!" == "    </div>" (
            set "in_footer=false"
        )
        :: Don't write anything while in_footer is true (we already wrote the new footer)
    ) else (
        :: Write non-footer lines as-is
        echo !line! >> "!temp_output!"
    )
)

:: Replace original file with updated content
if exist "!temp_output!" (
    move "!temp_output!" "!target_file!" >nul
    echo Successfully updated !target_file!
) else (
    echo ERROR: Failed to update !target_file!
)

:: Clean up temp file
del "!temp_output!" 2>nul

goto :eof
