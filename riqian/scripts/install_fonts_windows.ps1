$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$source = Join-Path $root 'assets\fonts'
$target = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
$registry = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
$fonts = @(
  @{ File = 'Bell MT Bold.ttf'; Name = 'Bell MT Bold (TrueType)' },
  @{ File = '仿宋.ttf'; Name = 'FangSong (TrueType)' },
  @{ File = '微软雅黑 Light.ttc'; Name = 'Microsoft YaHei Light (TrueType)' }
)
New-Item -ItemType Directory -Force -Path $target | Out-Null
foreach ($font in $fonts) {
  $from = Join-Path $source $font.File; $to = Join-Path $target $font.File
  if (-not (Test-Path -LiteralPath $from -PathType Leaf)) { throw "Missing bundled font: $from" }
  if (-not (Test-Path -LiteralPath $to -PathType Leaf)) { Copy-Item -LiteralPath $from -Destination $to; Write-Host "Installed: $to" }
  else { Write-Host "Already present, left unchanged: $to" }
  New-ItemProperty -Path $registry -Name $font.Name -PropertyType String -Value $to -Force | Out-Null
}
Write-Host 'Restart PowerPoint before opening the 日签文件.'
