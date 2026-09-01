$pixel = @"
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
fbq('init', '1060001800184546');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1060001800184546&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
</head>
"@

Get-ChildItem -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch 'Meta Pixel Code') {
        $content = $content -replace '(?i)</head>', $pixel
        [IO.File]::WriteAllText($_.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}
