# 🚀 Solução Rápida: Adicionar packages ao GitHub

## ⚠️ Problema
O erro mostra: `No such file or directory: packages/nextjs`

Isso significa que a pasta `packages` não está no GitHub.

## ✅ Solução: GitHub Desktop (5 minutos)

### Passo 1: Baixar
1. Acesse: https://desktop.github.com/
2. Clique em "Download for Windows"
3. Instale o arquivo baixado

### Passo 2: Configurar
1. Abra o GitHub Desktop
2. Se pedir login, faça login com sua conta GitHub
3. Clique em **File** → **Add Local Repository**
4. Clique em **Choose...**
5. Selecione: `C:\Users\User\Desktop\projeto arc\arcsight`
6. Clique em **Add repository**

### Passo 3: Verificar arquivos
1. O GitHub Desktop mostrará uma lista de arquivos
2. Você verá apenas os arquivos de código (SEM `node_modules`)
3. Isso está correto! O `.gitignore` está funcionando

### Passo 4: Fazer commit
1. Na parte inferior, escreva uma mensagem: "Add packages directory"
2. Clique em **Commit to main** (botão azul)

### Passo 5: Fazer push
1. Clique em **Push origin** (botão azul no topo)
2. Aguarde o upload (pode levar alguns minutos)
3. Pronto! ✅

## 🎯 Por que funciona?

- ✅ GitHub Desktop usa Git (respeita `.gitignore`)
- ✅ `node_modules` é ignorado automaticamente
- ✅ Apenas código é enviado (pequeno e rápido)
- ✅ O workflow fará `npm ci` para instalar dependências

## ⏱️ Tempo total: ~5 minutos

Depois disso, o workflow funcionará automaticamente!




