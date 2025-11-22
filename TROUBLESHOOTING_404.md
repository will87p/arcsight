# 🔧 Troubleshooting: Erro 404 no GitHub Pages

## ✅ Checklist de Verificação

### 1. Verificar a URL Correta

O site está configurado com `basePath: '/arcsight'`, então a URL correta é:

**✅ URL CORRETA:**
```
https://[seu-usuario].github.io/arcsight/
```

**❌ URL INCORRETA (vai dar 404):**
```
https://[seu-usuario].github.io/
```

### 2. Verificar se o Deploy Foi Concluído

1. Acesse: `https://github.com/[seu-usuario]/arcsight/actions`
2. Verifique se o workflow "Deploy to GitHub Pages" foi executado
3. Verifique se o workflow foi **bem-sucedido** (verde ✓)
4. Se falhou (vermelho ✗), clique para ver os logs de erro

### 3. Verificar Configuração do GitHub Pages

1. Vá em: **Settings** → **Pages**
2. Verifique se está configurado:
   - **Source**: `GitHub Actions` (não "Deploy from a branch")
   - **Branch**: Não deve estar selecionado (deve estar vazio)

### 4. Verificar se o Build Gerou os Arquivos

O build deve gerar arquivos na pasta `packages/nextjs/out/`. Verifique nos logs do workflow se:
- O build foi concluído com sucesso
- A pasta `out/` foi criada
- Os arquivos foram enviados para o artifact

### 5. Verificar Logs do Workflow

Se o workflow falhou, verifique os logs:

1. Acesse: `https://github.com/[seu-usuario]/arcsight/actions`
2. Clique no workflow que falhou
3. Clique em "build" ou "deploy"
4. Procure por erros em vermelho

## 🔍 Problemas Comuns e Soluções

### Problema 1: "404 Not Found" na URL raiz

**Causa:** Tentando acessar `https://[usuario].github.io/` em vez de `https://[usuario].github.io/arcsight/`

**Solução:** Use a URL completa com `/arcsight/` no final

### Problema 2: Workflow não executou

**Causa:** Push não foi feito ou branch incorreta

**Solução:**
1. Verifique se fez push para `main` ou `master`
2. Vá em **Actions** → **Deploy to GitHub Pages** → **Run workflow** (deploy manual)

### Problema 3: Build falhou

**Causa:** Erro de compilação ou dependências

**Solução:**
1. Verifique os logs do workflow
2. Procure por erros de TypeScript ou dependências
3. Certifique-se de que todos os arquivos foram commitados

### Problema 4: GitHub Pages não está habilitado

**Causa:** GitHub Pages não foi habilitado no repositório

**Solução:**
1. Vá em **Settings** → **Pages**
2. Se não aparecer a opção, o repositório pode ser privado
3. Para repositórios privados, você precisa do GitHub Pro ou fazer o repositório público

### Problema 5: Deploy ainda está em andamento

**Causa:** O deploy pode levar 2-5 minutos

**Solução:**
1. Aguarde alguns minutos
2. Recarregue a página
3. Verifique o status em **Actions**

## 📝 Passos para Resolver

1. **Verifique a URL:**
   - Use: `https://[seu-usuario].github.io/arcsight/`
   - Não use: `https://[seu-usuario].github.io/`

2. **Verifique o Deploy:**
   - Acesse: `https://github.com/[seu-usuario]/arcsight/actions`
   - Veja se o último workflow foi bem-sucedido

3. **Se o workflow falhou:**
   - Clique no workflow
   - Veja os logs de erro
   - Corrija o problema
   - Faça push novamente

4. **Se o workflow não executou:**
   - Faça um novo commit e push
   - Ou execute manualmente: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

5. **Se ainda não funcionar:**
   - Verifique se o repositório é público (ou você tem GitHub Pro)
   - Verifique se GitHub Pages está habilitado em **Settings** → **Pages**

## 🔗 Links Úteis

- Actions: `https://github.com/[seu-usuario]/arcsight/actions`
- Settings: `https://github.com/[seu-usuario]/arcsight/settings/pages`
- Site: `https://[seu-usuario].github.io/arcsight/`

