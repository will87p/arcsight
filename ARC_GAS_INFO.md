# Gas e Taxas na Arc Network

Este documento explica como funcionam as taxas de gas na rede Arc Network.

## 📊 Informações Gerais

A Arc Network usa **USDC como token nativo de gas**, proporcionando custos de transação estáveis e previsíveis.

### Configuração de Gas

| Parâmetro | Valor |
|-----------|-------|
| **Token de Gas** | USDC (18 decimais) |
| **Modelo de Preço** | EIP-1559 (base fee com média móvel exponencialmente ponderada) |
| **Base Fee Mínimo (Testnet)** | ~160 Gwei |
| **Custo Alvo por Transação** | ~$0.01 |

## ⚙️ Configuração de Gas

### Base Fee Mínimo

A Arc Testnet aplica um **base fee mínimo de 160 Gwei**. Transações com `maxFeePerGas` abaixo de 160 Gwei podem:
- Permanecer pendentes
- Falhar na execução

### Boas Práticas

1. **Sempre defina `maxFeePerGas ≥ 160 Gwei`** para garantir inclusão oportuna
2. **Exiba taxas de gas em USDC** para melhor experiência do usuário
3. **Busque o base fee dinamicamente** ao enviar transações

### Exemplo de Configuração

```typescript
// Exemplo usando viem
const transaction = {
  to: contractAddress,
  data: encodedData,
  maxFeePerGas: parseUnits("160", "gwei"), // Mínimo: 160 Gwei
  maxPriorityFeePerGas: parseUnits("2", "gwei"), // Opcional
};
```

## 📈 Monitoramento de Gas

Você pode visualizar métricas de gas em tempo real usando:
- **[Arc Gas Tracker](https://testnet.arcscan.app/gas-tracker)**: Visualize métricas de gas e médias recentes

## 💡 Diferenças Importantes

### USDC Nativo vs ERC-20

| Tipo | Decimais | Uso |
|------|----------|-----|
| **USDC Nativo (Gas)** | 18 | Usado para pagar taxas de transação |
| **USDC ERC-20** | 6 | Interface ERC-20 padrão para transferências |

**Recomendação:** Para aplicações, use apenas a interface ERC-20 padrão para ler saldos e enviar transferências.

### Endereços de Contratos

- **USDC ERC-20**: `0x3600000000000000000000000000000000000000`
- **EURC**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` (6 decimais)

## 🔗 Recursos

- [Gas and Fees - Documentação Oficial](https://docs.arc.network/arc/references/gas-and-fees)
- [Contract Addresses - Documentação Oficial](https://docs.arc.network/arc/references/contract-addresses)
- [Stable Fee Design - Conceitos](https://docs.arc.network/arc/concepts/stable-fee-design)
- [Arc Gas Tracker](https://testnet.arcscan.app/gas-tracker)

## ⚠️ Nota Importante

Esta configuração se aplica à **Arc Testnet** e pode evoluir conforme os parâmetros da rede são ajustados para o lançamento da mainnet.

