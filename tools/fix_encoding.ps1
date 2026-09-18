# Fix encoding: re-save all HTML files as UTF-8 WITHOUT BOM
$utf8NoBOM = [System.Text.UTF8Encoding]::new($false)

Get-ChildItem -Filter "*.html" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" } | ForEach-Object {
    $path = $_.FullName
    try {
        # Read raw bytes to detect and strip BOM
        $bytes = [IO.File]::ReadAllBytes($path)
        
        # Check for UTF-8 BOM (EF BB BF)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $content = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
            [IO.File]::WriteAllText($path, $content, $utf8NoBOM)
            Write-Host "Fixed BOM: $($_.Name)"
        } else {
            # Re-read as UTF-8 and re-save without BOM to normalize
            $content = [IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
            [IO.File]::WriteAllText($path, $content, $utf8NoBOM)
            Write-Host "Normalized: $($_.Name)"
        }
    } catch {
        Write-Host "Error with $($_.Name): $_"
    }
}

Write-Host ""
Write-Host "All HTML files re-saved as UTF-8 without BOM!"
