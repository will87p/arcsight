# ⚡ Configuração Rápida - Bin ID Configurado

## ✅ Bin ID Configurado
Seu Bin ID já está configurado no workflow do GitHub: `6921e984ae596e708f69f4d8`

## 📝 Para Desenvolvimento Local

Adicione esta linha no arquivo `packages/nextjs/.env.local`:

```env
NEXT_PUBLIC_JSONBIN_BIN_ID=6921e984ae596e708f69f4d8
```

**Arquivo completo `.env.local` deve ter:**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6E69202825871e072CFB5dBcEe4Eb341F958cF88
NEXT_PUBLIC_NETWORK=arc
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002

# ImgBB (obtenha em https://api.imgbb.com/)
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_imgbb_aqui

# JSONBin (já configurado)
NEXT_PUBLIC_JSONBIN_BIN_ID=6921e984ae596e708f69f4d8
```

## 🚀 Para Produção (GitHub Pages)

O Bin ID já está configurado no workflow! Mas você ainda precisa:

1. **Adicionar a chave do ImgBB nos Secrets do GitHub:**
   - Vá em: **Settings** → **Secrets and variables** → **Actions**
   - Clique em **"New repository secret"**
   - Nome: `NEXT_PUBLIC_IMGBB_API_KEY`
   - Valor: sua chave do ImgBB

2. **Opcional - Se o bin for privado:**
   - Adicione também: `NEXT_PUBLIC_JSONBIN_API_KEY` com sua chave master

## ✅ Próximos Passos

1. Adicione `NEXT_PUBLIC_JSONBIN_BIN_ID=6921e984ae596e708f69f4d8` no `.env.local`
2. Obtenha a chave do ImgBB em: https://api.imgbb.com/
3. Adicione `NEXT_PUBLIC_IMGBB_API_KEY` no `.env.local` e nos secrets do GitHub
4. Reinicie o servidor Next.js (`npm run dev`)
5. Crie um mercado com imagem e teste!

## 🔍 Verificar se Funcionou

Abra o console (F12) e procure por:
- `✅ JSONBin configurado` → Funcionando!
- `✅ Imagem do mercado X sincronizada no JSONBin` → Imagem compartilhada!

