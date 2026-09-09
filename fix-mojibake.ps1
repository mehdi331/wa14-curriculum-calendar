# Fix mojibake in App.jsx
$ErrorActionPreference = 'Stop'
$p = 'd:\TFB\2026\Winter Academy\Calendar\wa14-curriculum-calendar\src\App.jsx'
$s = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)

# Fix mojibake sequences
$fixes = @(
    @{from='â€\"'; to='—'}   # em dash (U+2014)
    @{from='â€“'; to='–'}   # en dash (U+2013)
    @{from='â€¹'; to='‹'}   # single left angle quote
    @{from='â€º'; to='›'}   # single right angle quote
    @{from='â€¦'; to='…'}   # ellipsis
    @{from:'â„¢'; to='™'}   # trademark
    @{from:'â€œ'; to='“'}   # left double quote
    @{from:'â€'; to='”'}     # right double quote
    @{from:'â€™'; to='’'}   # right single quote
    @{from:'Â·'; to='·'}    # middle dot
    @{from:'Â '; to=''}      # non-breaking space artifact
)

$count = 0
foreach ($fix in $fixes) {
    $c = [regex]::Matches($s, [regex]::Escape($fix.from)).Count
    if ($c -gt 0) {
        $s = $s -replace [regex]::Escape($fix.from), $fix.to
        $count += $c
        Write-Host "Fixed '$($fix.from)' -> '$($fix.to)': $c times"
    }
}

[System.IO.File]::WriteAllText($p, $s, [System.Text.Encoding]::UTF8)
Write-Host "Total replacements: $count"
$remaining = [regex]::Matches($s, '€').Count
Write-Host "Remaining €: $remaining"
