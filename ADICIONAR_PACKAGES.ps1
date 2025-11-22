# Script para adicionar a pasta packages ao Git
# Execute este script no PowerShell

Write-Host "Adicionando pasta packages ao Git..." -ForegroundColor Green

# Navegar para a pasta do projeto
Set-Location "C:\Users\User\Desktop\projeto arc\arcsight"

# Verificar se está em um repositório Git
if (Test-Path ".git") {
    Write-Host "Repositório Git encontrado!" -ForegroundColor Green
    
    # Adicionar a pasta packages
    Write-Host "Adicionando packages/..." -ForegroundColor Yellow
    git add packages/
    
    # Verificar status
    Write-Host "`nStatus do Git:" -ForegroundColor Cyan
    git status
    
    Write-Host "`nPróximos passos:" -ForegroundColor Yellow
    Write-Host "1. Execute: git commit -m 'Add packages directory'" -ForegroundColor White
    Write-Host "2. Execute: git push" -ForegroundColor White
} else {
    Write-Host "ERRO: Esta pasta não é um repositório Git!" -ForegroundColor Red
    Write-Host "Certifique-se de que o GitHub Desktop está configurado corretamente." -ForegroundColor Yellow
}




