# 🌐 Deploy via Interface Web do GitHub (Sem Git)

## Passo a Passo Simples

### 1. Acesse seu Repositório
- Vá para: `https://github.com/[seu-usuario]/arcsight`
- Se não tiver o repositório, crie um novo em: `https://github.com/new`

### 2. Upload dos Arquivos

**Opção A: Upload Individual**
1. Navegue até a pasta que precisa atualizar
2. Clique no ícone de lápis (✏️) para editar
3. Cole o conteúdo do arquivo
4. Clique em "Commit changes"

**Opção B: Upload em Massa**
1. Clique em "Add file" → "Upload files"
2. Arraste todas as pastas modificadas:
   - `packages/nextjs/app/`
   - `packages/nextjs/components/`
   - `packages/nextjs/lib/`
   - `.github/workflows/`
3. Adicione mensagem: "feat: adicionar suporte a múltiplos idiomas, footer e botão faucet"
4. Clique em "Commit changes"

### 3. Verificar Deploy

1. Vá para: **Actions** (aba no topo do repositório)
2. Aguarde o workflow "Deploy to GitHub Pages" completar
3. Se der erro, clique no workflow para ver os detalhes

### 4. Acessar o Site

- URL: `https://[seu-usuario].github.io/arcsight/`
- Pode levar 2-5 minutos após o commit

## 🔧 Habilitar GitHub Pages (Se necessário)

1. Vá em: **Settings** → **Pages**
2. Em **Source**, selecione: **GitHub Actions**
3. Salve

## ✅ Checklist de Arquivos Importantes

Certifique-se de que estes arquivos estão no repositório:

### Arquivos Novos/Criados:
- ✅ `packages/nextjs/components/Footer.tsx`
- ✅ `packages/nextjs/components/LanguageSelector.tsx`
- ✅ `packages/nextjs/lib/i18n/LanguageContext.tsx`
- ✅ `packages/nextjs/lib/i18n/translations.ts`
- ✅ `packages/nextjs/lib/imageStorage.ts`

### Arquivos Modificados:
- ✅ `packages/nextjs/app/layout.tsx`
- ✅ `packages/nextjs/app/page.tsx`
- ✅ `packages/nextjs/components/Header.tsx`
- ✅ `packages/nextjs/components/MarketCard.tsx`
- ✅ `packages/nextjs/components/FilterBar.tsx`
- ✅ `packages/nextjs/app/create/page.tsx`
- ✅ `packages/nextjs/app/market/[id]/page.tsx`
- ✅ `.github/workflows/deploy.yml`


