$enc   = [System.Text.Encoding]::UTF8
$noBom = New-Object System.Text.UTF8Encoding($false)
$src   = "C:\Users\Administrator\.claude\projects\E--Code-kali-portfolio2\design2_extract\game-idea\project"
$dst   = "E:\Code\kali-portfolio2\index.html"

$styles = [System.IO.File]::ReadAllText("$src\styles.css",       $enc)
$data   = [System.IO.File]::ReadAllText("$src\data.js",          $enc)
$tweaks = [System.IO.File]::ReadAllText("$src\tweaks-panel.jsx", $enc)
$icons  = [System.IO.File]::ReadAllText("$src\icons.jsx",        $enc)
$wm     = [System.IO.File]::ReadAllText("$src\wm.jsx",           $enc)
$boot   = [System.IO.File]::ReadAllText("$src\boot.jsx",         $enc)
$term   = [System.IO.File]::ReadAllText("$src\terminal.jsx",     $enc)
$apps   = [System.IO.File]::ReadAllText("$src\apps.jsx",         $enc)
$main   = [System.IO.File]::ReadAllText("$src\main.jsx",         $enc)

# --- SVG titlebar button fix ---
# Replace Unicode minimize (U+2212 −), maximize (U+25A2 ▢), close (U+00D7 ×)
# with inline SVG so they render correctly in all browsers.
$old1 = '          <button className="tb-btn" onClick={() => wm.minimize(w.id)} title="Minimize">' + [char]0x2212 + '</button>'
$new1 = '          <button className="tb-btn" onClick={() => wm.minimize(w.id)} title="Minimize"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect y="4.5" width="10" height="1.5" rx="0.75" fill="currentColor"/></svg></button>'
$wm = $wm.Replace($old1, $new1)

$old2 = '          <button className="tb-btn" onClick={() => wm.toggleMax(w.id)} title="Maximize">' + [char]0x25A2 + '</button>'
$new2 = '          <button className="tb-btn" onClick={() => wm.toggleMax(w.id)} title="Maximize"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg></button>'
$wm = $wm.Replace($old2, $new2)

$old3 = '          <button className="tb-btn close" onClick={() => wm.close(w.id)} title="Close">' + [char]0x00D7 + '</button>'
$new3 = '          <button className="tb-btn close" onClick={() => wm.close(w.id)} title="Close"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>'
$wm = $wm.Replace($old3, $new3)

# --- Assemble HTML (using + concatenation to avoid PowerShell $ re-expansion) ---
$head = (
    '<!doctype html>' + [System.Environment]::NewLine +
    '<html lang="en">' + [System.Environment]::NewLine +
    '<head>' + [System.Environment]::NewLine +
    '<meta charset="utf-8"/>' + [System.Environment]::NewLine +
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>' + [System.Environment]::NewLine +
    '<title>s0L@milkyway &#x2014; portfolio</title>' + [System.Environment]::NewLine +
    '<link rel="preconnect" href="https://fonts.googleapis.com"/>' + [System.Environment]::NewLine +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>' + [System.Environment]::NewLine +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>' + [System.Environment]::NewLine +
    '<style>' + [System.Environment]::NewLine + $styles + [System.Environment]::NewLine + '</style>' + [System.Environment]::NewLine +
    '</head>' + [System.Environment]::NewLine +
    '<body>' + [System.Environment]::NewLine +
    '<div id="root"></div>' + [System.Environment]::NewLine
)

$libs = (
    '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>' + [System.Environment]::NewLine +
    '<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin></script>' + [System.Environment]::NewLine +
    '<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin></script>' + [System.Environment]::NewLine
)

$nl = [System.Environment]::NewLine
$scripts = (
    '<script>' + $nl + $data + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $tweaks + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $icons  + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $wm     + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $boot   + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $term   + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $apps   + $nl + '</script>' + $nl +
    '<script type="text/babel">' + $nl + $main   + $nl + '</script>' + $nl
)

$tail = '</body>' + $nl + '</html>'

$html = $head + $libs + $scripts + $tail

[System.IO.File]::WriteAllText($dst, $html, $noBom)

$bytes = [System.IO.File]::ReadAllBytes($dst).Length
"Written: $dst  ($bytes bytes)"

# Quick sanity checks
"--- Sanity checks ---"
"U+00B7 dot present:   " + $html.Contains([char]0x00B7)
"U+250C box present:   " + $html.Contains([char]0x250C)
"U+32FF kali present:  " + $html.Contains([char]0x32FF)
"SVG minimize:         " + $html.Contains('<rect y="4.5"')
"SVG maximize:         " + $html.Contains('<rect x="0.75"')
"SVG close:            " + $html.Contains('M1.5 1.5l7 7')
"MilkyWayOS:           " + $html.Contains('MilkyWayOS')
"galaxy wallpaper:     " + $html.Contains('wp-galaxy')
