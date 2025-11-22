# 📦 Instalar Git e Fazer Deploy

## Opção 1: Instalar Git (Recomendado)

### Windows

1. **Baixar Git:**
   - Acesse: https://git-scm.com/download/win
   - Baixe e instale o Git para Windows

2. **Após instalar:**
   - Reinicie o terminal/PowerShell
   - Verifique a instalação: `git --version`

3. **Configurar Git (primeira vez):**
   ```bash
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

## Opção 2: Usar GitHub Desktop (Mais Fácil)

1. **Baixar GitHub Desktop:**
   - Acesse: https://desktop.github.com/
   - Instale o GitHub Desktop

2. **Fazer Deploy:**
   - Abra o GitHub Desktop
   - Abra o repositório `arcsight`
   - Clique em "Commit" para salvar as mudanças
   - Clique em "Push origin" para enviar ao GitHub
   - O deploy será automático via GitHub Actions

## Opção 3: Usar Interface Web do GitHub

1. **Acesse seu repositório no GitHub:**
   - Vá para: `https://github.com/[seu-usuario]/arcsight`

2. **Fazer upload dos arquivos:**
   - Clique em "Add file" → "Upload files"
   - Arraste os arquivos modificados
   - Adicione uma mensagem de commit
   - Clique em "Commit changes"

3. **O deploy será automático:**
   - O GitHub Actions vai executar automaticamente
   - Aguarde alguns minutos
   - Acesse: `https://[seu-usuario].github.io/arcsight/`

## 📝 Arquivos que Precisam ser Commitados

Certifique-se de que estes arquivos estão no repositório:

- ✅ `.github/workflows/deploy.yml`
- ✅ `packages/nextjs/app/` (todos os arquivos)
- ✅ `packages/nextjs/components/` (todos os arquivos)
- ✅ `packages/nextjs/lib/` (todos os arquivos)
- ✅ `packages/nextjs/next.config.ts`
- ✅ `packages/nextjs/package.json`
- ✅ `package.json` (raiz)

## ⚠️ Arquivos que NÃO devem ser commitados

- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `out/`
- ❌ `.env.local`
- ❌ Arquivos de cache


