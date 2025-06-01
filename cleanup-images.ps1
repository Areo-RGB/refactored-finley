# Script to remove unused images from the images directory
# Based on analysis of HTML files

Write-Host "Analyzing image usage in HTML files..." -ForegroundColor Green

# Get all HTML files
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html"

# Extract all image references from HTML files
$usedImages = @()
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Find all images/ references
    $matches = [regex]::Matches($content, "images/[^'`")\s]+")
    foreach ($match in $matches) {
        $imagePath = $match.Value
        $usedImages += $imagePath
        Write-Host "Found: $imagePath in $($file.Name)" -ForegroundColor Yellow
    }
}

# Remove duplicates
$usedImages = $usedImages | Sort-Object | Get-Unique

Write-Host "`nUsed images found:" -ForegroundColor Green
$usedImages | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }

# Get all actual image files in the images directory
Write-Host "`nScanning images directory..." -ForegroundColor Green
$allImageFiles = Get-ChildItem -Path "images" -Recurse -File | Where-Object { 
    $_.Extension -match '\.(jpg|jpeg|png|gif|webp|mp4|svg)$' 
}

# Calculate which images are unused
$unusedFiles = @()
foreach ($imageFile in $allImageFiles) {
    $relativePath = "images/" + $imageFile.FullName.Substring((Get-Location).Path.Length + 8).Replace('\', '/')
    
    $isUsed = $false
    foreach ($usedImage in $usedImages) {
        if ($relativePath -eq $usedImage) {
            $isUsed = $true
            break
        }
    }
    
    if (-not $isUsed) {
        $unusedFiles += $imageFile
    }
}

Write-Host "`nUnused images (will be deleted):" -ForegroundColor Red
$unusedFiles | ForEach-Object { 
    $relativePath = "images/" + $_.FullName.Substring((Get-Location).Path.Length + 8).Replace('\', '/')
    Write-Host "  $relativePath" -ForegroundColor Red 
}

Write-Host "`nTotal files to delete: $($unusedFiles.Count)" -ForegroundColor Yellow

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to delete these unused images? (y/N)"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "`nDeleting unused images..." -ForegroundColor Red
    
    foreach ($file in $unusedFiles) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "Deleted: $($file.FullName)" -ForegroundColor Green
        }
        catch {
            Write-Host "Error deleting $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nCleanup completed! Deleted $($unusedFiles.Count) unused image files." -ForegroundColor Green
    
    # Clean up empty directories
    Write-Host "`nRemoving empty directories..." -ForegroundColor Yellow
    $emptyDirs = Get-ChildItem -Path "images" -Recurse -Directory | Where-Object { 
        (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 
    } | Sort-Object FullName -Descending
    
    foreach ($dir in $emptyDirs) {
        try {
            Remove-Item $dir.FullName -Force
            Write-Host "Removed empty directory: $($dir.FullName)" -ForegroundColor Green
        }
        catch {
            Write-Host "Error removing directory $($dir.FullName): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
}
