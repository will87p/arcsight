# Deploy no GitHub Pages

Este guia explica como fazer deploy do ArcSight no GitHub Pages.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Repositório criado no GitHub
3. Código commitado e enviado para o repositório

## 🚀 Configuração

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Crie um novo repositório (pode ser público ou privado)
3. Se quiser usar `username.github.io`, crie um repositório com esse nome exato
4. Se quiser usar `username.github.io/nome-do-projeto`, crie um repositório com qualquer nome

### 2. Configurar basePath (se necessário)

Se o repositório **NÃO** for `username.github.io`, você precisa configurar o `basePath`:

1. Abra `packages/nextjs/next.config.ts`
2. Descomente e ajuste a linha `basePath`:

```typescript
const nextConfig: NextConfig = {
  basePath: '/nome-do-seu-repositorio', // Ex: '/arcsight'
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};
```

**Importante:** Se o repositório for `username.github.io`, deixe `basePath` comentado ou remova.

### 3. Configurar Secrets do GitHub (Opcional)

Para usar variáveis de ambiente no build, configure os secrets:

1. No GitHub, vá em **Settings** → **Secrets and variables** → **Actions**
2. Adicione os seguintes secrets (opcional, os valores padrão serão usados se não configurar):
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_ARC_RPC_URL`
   - `NEXT_PUBLIC_ARC_CHAIN_ID`

### 4. Habilitar GitHub Pages

1. No GitHub, vá em **Settings** → **Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Salve

### 5. Fazer Push do Código

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

## 🔄 Deploy Automático

Após configurar, cada push para a branch `main` ou `master` irá:

1. Fazer build do Next.js
2. Gerar arquivos estáticos
3. Fazer deploy no GitHub Pages

O site estará disponível em:
- `https://username.github.io` (se o repositório for `username.github.io`)
- `https://username.github.io/nome-do-repositorio` (se usar basePath)

## 📝 Notas Importantes

1. **Variáveis de Ambiente**: Os valores padrão estão no workflow. Para mudar, configure os secrets do GitHub.

2. **Contrato**: O endereço do contrato padrão é `0x63D158dA4c1C33A8F0F6726Ef698058b535B76fC` (contrato deployado na Arc Testnet).

3. **Rede**: Por padrão, o site está configurado para usar a rede Arc Testnet.

4. **Build Time**: O build pode levar alguns minutos na primeira vez.

## 🐛 Troubleshooting

### Erro: "basePath not found"
- Verifique se o `basePath` no `next.config.ts` corresponde ao nome do repositório

### Site não atualiza
- Aguarde alguns minutos após o push
- Verifique se o workflow foi executado em **Actions**

### Erro no build
- Verifique os logs em **Actions** → **Deploy to GitHub Pages**
- Certifique-se de que todas as dependências estão no `package.json`

