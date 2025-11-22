# 📊 ArcSight - Mercado de Previsão Descentralizado

## 🎯 O que é?

**ArcSight** é um dApp (aplicativo descentralizado) de **mercado de previsão** (prediction market) desenvolvido para a blockchain **Arc Network**. 

Permite que usuários criem mercados de previsão sobre eventos futuros, apostem em resultados (SIM/NÃO) e resgatem ganhos proporcionalmente após a resolução dos mercados.

## ✨ Funcionalidades Principais

### 🏗️ Criar Mercados
- Qualquer usuário pode criar um mercado de previsão
- Define uma descrição do evento e uma data de resolução
- Exemplo: "O Bitcoin atingirá $100.000 até o final de 2024?"

### 💰 Apostar
- Usuários podem apostar em **SIM** ou **NÃO**
- Apostas podem ser de qualquer valor (em USDC na rede Arc)
- O pote total é a soma de todas as apostas

### ✅ Resolver Mercados
- Após a data de resolução, o criador do mercado (oráculo) pode resolver o mercado
- Define qual foi o resultado vencedor (SIM ou NÃO)

### 🎁 Resgatar Ganhos
- Vencedores podem resgatar seus ganhos proporcionalmente
- Cálculo: `(Sua aposta / Total do lado vencedor) × Pote Total`
- Perdedores não recebem nada

## 🛠️ Tecnologias

### Backend (Blockchain)
- **Solidity** ^0.8.20 - Contrato inteligente
- **Hardhat** - Framework de desenvolvimento
- **Arc Network** - Blockchain de destino (usa USDC como gas)

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Viem** - Interação com blockchain
- **MetaMask** - Conexão de carteira

## 🌐 Rede Arc

- **Moeda nativa**: USDC (18 decimais)
- **Testnet Chain ID**: 5042002
- **RPC URL**: https://rpc.testnet.arc.network
- **Explorador**: https://testnet.arcscan.app

## 📱 Interface

- **Página Principal**: Lista todos os mercados abertos
- **Criar Mercado**: Formulário para criar novos mercados
- **Detalhes do Mercado**: Visualização completa com opções de aposta e resgate
- **Conexão de Carteira**: Integração com MetaMask

## 🔒 Segurança

- Prevenção de reentrância
- Validações de entrada
- Controle de acesso (apenas oráculo resolve)
- Prevenção de resgates duplos

## 🚀 Deploy

O projeto está configurado para deploy no **GitHub Pages**:
- Site: `https://oxwill.github.io`
- Deploy automático via GitHub Actions
- Build estático otimizado

## 📝 Exemplo de Uso

1. **Criar um mercado**: "A temperatura em São Paulo será acima de 30°C amanhã?"
2. **Apostadores**: Usuários apostam em SIM ou NÃO
3. **Resolução**: Após amanhã, o criador resolve o mercado
4. **Resgate**: Vencedores resgatam seus ganhos proporcionalmente

## 🎯 Casos de Uso

- Previsões esportivas
- Eventos políticos
- Previsões de mercado financeiro
- Eventos climáticos
- Qualquer evento com resultado binário (SIM/NÃO)

---

**Desenvolvido para a blockchain Arc Network** 🚀




