# 🔧 Como Reorganizar os Arquivos no GitHub

## ⚠️ Problema
Os arquivos do Next.js foram enviados na raiz do repositório, mas precisam estar em `packages/nextjs/`.

## ✅ Solução: Usar GitHub Desktop

### Passo 1: Verificar no GitHub Desktop

1. Abra o GitHub Desktop
2. Verifique se você está na branch `main`
3. No painel esquerdo, você verá os arquivos que serão commitados

### Passo 2: Verificar estrutura local

No seu computador, a estrutura deve estar assim:
```
arcsight/
├── packages/
│   └── nextjs/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── package.json
│       └── ...
```

Se estiver assim, está correto! ✅

### Passo 3: Remover arquivos da raiz no GitHub

**Opção A: Pelo GitHub (mais fácil)**

1. No GitHub, vá para a aba "Code"
2. Para cada arquivo que está na raiz mas deveria estar em `packages/nextjs/`:
   - Clique no arquivo (ex: `next.config.ts`)
   - Clique no ícone de lixeira (Delete)
   - Faça commit da deleção

**Arquivos que provavelmente estão na raiz e devem ser removidos:**
- `next.config.ts` → deve estar em `packages/nextjs/`
- `package.json` (se for do Next.js) → deve estar em `packages/nextjs/`
- `tsconfig.json` → deve estar em `packages/nextjs/`
- `postcss.config.mjs` → deve estar em `packages/nextjs/`
- `eslint.config.mjs` → deve estar em `packages/nextjs/`
- `next-env.d.ts` → deve estar em `packages/nextjs/`
- `tsconfig.tsbuildinfo` → deve estar em `packages/nextjs/`

**NÃO remova:**
- `package.json` da raiz (se for o do workspace)
- `README.md`
- `.gitignore`
- Arquivos `.md`

### Passo 4: Adicionar pasta packages

1. No GitHub Desktop, verifique se a pasta `packages` aparece na lista
2. Se não aparecer, ela já deve estar sendo rastreada localmente
3. Faça commit: "Add packages directory with correct structure"
4. Faça push

### Passo 5: Verificar

1. No GitHub, vá para "Code"
2. Verifique se existe a pasta `packages`
3. Dentro de `packages`, deve haver `nextjs/`
4. Dentro de `packages/nextjs/`, devem estar todos os arquivos

## 🎯 Estrutura Final Correta

```
oxwill.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── packages/
│   └── nextjs/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       ├── package.json
│       ├── next.config.ts
│       └── ...
├── package.json (raiz - workspace)
├── README.md
└── .gitignore
```

## ⚡ Solução Rápida Alternativa

Se preferir, você pode:
1. Deletar todos os arquivos do Next.js da raiz no GitHub
2. Usar GitHub Desktop para fazer push da pasta `packages` completa
3. O GitHub Desktop vai enviar apenas os arquivos corretos (respeitando `.gitignore`)

