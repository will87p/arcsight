# 🔄 Como Reiniciar o Servidor Next.js

## ⚠️ IMPORTANTE
Após atualizar o `.env.local`, você **DEVE** reiniciar o servidor Next.js para que as mudanças tenham efeito.

## 📋 Passos:

1. **Pare o servidor atual:**
   - No terminal onde o `npm run dev` está rodando
   - Pressione `Ctrl + C`

2. **Inicie novamente:**
   ```powershell
   cd packages/nextjs
   npm run dev
   ```

3. **Verifique no console do navegador (F12):**
   - Deve aparecer: `CONTRACT_ADDRESS: 0x6E69202825871e072CFB5dBcEe4Eb341F958cF88`
   - Se aparecer o endereço antigo, o servidor não foi reiniciado corretamente

## ✅ Após reiniciar:
- O frontend usará o novo contrato
- A função `deleteMarket` estará disponível
- As transações funcionarão corretamente




