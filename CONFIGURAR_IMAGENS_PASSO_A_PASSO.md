# 📸 Configurar Compartilhamento de Imagens - Passo a Passo

## ⚠️ Problema Atual
Você só vê as imagens que você mesmo carregou porque elas estão salvas apenas no seu navegador (localStorage).

## ✅ Solução: Configurar JSONBin.io

### Passo 1: Criar Conta no JSONBin
1. Acesse: https://jsonbin.io/
2. Clique em "Sign Up" (criar conta)
3. Crie uma conta gratuita (não precisa de cartão de crédito)

### Passo 2: Criar um Bin Público
1. Após fazer login, clique em "Create Bin"
2. Cole este JSON inicial:
```json
{
  "images": []
}
```
3. **IMPORTANTE:** Marque o bin como **"Public"** (não privado)
4. Clique em "Create"
5. **Copie o Bin ID** (aparece na URL, ex: `65a1b2c3d4e5f6g7h8i9j0k`)

### Passo 3: Obter Chave do ImgBB
1. Acesse: https://api.imgbb.com/
2. Clique em "Get API Key"
3. Faça login ou crie conta
4. **Copie sua chave de API**

### Passo 4: Configurar no Projeto

**Para desenvolvimento local:**
1. Edite o arquivo: `packages/nextjs/.env.local`
2. Adicione:
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_imgbb_aqui
NEXT_PUBLIC_JSONBIN_BIN_ID=seu_bin_id_aqui
```

**Para produção (GitHub Pages):**
1. Vá em: **Settings** → **Secrets and variables** → **Actions**
2. Clique em **"New repository secret"**
3. Adicione:
   - Nome: `NEXT_PUBLIC_IMGBB_API_KEY`
   - Valor: sua chave do ImgBB
4. Adicione outro:
   - Nome: `NEXT_PUBLIC_JSONBIN_BIN_ID`
   - Valor: seu Bin ID do JSONBin
5. O workflow já está configurado para usar essas variáveis

### Passo 5: Testar
1. Reinicie o servidor Next.js (se estiver rodando localmente)
2. Crie um mercado com imagem
3. Abra o console (F12) e verifique os logs:
   - Deve aparecer: `✅ Imagem do mercado X sincronizada no JSONBin`
4. Abra em outro navegador/computador
5. A imagem deve aparecer para todos

## 🔍 Verificar se Está Funcionando

Abra o console (F12) e procure por:
- `[saveMarketImage] ✅ Imagem do mercado X sincronizada no JSONBin` → ✅ Funcionando!
- `[saveMarketImage] ⚠️ JSONBin não configurado` → ❌ Precisa configurar

## ❓ Problemas Comuns

**"JSONBin não configurado"**
- Verifique se adicionou `NEXT_PUBLIC_JSONBIN_BIN_ID` no `.env.local` ou nos secrets do GitHub
- Reinicie o servidor após adicionar

**"Erro ao sincronizar no JSONBin"**
- Verifique se o Bin está marcado como **"Public"**
- Verifique se o Bin ID está correto
- Tente criar um novo Bin

**"Imagens não aparecem para outros usuários"**
- Verifique se o JSONBin está configurado corretamente
- Verifique os logs no console
- Certifique-se de que o Bin é público

