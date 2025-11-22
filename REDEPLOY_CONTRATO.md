# 🔄 Guia de Redeploy do Contrato

## ⚠️ Importante
O contrato foi atualizado com a função `deleteMarket()`. É necessário fazer redeploy para usar essa nova funcionalidade.

## 📋 Passo a Passo

### 1. Compilar o Contrato

```bash
cd packages/hardhat
npm run compile
```

### 2. Verificar Configuração

Certifique-se de que o arquivo `.env` em `packages/hardhat/` contém:

```env
PRIVATE_KEY=sua_chave_privada_aqui
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_CHAIN_ID=5042002
```

### 3. Fazer Deploy na Arc Testnet

```bash
cd packages/hardhat
npm run deploy:arc:testnet
```

### 4. Copiar o Novo Endereço

O script vai mostrar o novo endereço do contrato. Copie esse endereço!

### 5. Atualizar Frontend

Atualize o arquivo `.env.local` em `packages/nextjs/`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=novo_endereco_aqui
NEXT_PUBLIC_NETWORK=arc
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
```

### 6. Reiniciar o Frontend

```bash
cd packages/nextjs
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## 🎯 Comandos Rápidos (Copiar e Colar)

```bash
# 1. Compilar
cd packages/hardhat && npm run compile

# 2. Deploy na Arc Testnet
npm run deploy:arc:testnet

# 3. Depois atualize o .env.local do Next.js com o novo endereço
```

## ⚠️ Avisos

- **Mercados antigos**: Os mercados criados com o contrato antigo continuarão existindo, mas não terão a função de deletar
- **Novos mercados**: Apenas mercados criados após o redeploy terão a função de deletar
- **Saldo**: Certifique-se de ter USDC suficiente na carteira para o deploy

## ✅ Verificação

Após o deploy, verifique:
1. O contrato foi deployado com sucesso
2. O endereço foi atualizado no `.env.local`
3. O frontend foi reiniciado
4. Teste criar um novo mercado e verificar se o botão de deletar aparece




