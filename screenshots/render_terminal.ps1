<#
    render_terminal.ps1
    Ubah transkrip terminal (teks) menjadi PNG bergaya terminal.
    PowerShell 5.1 + System.Drawing (GDI+). Tanpa dependensi eksternal.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$InputFile,
    [Parameter(Mandatory = $true)][string]$OutputDir,
    [Parameter(Mandatory = $true)][string]$BaseName,
    [int]$Width = 1500,
    [float]$FontSize = 16,
    [int]$MaxHeight = 2200
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $InputFile -PathType Leaf)) {
    [Console]::Error.WriteLine("ERROR: berkas input tidak ditemukan: $InputFile")
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# --- tema & geometri -------------------------------------------------------
$Padding     = 16
$LineHeight  = [float]($FontSize + 6)
$UsableWidth = [float]($Width - 2 * $Padding)

$BgColor     = [System.Drawing.ColorTranslator]::FromHtml('#1E1E1E')
$FgColor     = [System.Drawing.ColorTranslator]::FromHtml('#D4D4D4')
$PromptColor = [System.Drawing.ColorTranslator]::FromHtml('#4EC9B0')
$HttpColor   = [System.Drawing.ColorTranslator]::FromHtml('#DCDCAA')
$HeaderColor = [System.Drawing.ColorTranslator]::FromHtml('#808080')

$Font = New-Object System.Drawing.Font('Consolas', $FontSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$Format = New-Object System.Drawing.StringFormat
$Format.FormatFlags = [System.Drawing.StringFormatFlags]::NoClip

# Brush di-cache: satu per warna, dipakai berulang untuk ribuan baris.
$BrushFg     = New-Object System.Drawing.SolidBrush($FgColor)
$BrushPrompt = New-Object System.Drawing.SolidBrush($PromptColor)
$BrushHttp   = New-Object System.Drawing.SolidBrush($HttpColor)
$BrushHeader = New-Object System.Drawing.SolidBrush($HeaderColor)

$Brushes = @{}
$Brushes[$FgColor.ToArgb()]     = $BrushFg
$Brushes[$PromptColor.ToArgb()] = $BrushPrompt
$Brushes[$HttpColor.ToArgb()]   = $BrushHttp
$Brushes[$HeaderColor.ToArgb()] = $BrushHeader

function Get-Brush([System.Drawing.Color]$Color) {
    $key = $Color.ToArgb()
    if (-not $Brushes.ContainsKey($key)) {
        $Brushes[$key] = New-Object System.Drawing.SolidBrush($Color)
    }
    return $Brushes[$key]
}

# --- pengukuran teks -------------------------------------------------------
$MeasureBmp = New-Object System.Drawing.Bitmap(1, 1)
$MeasureG   = [System.Drawing.Graphics]::FromImage($MeasureBmp)
$MeasureG.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

function Get-TextWidth([string]$Text) {
    if ([string]::IsNullOrEmpty($Text)) { return [float]0 }
    return $MeasureG.MeasureString($Text, $Font, 1000000, $Format).Width
}

# Pecah satu baris menjadi beberapa segmen agar muat dalam $UsableWidth.
# Segmen lanjutan diberi indentasi 2 spasi. Hard-wrap (batas karakter), seperti terminal.
function Get-WrappedSegments([string]$Text) {
    $segments = New-Object System.Collections.Generic.List[string]
    $prefix = ''
    $current = $Text
    while ($true) {
        if ($current.Length -eq 0) {
            $segments.Add($prefix)
            break
        }
        if ((Get-TextWidth ($prefix + $current)) -le $UsableWidth) {
            $segments.Add($prefix + $current)
            break
        }
        $avail = $UsableWidth - (Get-TextWidth $prefix)
        $lo = 1
        $hi = $current.Length
        while ($lo -lt $hi) {
            $mid = [int](($lo + $hi + 1) / 2)
            if ((Get-TextWidth $current.Substring(0, $mid)) -le $avail) { $lo = $mid } else { $hi = $mid - 1 }
        }
        $take = $lo
        if ($take -lt 1) { $take = 1 }
        if ($take -gt $current.Length) { $take = $current.Length }
        $segments.Add($prefix + $current.Substring(0, $take))
        $current = $current.Substring($take)
        $prefix = '  '
    }
    return $segments
}

# --- baca + wrap -----------------------------------------------------------
$RawLines = [System.IO.File]::ReadAllLines($InputFile, [System.Text.Encoding]::UTF8)

$Wrapped = New-Object System.Collections.Generic.List[object]
$SourceLines = 0
foreach ($line in $RawLines) {
    $SourceLines++
    if ($line.StartsWith('$ ')) {
        $color = $PromptColor
    } elseif ($line -match 'HTTP/') {
        $color = $HttpColor
    } else {
        $color = $FgColor
    }
    foreach ($seg in (Get-WrappedSegments $line)) {
        $Wrapped.Add([pscustomobject]@{ Text = $seg; Color = $color; Src = $SourceLines })
    }
}

$TotalWrapped = $Wrapped.Count

# --- hitung pemecahan bagian ----------------------------------------------
$ContentHeight = 2 * $Padding + $TotalWrapped * $LineHeight
if ($ContentHeight -le $MaxHeight) {
    $PartCount  = 1
    $WithHeader = $false
    $Cap        = $TotalWrapped
} else {
    $WithHeader = $true
    $Cap = [int][math]::Floor(($MaxHeight - 2 * $Padding - $LineHeight) / $LineHeight)
    if ($Cap -lt 1) { $Cap = 1 }
    $PartCount = [int][math]::Ceiling($TotalWrapped / $Cap)
    if ($PartCount -lt 1) { $PartCount = 1 }
}

# --- bersihkan keluaran lama (idempoten) -----------------------------------
Get-ChildItem -LiteralPath $OutputDir -Filter "$BaseName.png"      -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $OutputDir -Filter "${BaseName}_*.png"  -File -ErrorAction SilentlyContinue | Remove-Item -Force

# --- render ----------------------------------------------------------------
$Index = 0
$Results = New-Object System.Collections.Generic.List[object]
for ($p = 1; $p -le $PartCount; $p++) {
    if ($WithHeader -and $p -lt $PartCount) {
        $count = $Cap
    } else {
        $count = $TotalWrapped - $Index
    }
    if ($count -lt 0) { $count = 0 }

    $partLines = @()
    if ($count -gt 0) { $partLines = $Wrapped.GetRange($Index, $count) }
    $Index += $count

    $srcCount = 0
    $lastSrc = -1
    foreach ($wl in $partLines) {
        if ($wl.Src -ne $lastSrc) { $srcCount++; $lastSrc = $wl.Src }
    }

    $height = [int](2 * $Padding + $count * $LineHeight)
    if ($WithHeader) { $height += [int]$LineHeight }

    $bmp = New-Object System.Drawing.Bitmap($Width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear($BgColor)

    $y = [float]$Padding
    if ($WithHeader) {
        $header = "$BaseName (bagian $p dari $PartCount)"
        $g.DrawString($header, $Font, $BrushHeader, [float]$Padding, $y, $Format)
        $y += $LineHeight
    }
    foreach ($wl in $partLines) {
        $g.DrawString($wl.Text, $Font, (Get-Brush $wl.Color), [float]$Padding, $y, $Format)
        $y += $LineHeight
    }

    if ($PartCount -gt 1) {
        $fileName = "${BaseName}_$p.png"
    } else {
        $fileName = "$BaseName.png"
    }
    $outPath = Join-Path $OutputDir $fileName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()

    $Results.Add([pscustomobject]@{
        Path    = $outPath
        Width   = $Width
        Height  = $height
        Lines   = $count
        Sources = $srcCount
    })
}

$MeasureG.Dispose()
$MeasureBmp.Dispose()
$Font.Dispose()
$Format.Dispose()
$BrushFg.Dispose()
$BrushPrompt.Dispose()
$BrushHttp.Dispose()
$BrushHeader.Dispose()

# --- laporan stdout --------------------------------------------------------
Write-Output "Input          : $InputFile"
Write-Output "SourceLines    : $SourceLines"
Write-Output "WrappedLines   : $TotalWrapped"
Write-Output "Parts          : $PartCount"
Write-Output "MaxHeight      : $MaxHeight"
foreach ($r in $Results) {
    Write-Output "---"
    Write-Output "Path           : $($r.Path)"
    Write-Output "Width          : $($r.Width)"
    Write-Output "Height         : $($r.Height)"
    Write-Output "LinesRendered  : $($r.Lines)   (segmen hasil wrap yang digambar)"
    Write-Output "LinesWrapped   : $($r.Sources)   (baris sumber asli)"
}
