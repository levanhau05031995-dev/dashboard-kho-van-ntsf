# Cap nhat repo tu thu muc lam viec tren SharePoint roi day len GitHub.
# Chay moi khi sua dashboard va muon dua ban moi len.
#
#   .\Publish.ps1                       -> commit voi thong diep mac dinh
#   .\Publish.ps1 -m "Sua man ton kho"  -> commit voi thong diep rieng
#
# LUU Y: file DOI-MAT-KHAU.md KHONG duoc sao chep sang repo vi chua mat khau dang ro.

param([string]$m = "")

$ErrorActionPreference = 'Stop'

$App  = "D:\I GROUP CORPORATION\SP.Khối Kho Vận & Logistics - Documents\05. Bao cao & Phan tich\03. Phan tich chuyen de\20260916_Dashboard NTSF"
$Repo = $PSScriptRoot

$Files = @(
  'index.html','giao-hang.html','ton-kho.html','nang-suat.html','du-lieu.html','dinh-nghia.html','login.html',
  'styles.css','app.js','auth.js','logo.js','logo.png'
)

if (-not (Test-Path -LiteralPath $App)) { Write-Output "KHONG THAY THU MUC NGUON: $App"; exit 1 }

$n = 0
foreach ($f in $Files) {
  $src = Join-Path $App $f
  if (-not (Test-Path -LiteralPath $src)) { Write-Output "  thieu: $f"; continue }
  Copy-Item -LiteralPath $src -Destination (Join-Path $Repo $f) -Force
  $n++
}
Write-Output "Da sao chep $n tep."

Set-Location $Repo
git add -A
$changed = git status --porcelain
if (-not $changed) { Write-Output "Khong co thay doi nao. Dung."; exit 0 }

if (-not $m) { $m = "Cap nhat dashboard " + (Get-Date -Format 'yyyy-MM-dd HH:mm') }
git commit -m $m
git push
Write-Output "DONE - da day len GitHub."
