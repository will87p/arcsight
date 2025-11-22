# Script PowerShell para fazer deploy do contrato na Arc Testnet

Write-Host "🚀 Iniciando deploy do contrato na Arc Testnet..." -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "packages/hardhat")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto (onde está a pasta packages)" -ForegroundColor Red
    exit 1
}

# Navegar para o diretório do Hardhat
Set-Location packages/hardhat

# Compilar o contrato
Write-Host "📦 Compilando contrato..." -ForegroundColor Yellow
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na compilação!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Compilação concluída!" -ForegroundColor Green
Write-Host ""

# Verificar se o .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  AVISO: Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "   Crie o arquivo .env com:" -ForegroundColor Yellow
    Write-Host "   PRIVATE_KEY=sua_chave_privada" -ForegroundColor Yellow
    Write-Host "   ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network" -ForegroundColor Yellow
    Write-Host "   ARC_TESTNET_CHAIN_ID=5042002" -ForegroundColor Yellow
    Write-Host ""
}

# Fazer deploy
Write-Host "🚀 Fazendo deploy na Arc Testnet..." -ForegroundColor Cyan
Write-Host ""
npm run deploy:arc:testnet

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Copie o endereço do contrato mostrado acima" -ForegroundColor White
    Write-Host "2. Atualize o arquivo packages/nextjs/.env.local com:" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_CONTRACT_ADDRESS=novo_endereco_aqui" -ForegroundColor White
    Write-Host "3. Reinicie o servidor Next.js (npm run dev)" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erro no deploy!" -ForegroundColor Red
    Write-Host "   Verifique:" -ForegroundColor Yellow
    Write-Host "   - Se a PRIVATE_KEY está configurada no .env" -ForegroundColor Yellow
    Write-Host "   - Se você tem saldo suficiente de USDC" -ForegroundColor Yellow
    Write-Host "   - Se a rede Arc Testnet está acessível" -ForegroundColor Yellow
}

# Voltar para o diretório raiz
Set-Location ../..




