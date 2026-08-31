Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(255, 8, 8, 8))

$titleFont = New-Object System.Drawing.Font ([System.Drawing.FontFamily]::GenericSerif, 52, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = New-Object System.Drawing.Font ([System.Drawing.FontFamily]::GenericSansSerif, 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$titleBrush = [System.Drawing.Brushes]::White
$subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 168, 168, 160))

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$titleRect = New-Object System.Drawing.RectangleF 0, ($height / 2 - 70), $width, 80
$subRect = New-Object System.Drawing.RectangleF 0, ($height / 2 + 10), $width, 60

$g.DrawString("Loop Trips", $titleFont, $titleBrush, $titleRect, $sf)
$g.DrawString("Bharat first - World beyond", $subFont, $subBrush, $subRect, $sf)

$titleFont.Dispose()
$subFont.Dispose()
$subBrush.Dispose()
$g.Dispose()

$out = Join-Path $PSScriptRoot "..\img\og-default.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Created $out"
