# 📦 Como Adicionar a Pasta packages ao GitHub

## ⚠️ Problema
A pasta `packages` é muito grande porque contém `node_modules`, que não deve ser commitado.

## ✅ Solução: Adicionar apenas arquivos essenciais

### Opção 1: Usar GitHub Desktop (Mais Fácil)

1. **Baixe e instale**: https://desktop.github.com/
2. **Abra o GitHub Desktop**
3. **File** → **Add Local Repository**
4. Selecione: `C:\Users\User\Desktop\projeto arc\arcsight`
5. O GitHub Desktop **automaticamente respeita o `.gitignore`**
6. Você verá apenas os arquivos que devem ser commitados (sem `node_modules`)
7. Clique em **Commit** e depois **Push**

### Opção 2: Adicionar arquivos manualmente (um por um)

Se não quiser usar GitHub Desktop, você precisa adicionar os arquivos essenciais manualmente:

#### Estrutura mínima necessária:

```
packages/
├── nextjs/
│   ├── app/                    (toda a pasta)
│   ├── components/             (toda a pasta)
│   ├── lib/                    (toda a pasta)
│   ├── public/                 (toda a pasta)
│   ├── package.json            (arquivo)
│   ├── next.config.ts          (arquivo)
│   ├── tsconfig.json           (arquivo)
│   ├── postcss.config.mjs      (arquivo)
│   └── eslint.config.mjs        (arquivo)
└── hardhat/
    ├── contracts/             (toda a pasta)
    ├── scripts/                (toda a pasta)
    ├── test/                   (toda a pasta)
    ├── package.json            (arquivo)
    ├── hardhat.config.ts       (arquivo)
    └── tsconfig.json           (arquivo)
```

**NÃO precisa de:**
- ❌ `node_modules/` (será instalado pelo workflow)
- ❌ `out/` (será gerado pelo build)
- ❌ `.next/` (será gerado pelo build)
- ❌ `cache/` (Hardhat)
- ❌ `artifacts/` (Hardhat)
- ❌ `typechain-types/` (Hardhat)

### Opção 3: Criar arquivos ZIP sem node_modules

1. Exclua as pastas `node_modules` de `packages/nextjs` e `packages/hardhat`
2. Crie um ZIP da pasta `packages` (sem `node_modules`)
3. Faça upload do ZIP no GitHub
4. O GitHub extrairá automaticamente

## 🎯 Recomendação

**Use a Opção 1 (GitHub Desktop)** - é a mais fácil e garante que apenas os arquivos corretos sejam commitados!

