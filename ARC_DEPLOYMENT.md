# Guia de Deploy na Rede Arc

Este guia explica como fazer deploy do ArcSight na rede Arc Network.

## 📋 Pré-requisitos

1. **Conta na rede Arc**: Você precisa ter uma conta com USDC suficiente para fazer transações
2. **Chave Privada**: A chave privada da conta que fará o deploy
3. **RPC URL**: URL do endpoint RPC da rede Arc (fornecida pela Circle)

## 🔧 Configuração

### 1. Configurar Hardhat

Crie um arquivo `.env` na pasta `packages/hardhat/`:

```env
# Chave privada da conta que fará o deploy
PRIVATE_KEY=sua_chave_privada_aqui

# Configuração da rede Arc - Testnet
# Nota: A Arc Network atualmente disponibiliza apenas a testnet
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_CHAIN_ID=5042002

# Alternativas de RPC para testnet:
# - https://rpc.blockdaemon.testnet.arc.network
# - https://rpc.drpc.testnet.arc.network
# - https://rpc.quicknode.testnet.arc.network
```

**⚠️ SEGURANÇA**: 
- Nunca commite o arquivo `.env` com valores reais
- Mantenha sua chave privada segura
- Use variáveis de ambiente ou um gerenciador de segredos em produção

### 2. Compilar o Contrato

```bash
cd packages/hardhat
npm run compile
```

### 3. Fazer Deploy

**Para Testnet (recomendado para testes):**
```bash
npm run deploy:arc:testnet
```

**Nota:** A Arc Network atualmente disponibiliza apenas a testnet. Quando a mainnet estiver disponível, use `npm run deploy:arc`.

O script irá:
1. Verificar se as variáveis de ambiente estão configuradas
2. Fazer deploy do contrato `PredictionMarket`
3. Exibir o endereço do contrato deployado

**Copie o endereço do contrato** - você precisará dele para configurar o frontend.

## 🌐 Configurar Frontend

### 1. Atualizar `.env.local`

Edite o arquivo `packages/nextjs/.env.local`:

```env
# Endereço do contrato deployado na Arc
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Configuração da rede Arc Testnet
NEXT_PUBLIC_NETWORK=arc
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
```

### 2. Reiniciar o Servidor Next.js

```bash
cd packages/nextjs
npm run dev
```

## 🔗 Adicionar Rede Arc no MetaMask

Para que os usuários possam interagir com o dApp na rede Arc, eles precisam adicionar a rede no MetaMask:

1. Abra o MetaMask
2. Clique no menu de redes (topo da extensão)
3. Clique em "Adicionar rede" ou "Add Network"
4. Preencha os seguintes dados:

   - **Nome da Rede**: Arc Testnet
   - **URL RPC**: https://rpc.testnet.arc.network
   - **Chain ID**: 5042002
   - **Símbolo da Moeda**: USDC
   - **URL do Explorador**: https://testnet.arcscan.app

5. Salve a rede

## 💰 Obter USDC na Rede Arc

A rede Arc usa **USDC como moeda nativa para gas**, não ETH. Você precisa:

1. Ter USDC na sua carteira
2. Obter USDC na testnet através do faucet oficial:
   - **Faucet**: https://faucet.circle.com
   - Acesse o faucet e solicite USDC para sua conta na testnet

**Importante:** 
- A Arc Network usa USDC como token nativo de gas com **18 decimais** de precisão
- O contrato ERC-20 USDC (`0x3600000000000000000000000000000000000000`) usa 6 decimais
- Para aplicações, recomenda-se usar apenas a interface ERC-20 padrão para ler saldos e enviar transferências

## ✅ Verificação

Após o deploy, verifique:

1. ✅ O contrato foi deployado (verifique no explorador de blocos da Arc)
2. ✅ O endereço está correto no `.env.local` do Next.js
3. ✅ `NEXT_PUBLIC_NETWORK=arc` está configurado
4. ✅ A carteira está conectada à rede Arc no MetaMask
5. ✅ Há USDC suficiente na carteira

## 🐛 Troubleshooting

### Erro: "PRIVATE_KEY não está configurada"
- Verifique se o arquivo `.env` existe em `packages/hardhat/`
- Verifique se a variável `PRIVATE_KEY` está definida

### Erro: "ARC_RPC_URL não está configurada"
- Verifique se `ARC_RPC_URL` está definida no `.env`
- Verifique se a URL está correta e acessível

### Erro: "Insufficient funds"
- Certifique-se de ter USDC suficiente na conta
- Lembre-se: Arc usa USDC (18 decimais), não ETH
- Use o faucet oficial: https://faucet.circle.com

### Contrato não aparece no frontend
- Verifique se `NEXT_PUBLIC_NETWORK=arc` está no `.env.local` do Next.js
- Verifique se o endereço do contrato está correto
- Reinicie o servidor Next.js após alterar variáveis de ambiente

## ⛽ Gas e Taxas

A Arc Network usa USDC como token nativo de gas com as seguintes características:

- **Base Fee Mínimo**: 160 Gwei (~$0.01 por transação)
- **Modelo**: EIP-1559 (base fee com média móvel)
- **Decimais**: 18 (USDC nativo para gas)

**Importante:** Sempre defina `maxFeePerGas ≥ 160 Gwei` para garantir que as transações sejam incluídas.

Para mais informações, consulte [ARC_GAS_INFO.md](./ARC_GAS_INFO.md).

## 📚 Recursos

- [Documentação da Arc Network](https://docs.arc.network)
- [Conectar à Arc Network](https://docs.arc.network/arc/references/connect-to-arc)
- [Gas e Taxas](https://docs.arc.network/arc/references/gas-and-fees)
- [Endereços de Contratos](https://docs.arc.network/arc/references/contract-addresses)
- [Deploy na Arc - Tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [Circle Developer Portal](https://developers.circle.com)
- [Faucet da Arc Testnet](https://faucet.circle.com)
- [Explorador Arc Testnet](https://testnet.arcscan.app)
- [Arc Gas Tracker](https://testnet.arcscan.app/gas-tracker)

