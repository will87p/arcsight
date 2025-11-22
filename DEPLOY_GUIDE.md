# 🚀 Guia de Deploy para GitHub Pages

## ✅ Checklist antes do Deploy

1. ✅ Workflow do GitHub Actions configurado (`.github/workflows/deploy.yml`)
2. ✅ Next.js configurado para static export (`next.config.ts`)
3. ✅ Variáveis de ambiente configuradas no workflow
4. ✅ Footer e traduções implementadas
5. ✅ Todas as funcionalidades testadas localmente

## 📋 Passos para Fazer o Deploy

### 1. Verificar se está no repositório correto
```bash
git remote -v
```

### 2. Adicionar e commitar todas as mudanças
```bash
git add .
git commit -m "feat: adicionar suporte a múltiplos idiomas, footer e botão faucet"
```

### 3. Fazer push para o GitHub
```bash
git push origin main
# ou
git push origin master
```

### 4. Verificar o Deploy

1. Acesse: `https://github.com/[seu-usuario]/arcsight/actions`
2. Aguarde o workflow completar (pode levar 2-5 minutos)
3. Verifique se o build foi bem-sucedido
4. Acesse o site: `https://[seu-usuario].github.io/arcsight/`

## ⚙️ Configurações do GitHub Pages

1. Vá em: **Settings** → **Pages**
2. Verifique se está configurado:
   - **Source**: GitHub Actions
   - **Branch**: main/master

## 🔧 Variáveis de Ambiente (Opcional)

Se quiser usar secrets do GitHub (recomendado para produção):

1. Vá em: **Settings** → **Secrets and variables** → **Actions**
2. Adicione os secrets (se necessário):
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_ARC_RPC_URL`
   - `NEXT_PUBLIC_ARC_CHAIN_ID`

**Nota**: O workflow já tem valores padrão, então não é obrigatório configurar secrets.

## 📝 Notas Importantes

- O site será acessível em: `https://[seu-usuario].github.io/arcsight/`
- O build gera arquivos estáticos na pasta `packages/nextjs/out`
- O deploy é automático a cada push na branch `main` ou `master`
- Você também pode fazer deploy manual via **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## 🐛 Troubleshooting

Se o deploy falhar:

1. Verifique os logs em **Actions**
2. Certifique-se de que o Node.js 20 está sendo usado
3. Verifique se todas as dependências estão instaladas
4. Confirme que o `next.config.ts` está configurado para produção


