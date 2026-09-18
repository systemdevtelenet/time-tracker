Add-Type -AssemblyName System.Drawing

$rawPath = Join-Path $env:TEMP 'ctnp_raw.png'
Invoke-WebRequest -Uri 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ctnp-logo.png' -OutFile $rawPath

function Generate-CircleIcon($size, $borderWidth, $destFile) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)

    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $margin = [Math]::Max(2, [int]($size * 0.03))
    $diameter = $size - (2 * $margin)

    # 1. Fill solid white circle
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($whiteBrush, $margin, $margin, $diameter, $diameter)

    # 2. Draw the CTNP image filling the circle area cleanly
    $origImg = [System.Drawing.Image]::FromFile($rawPath)
    $g.DrawImage($origImg, $margin, $margin, $diameter, $diameter)

    # 3. Draw clean light gray border around the circle
    $grayPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 218, 224, 233), $borderWidth)
    $grayPen.Alignment = [System.Drawing.Drawing2D.PenAlignment]::Inset
    $g.DrawEllipse($grayPen, $margin, $margin, $diameter, $diameter)

    $g.Dispose()
    $origImg.Dispose()
    $whiteBrush.Dispose()
    $grayPen.Dispose()

    $bmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

Generate-CircleIcon 512 12 'c:\Users\gcarmelotes\Desktop\Grachelle\time-tracker\app\icon.png'
Generate-CircleIcon 512 12 'c:\Users\gcarmelotes\Desktop\Grachelle\time-tracker\public\icon.png'
Generate-CircleIcon 512 12 'c:\Users\gcarmelotes\Desktop\Grachelle\time-tracker\public\ctnp-logo-circle.png'
Generate-CircleIcon 64 2 'c:\Users\gcarmelotes\Desktop\Grachelle\time-tracker\public\favicon.ico'
Generate-CircleIcon 64 2 'c:\Users\gcarmelotes\Desktop\Grachelle\time-tracker\app\favicon.ico'

Write-Host 'Generated perfectly blended circle icon!'
