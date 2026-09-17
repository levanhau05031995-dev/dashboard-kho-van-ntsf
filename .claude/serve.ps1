param(
  [Parameter(Mandatory=$true)][string]$Root,
  [int]$Port = 8810,
  [int]$TimeoutMinutes = 240,
  [string]$NoteDir = ''
)

# Accept a relative -Root. Resolve it against the current directory first,
# then against this script's parent folder, so the config works from any cwd.
if (-not [System.IO.Path]::IsPathRooted($Root)) {
  $try1 = Join-Path (Get-Location).Path $Root
  $try2 = Join-Path (Split-Path -Parent $PSScriptRoot) $Root
  if (Test-Path -LiteralPath $try1) { $Root = (Resolve-Path -LiteralPath $try1).Path }
  elseif (Test-Path -LiteralPath $try2) { $Root = (Resolve-Path -LiteralPath $try2).Path }
  else { Write-Output "ROOT NOT FOUND: $Root"; exit 1 }
}
$types = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8';
  '.css'='text/css; charset=utf-8';   '.js'='application/javascript; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.csv'='text/csv; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml';
  '.ico'='image/x-icon'; '.woff2'='font/woff2'; '.woff'='font/woff'
}
# Folder where notes written from the dashboard are appended.
if (-not $NoteDir) { $NoteDir = Join-Path (Split-Path -Parent $Root) '20260917_Ghi nhan tu Dashboard' }
if (-not (Test-Path -LiteralPath $NoteDir)) { New-Item -ItemType Directory -Path $NoteDir -Force | Out-Null }
$NoteFile = Join-Path $NoteDir 'ghi-chu.jsonl'

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "SERVING $Root  ->  http://localhost:$Port/"
Write-Output "NOTES   $NoteFile"

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
while ((Get-Date) -lt $deadline) {
  $t = $listener.GetContextAsync()
  $got = $false
  while ((Get-Date) -lt $deadline) { if ($t.AsyncWaitHandle.WaitOne(1000)) { $got = $true; break } }
  if (-not $got) { continue }

  $ctx = $t.Result
  $res = $ctx.Response
  $res.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate")
  $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

  # The dashboard posts notes here. Append one JSON object per line, then answer 200.
  if ($rel -eq '__ghi-chu') {
    $res.Headers.Add("Access-Control-Allow-Origin", "*")
    $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    if ($ctx.Request.HttpMethod -eq 'OPTIONS') {
      $res.StatusCode = 204; $res.Close(); continue
    }
    try {
      $sr = New-Object System.IO.StreamReader($ctx.Request.InputStream, [System.Text.Encoding]::UTF8)
      $body = $sr.ReadToEnd(); $sr.Close()
      [System.IO.File]::AppendAllText($NoteFile, $body.Trim() + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
      $ok = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
      $res.ContentType = 'application/json; charset=utf-8'
      $res.ContentLength64 = $ok.Length
      $res.OutputStream.Write($ok, 0, $ok.Length)
      Write-Output "NOTE saved ($($body.Length) bytes)"
    } catch {
      $res.StatusCode = 500
      Write-Output "NOTE error: $($_.Exception.Message)"
    }
    $res.Close(); continue
  }

  $path = Join-Path $Root $rel

  if (Test-Path -LiteralPath $path -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    $ct = $types[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
    $res.ContentType = $ct
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Output ("200 {0} ({1} bytes)" -f $rel, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $b = [System.Text.Encoding]::UTF8.GetBytes("404 $rel")
    $res.OutputStream.Write($b, 0, $b.Length)
    Write-Output "404 $rel"
  }
  $res.Close()
}
$listener.Stop()
Write-Output "STOPPED"
