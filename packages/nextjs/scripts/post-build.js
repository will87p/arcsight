const fs = require('fs');
const path = require('path');

// Script para garantir que o GitHub Pages funcione corretamente
// Copia o 404.html para a raiz do out (se necessário)

const outDir = path.join(__dirname, '..', 'out');
const basePath = '/arcsight';

function ensure404() {
  // Verificar se o diretório out existe
  if (!fs.existsSync(outDir)) {
    console.log('⚠️ Diretório out não encontrado. Execute o build primeiro.');
    return;
  }

  // O Next.js já deve gerar o 404.html, mas vamos garantir
  const notFoundPath = path.join(outDir, '404.html');
  const indexPath = path.join(outDir, 'index.html');

  // Se não existir 404.html, copiar do index.html
  if (!fs.existsSync(notFoundPath) && fs.existsSync(indexPath)) {
    console.log('📋 Copiando index.html para 404.html...');
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✅ 404.html criado com sucesso');
  } else if (fs.existsSync(notFoundPath)) {
    console.log('✅ 404.html já existe');
  } else {
    console.log('⚠️ index.html não encontrado. Build pode ter falhado.');
  }

  // Verificar se as rotas de mercado estão sendo geradas
  const marketDir = path.join(outDir, 'market');
  if (fs.existsSync(marketDir)) {
    const marketFiles = fs.readdirSync(marketDir);
    console.log(`✅ ${marketFiles.length} arquivos de mercado encontrados`);
  } else {
    console.log('⚠️ Diretório market não encontrado');
  }
}

ensure404();

