$utf8NoBOM = [System.Text.UTF8Encoding]::new($false)

$PIXEL_CODE = @"

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '879537130426521');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=879537130426521&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
</head>
"@

$FB_URL  = 'https://www.facebook.com/profile.php?id=61565914903592'
$WA_URL  = 'https://wa.me/201017344345'
$PHONE   = '01017344345'
$INSTAPAY= '01127116395'

# ─── Helper: read + write UTF-8 no BOM ───────────────────────────────
function Update-File($path, [scriptblock]$transform) {
    $bytes   = [IO.File]::ReadAllBytes($path)
    # Strip BOM if present
    if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
    } else {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    }
    $result = & $transform $text
    [IO.File]::WriteAllText($path, $result, $utf8NoBOM)
    Write-Host "Updated: $path"
}

# ─── 1. All HTML: inject Meta Pixel before </head> ────────────────────
Get-ChildItem -Filter "*.html" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.bak" } | ForEach-Object {
    Update-File $_.FullName {
        param($text)
        if ($text -notmatch 'fbq\(') {
            $text -replace '(?i)</head>', $PIXEL_CODE
        } else { $text }
    }
}

# ─── 2. index.html: fix social links in footer ───────────────────────
Update-File 'index.html' {
    param($text)
    # Facebook
    $text = $text -replace '(<a) (href="#" aria-label=".{0,6}?[Ff][Aa][Cc][Ee][^"]*?" class="social-btn">)', "`$1 href=""$FB_URL"" target=""_blank"" rel=""noopener"" aria-label=""فيسبوك"" class=""social-btn"">"
    # WhatsApp
    $text = $text -replace '(<a) (href="#" aria-label=".{0,6}?[Ww][Aa][^"]*?" class="social-btn">)', "`$1 href=""$WA_URL"" target=""_blank"" rel=""noopener"" aria-label=""واتساب"" class=""social-btn"">"
    $text
}

# ─── 3. contact.html: fix phone numbers ──────────────────────────────
Update-File 'pages\contact.html' {
    param($text)
    $text = $text -replace 'href="tel:\+201000000000"', "href=""tel:+$PHONE"""
    $text = $text -replace '201000000000', $PHONE
    $text = $text -replace '01X XXXX XXXX', $PHONE
    $text -replace '<!-- TODO: تحديث بيانات التواصل الحقيقية -->', ''
}

# ─── 4. privacy.html: fix social links in top-bar ────────────────────
Update-File 'pages\privacy.html' {
    param($text)
    $text = $text -replace 'href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h', "href=""$FB_URL"" target=""_blank"" rel=""noopener""><svg width=""16"" height=""16"" viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""2""><path d=""M18 2h"
    $text
}

# ─── 5. terms.html: fix social links in top-bar ──────────────────────
Update-File 'pages\terms.html' {
    param($text)
    $text = $text -replace 'href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h', "href=""$FB_URL"" target=""_blank"" rel=""noopener""><svg width=""16"" height=""16"" viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""2""><path d=""M18 2h"
    $text
}

# ─── 6. admin.html: fix WhatsApp number in settings ──────────────────
Update-File 'pages\admin.html' {
    param($text)
    $text -replace 'value="201000000000"', "value=""$PHONE"""
}

# ─── 7. checkout.js: fix InstaPay & Vodafone numbers ─────────────────
Update-File 'pages\checkout.js' {
    param($text)
    $text = $text -replace 'farah@instapay', $INSTAPAY
    $text -replace '01000000000', $PHONE
}

Write-Host ""
Write-Host "All done! Files saved as UTF-8 without BOM."
