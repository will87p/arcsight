# 🎯 Passo a Passo - Corrigir Estrutura no GitHub

## ✅ O que fazer AGORA

### PASSO 1: Verificar no GitHub Desktop

1. **Abra o GitHub Desktop**
2. **Veja o painel esquerdo** - lista de arquivos para commit
3. **Procure pela pasta `packages`**
   - ✅ Se aparecer `packages/` → Ótimo! Vá para PASSO 2
   - ❌ Se NÃO aparecer → Continue lendo

### PASSO 2: Se a pasta `packages` aparecer no GitHub Desktop

1. **No campo "Summary"**, escreva: `Add packages directory`
2. **Clique em "Commit to main"**
3. **Clique em "Push origin"** (botão azul no topo)
4. **Aguarde o upload**
5. **Pronto!** ✅

### PASSO 3: Remover arquivos errados da raiz (no GitHub)

**IMPORTANTE:** Faça isso DEPOIS de fazer push da pasta `packages`

1. **Abra o GitHub no navegador**
2. **Vá para a aba "Code"**
3. **Para cada arquivo abaixo que estiver na raiz, DELETE:**

   - `next.config.ts` → Delete
   - `tsconfig.json` → Delete (se for do Next.js)
   - `postcss.config.mjs` → Delete
   - `eslint.config.mjs` → Delete
   - `next-env.d.ts` → Delete
   - `tsconfig.tsbuildinfo` → Delete
   - `package.json` → **CUIDADO!** Só delete se for o do Next.js (verifique o conteúdo)

4. **Para deletar cada arquivo:**
   - Clique no arquivo
   - Clique no ícone de lixeira 🗑️
   - Escreva: "Remove arquivo da raiz"
   - Clique em "Commit changes"

### PASSO 4: Verificar estrutura final

No GitHub, a estrutura deve estar assim:

```
oxwill.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── packages/              ← DEVE EXISTIR
│   └── nextjs/            ← DEVE EXISTIR
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── package.json
│       └── next.config.ts
├── package.json           ← Este fica na raiz (workspace)
├── README.md
└── .gitignore
```

## 🚨 Se a pasta `packages` NÃO aparecer no GitHub Desktop

Isso significa que ela já foi commitada antes ou está sendo ignorada.

**Solução:**
1. No GitHub Desktop, clique em **"Repository"** → **"Show in Explorer"**
2. Isso abrirá a pasta no Windows
3. Verifique se existe `packages/nextjs/` na pasta
4. Se existir, volte ao GitHub Desktop e force um commit:
   - Clique em **"Repository"** → **"Open in Command Prompt"**
   - Digite: `git add packages/`
   - Digite: `git commit -m "Add packages directory"`
   - Digite: `git push`

## ✅ Checklist Final

- [ ] Pasta `packages/` existe no GitHub
- [ ] Pasta `packages/nextjs/` existe no GitHub
- [ ] Arquivos do Next.js estão dentro de `packages/nextjs/`
- [ ] Arquivos do Next.js NÃO estão mais na raiz
- [ ] Workflow rodou com sucesso na aba "Actions"

## 🎉 Quando tudo estiver correto

1. Vá para a aba **"Actions"** no GitHub
2. O workflow "Deploy to GitHub Pages" deve rodar automaticamente
3. Aguarde 2-5 minutos
4. Quando aparecer ✅ verde, seu site estará em: `https://oxwill.github.io`

