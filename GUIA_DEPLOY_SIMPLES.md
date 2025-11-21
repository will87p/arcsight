# 🚀 Guia SIMPLES - Deploy no GitHub Pages

## 📝 Passo a Passo (SEM usar linha de comando)

### 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Nome do repositório**: `oxwill.github.io` (para ter o link `https://oxwill.github.io/`)
3. Marque como **Público** ou **Privado** (como preferir)
4. **NÃO** marque "Add a README file"
5. Clique em **Create repository**

### 2️⃣ Fazer Upload dos Arquivos

**Opção A - Usando GitHub Desktop (Mais Fácil):**
1. Baixe e instale: https://desktop.github.com/
2. Abra o GitHub Desktop
3. Clique em **File** → **Add Local Repository**
4. Selecione a pasta: `C:\Users\User\Desktop\projeto arc\arcsight`
5. Se pedir para criar repositório, clique em **Create**
6. Clique em **Publish repository** (canto superior direito)
7. Selecione o repositório `oxwill.github.io` que você criou
8. Clique em **Publish**

**Opção B - Usando Interface Web (Mais Rápido):**
1. No repositório que você criou, clique em **uploading an existing file**
2. Arraste TODA a pasta `arcsight` para a página
3. Role até o final e clique em **Commit changes**

**Opção C - Usando o Token que você forneceu:**
Se você tiver Git instalado, posso te ajudar a configurar os comandos.

### 3️⃣ Habilitar GitHub Pages

1. No seu repositório, vá em **Settings** (Configurações)
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Salve (não precisa fazer mais nada)

### 4️⃣ Aguardar Deploy

1. Clique na aba **Actions** no topo do repositório
2. Você verá um workflow "Deploy to GitHub Pages" rodando
3. Aguarde 2-5 minutos até aparecer um ✅ verde
4. Clique no workflow completo
5. Role até o final e verá: **"Deploy to GitHub Pages"**
6. Clique no link que aparece (ex: `https://oxnnerb.github.io`)

### 5️⃣ Pronto! 🎉

Seu site estará disponível em:
- `https://oxwill.github.io`

## ⚠️ Importante

- O primeiro deploy pode levar até 5 minutos
- Após isso, cada vez que você fizer push, o site atualiza automaticamente
- Se der erro, verifique a aba **Actions** para ver os logs

## 🔧 Configurar Variáveis (Opcional)

Se quiser mudar as configurações do contrato:

1. No repositório, vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione cada uma dessas variáveis:
   - Nome: `NEXT_PUBLIC_CONTRACT_ADDRESS` | Valor: `0x63D158dA4c1C33A8F0F6726Ef698058b535B76fC`
   - Nome: `NEXT_PUBLIC_NETWORK` | Valor: `arc`
   - Nome: `NEXT_PUBLIC_ARC_RPC_URL` | Valor: `https://rpc.testnet.arc.network`
   - Nome: `NEXT_PUBLIC_ARC_CHAIN_ID` | Valor: `5042002`

**Se não configurar, os valores padrão serão usados automaticamente!**

