Get-ChildItem -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '1060001800184546', '879537130426521'
    [IO.File]::WriteAllText($_.FullName, $content, [System.Text.Encoding]::UTF8)
}
