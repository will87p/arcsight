# 🚀 Deploy no GitHub Pages

Guia rápido para fazer deploy do ArcSight no GitHub Pages.

## 📋 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e crie um novo repositório
2. **Opção A**: Se quiser `username.github.io`:
   - Crie um repositório com o nome exato: `seu-usuario.github.io`
   - Exemplo: `oxwill.github.io`
   
3. **Opção B**: Se quiser `username.github.io/nome-do-projeto`:
   - Crie um repositório com qualquer nome
   - Exemplo: `arcsight`
   - O site ficará em: `username.github.io/arcsight`

### 2. Configurar basePath (se necessário)

Se você escolheu a **Opção B**, edite `packages/nextjs/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  basePath: '/nome-do-seu-repositorio', // Ex: '/arcsight'
  output: 'export',
  // ... resto da config
};
```

**Se escolheu Opção A** (`username.github.io`), não precisa fazer nada - o basePath será detectado automaticamente.

### 3. Fazer Push do Código

```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Configure GitHub Pages"

# Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Push
git push -u origin main
```

### 4. Habilitar GitHub Pages

1. No GitHub, vá em **Settings** → **Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Salve

### 5. Aguardar Deploy

1. Vá em **Actions** no GitHub
2. Aguarde o workflow "Deploy to GitHub Pages" completar
3. O site estará disponível em:
   - `https://seu-usuario.github.io` (Opção A)
   - `https://seu-usuario.github.io/nome-do-repositorio` (Opção B)

## ⚙️ Configuração de Variáveis (Opcional)

Se quiser usar variáveis de ambiente diferentes no deploy:

1. No GitHub, vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os secrets:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_ARC_RPC_URL`
   - `NEXT_PUBLIC_ARC_CHAIN_ID`

**Valores padrão** (usados se não configurar):
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: `0x63D158dA4c1C33A8F0F6726Ef698058b535B76fC`
- `NEXT_PUBLIC_NETWORK`: `arc`
- `NEXT_PUBLIC_ARC_RPC_URL`: `https://rpc.testnet.arc.network`
- `NEXT_PUBLIC_ARC_CHAIN_ID`: `5042002`

## 🔄 Deploy Automático

Após configurar, cada push para `main` ou `master` fará deploy automaticamente!

## 📝 Notas

- O build pode levar 2-5 minutos
- O site será atualizado automaticamente após cada push
- Verifique os logs em **Actions** se houver problemas

