# Checklist de Debug - Mercado não aparece

Se o mercado foi criado mas não aparece na lista, verifique:

## 1. Console do Navegador (F12)

Abra o console e procure por:
- `[fetchMarkets] Total de mercados encontrados: X`
- `[createMarket] Transação enviada com hash: 0x...`
- `[createMarket] Endereço do contrato: 0x...`

## 2. Verificar Configuração

### Frontend (.env.local)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=seu_endereco_aqui
NEXT_PUBLIC_NETWORK=arc
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
```

### MetaMask
- ✅ Conectado à rede Arc Testnet (Chain ID: 5042002)
- ✅ Tem USDC suficiente para gas

## 3. Verificar Transação

1. Copie o hash da transação do console
2. Acesse: https://testnet.arcscan.app/tx/SEU_HASH
3. Verifique se a transação foi confirmada
4. Verifique se o contrato chamado é o correto

## 4. Verificar Contrato

1. Acesse o explorador do contrato: https://testnet.arcscan.app/address/SEU_CONTRATO
2. Verifique se há eventos de `MarketCreated`
3. Verifique o valor de `marketCounter`

## 5. Testes Manuais

1. Clique no botão "🔄 Atualizar" na página principal
2. Aguarde 10 segundos (atualização automática)
3. Recarregue a página (F5)
4. Verifique o console para erros

## 6. Possíveis Problemas

### Problema: Contrato diferente
**Sintoma:** Mercados antigos aparecem, novos não
**Solução:** Verifique se `NEXT_PUBLIC_CONTRACT_ADDRESS` está correto

### Problema: Rede diferente
**Sintoma:** Transação confirma mas mercado não aparece
**Solução:** Verifique se MetaMask está na rede Arc Testnet (5042002)

### Problema: Transação revertida
**Sintoma:** Transação confirma mas mercado não é criado
**Solução:** Verifique o explorador se a transação foi revertida

### Problema: Cache do navegador
**Sintoma:** Dados antigos aparecem
**Solução:** Limpe o cache (Ctrl+Shift+Delete) ou use modo anônimo

## 7. Logs Esperados

Quando tudo está funcionando, você deve ver:

```
[createMarket] Transação enviada com hash: 0x...
[createMarket] Endereço do contrato: 0x...
[fetchMarkets] Total de mercados encontrados: 3
[fetchMarkets] Mercados válidos: 3
```

Se você ver `Total de mercados encontrados: 2` mas criou um novo, o problema pode ser:
- O contrato não está incrementando o counter
- A transação não está chamando o contrato correto
- Há um problema com a leitura do contrato

