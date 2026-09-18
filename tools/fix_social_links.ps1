$FB_URL = 'https://www.facebook.com/profile.php?id=61565914903592'
$WA_URL = 'https://wa.me/201017344345'

# Fix privacy.html - replace href="#" for FB and Instagram icons in top-bar
$file = 'pages\privacy.html'
$content = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
# Replace first href="#" (Facebook icon) in social-icons div
$content = $content -replace '(<div class="social-icons">\s*)<a href="#">(<svg[^>]+><path d="M18 2h)', "`$1<a href=""$FB_URL"" target=""_blank"" rel=""noopener"">``$2"
[IO.File]::WriteAllText($file, $content, [Text.Encoding]::UTF8)
Write-Host "privacy.html done"

# Fix terms.html same way
$file = 'pages\terms.html'
$content = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
$content = $content -replace '(<div class="social-icons">\s*)<a href="#">(<svg[^>]+><path d="M18 2h)', "`$1<a href=""$FB_URL"" target=""_blank"" rel=""noopener"">``$2"
[IO.File]::WriteAllText($file, $content, [Text.Encoding]::UTF8)
Write-Host "terms.html done"

Write-Host "All social links fixed!"
