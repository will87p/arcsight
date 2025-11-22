# Script para instalar Git ou usar o do GitHub Desktop
# Execute como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando Git para uso" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git já está no PATH
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if ($gitPath) {
    Write-Host "Git encontrado! Localizacao: $($gitPath.Source)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Adicionando pasta packages..." -ForegroundColor Yellow
    
    Set-Location "C:\Users\User\Desktop\projeto arc\arcsight"
    git add packages/
    git status
    
    Write-Host ""
    Write-Host "Próximos comandos:" -ForegroundColor Yellow
    Write-Host "  git commit -m 'Add packages directory'" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
    exit
}

# Procurar Git do GitHub Desktop
Write-Host "Procurando Git do GitHub Desktop..." -ForegroundColor Yellow

$gitHubDesktopPaths = @(
    "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe",
    "$env:ProgramFiles\GitHub Desktop\resources\app\git\cmd\git.exe"
)

$foundGit = $null
foreach ($path in $gitHubDesktopPaths) {
    $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    if ($files) {
        $foundGit = $files[0].FullName
        break
    }
}

if ($foundGit) {
    Write-Host "Git do GitHub Desktop encontrado: $foundGit" -ForegroundColor Green
    Write-Host ""
    Write-Host "Adicionando ao PATH temporariamente..." -ForegroundColor Yellow
    
    $gitDir = Split-Path (Split-Path $foundGit)
    $env:Path = "$gitDir\cmd;$env:Path"
    
    Write-Host "Adicionando pasta packages..." -ForegroundColor Yellow
    
    Set-Location "C:\Users\User\Desktop\projeto arc\arcsight"
    & $foundGit add packages/
    & $foundGit status
    
    Write-Host ""
    Write-Host "Próximos comandos:" -ForegroundColor Yellow
    Write-Host "  & '$foundGit' commit -m 'Add packages directory'" -ForegroundColor White
    Write-Host "  & '$foundGit' push" -ForegroundColor White
} else {
    Write-Host "Git não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "OPÇÕES:" -ForegroundColor Yellow
    Write-Host "1. Instalar Git: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Usar GitHub Desktop (mais fácil)" -ForegroundColor White
    Write-Host "3. Fazer upload direto no GitHub" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




