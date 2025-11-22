# 🔄 Começar do Zero - Guia Completo

## 📋 Passo 1: Apagar o Repositório no GitHub

1. **Vá para o repositório** `oxwill.github.io` no GitHub
2. **Clique em "Settings"** (Configurações)
3. **Role até o final da página**
4. **Na seção "Danger Zone"**, clique em **"Delete this repository"**
5. **Digite o nome do repositório** para confirmar: `oxwill.github.io`
6. **Clique em "I understand the consequences, delete this repository"**
7. **Pronto!** Repositório deletado ✅

## 📋 Passo 2: Criar Novo Repositório

1. **No GitHub**, clique no **"+"** no canto superior direito
2. **Escolha "New repository"**
3. **Nome do repositório**: `oxwill.github.io` (exatamente assim!)
4. **Descrição**: `ArcSight - Mercado de Previsão Descentralizado`
5. **Visibilidade**: Público ou Privado (como preferir)
6. **NÃO marque** "Add a README file"
7. **NÃO marque** "Add .gitignore"
8. **NÃO marque** "Choose a license"
9. **Clique em "Create repository"**

## 📋 Passo 3: Conectar com GitHub Desktop

1. **Abra o GitHub Desktop**
2. **File** → **Clone repository**
3. **Na aba "URL"**, cole: `https://github.com/will87p/oxwill.github.io.git`
4. **Escolha onde salvar** (pode ser uma pasta temporária)
5. **Clique em "Clone"**

## 📋 Passo 4: Copiar Arquivos Corretos

1. **No Windows Explorer**, vá até: `C:\Users\User\Desktop\projeto arc\arcsight`
2. **Copie TODOS os arquivos e pastas** EXCETO:
   - ❌ `node_modules/` (não copie)
   - ❌ `out/` (não copie)
   - ❌ `.next/` (não copie)
   - ❌ `packages/*/node_modules/` (não copie)
   - ❌ `packages/*/out/` (não copie)
   - ❌ `packages/*/.next/` (não copie)

3. **Cole tudo na pasta clonada** do GitHub Desktop

## 📋 Passo 5: Fazer Commit e Push

1. **Volte para o GitHub Desktop**
2. **Você verá todos os arquivos na lista**
3. **No campo "Summary"**, escreva: `Initial commit - ArcSight project`
4. **Clique em "Commit to main"**
5. **Clique em "Push origin"** (botão azul no topo)
6. **Aguarde o upload** (pode levar alguns minutos)

## 📋 Passo 6: Verificar Estrutura

No GitHub, a estrutura deve estar assim:

```
oxwill.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── packages/
│   ├── nextjs/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── next.config.ts
│   └── hardhat/
├── package.json
├── README.md
└── .gitignore
```

## 📋 Passo 7: Habilitar GitHub Pages

1. **No GitHub**, vá em **Settings** → **Pages**
2. **Em "Source"**, selecione **"GitHub Actions"**
3. **Salve**

## 📋 Passo 8: Aguardar Deploy

1. **Vá para a aba "Actions"**
2. **O workflow "Deploy to GitHub Pages" deve rodar automaticamente**
3. **Aguarde 2-5 minutos**
4. **Quando aparecer ✅ verde, seu site estará em: `https://oxwill.github.io`**

## ✅ Checklist Final

- [ ] Repositório antigo deletado
- [ ] Novo repositório criado
- [ ] GitHub Desktop conectado
- [ ] Arquivos copiados (sem node_modules)
- [ ] Commit e push feitos
- [ ] Estrutura verificada no GitHub
- [ ] GitHub Pages habilitado
- [ ] Workflow rodando com sucesso

## 🎉 Pronto!

Seu site estará funcionando em `https://oxwill.github.io`




