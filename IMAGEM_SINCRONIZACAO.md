# 📸 Sistema de Sincronização de Imagens

## Problema
As imagens estavam sendo salvas apenas no `localStorage` local, então cada usuário só via as imagens que ele mesmo salvou.

## Solução Implementada

### 1. Upload para ImgBB
- Imagens são enviadas para o ImgBB (serviço gratuito)
- URLs públicas acessíveis para todos

### 2. Sincronização via JSONBin.io (Opcional)
- URLs das imagens são sincronizadas via JSONBin.io
- Permite que todos os usuários vejam as imagens

## Configuração Rápida (Recomendada)

### Opção 1: Apenas ImgBB (Mais Simples)
1. Obtenha chave do ImgBB: https://api.imgbb.com/
2. Configure no `.env.local`:
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_aqui
```
3. As imagens serão públicas e acessíveis por URL

### Opção 2: ImgBB + JSONBin (Sincronização Completa)
1. Configure ImgBB (passo acima)
2. Crie conta no JSONBin: https://jsonbin.io/
3. Crie um bin público
4. Configure no `.env.local`:
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_imgbb
NEXT_PUBLIC_JSONBIN_BIN_ID=seu_bin_id
NEXT_PUBLIC_JSONBIN_API_KEY=sua_chave_jsonbin (opcional)
```

## Como Funciona

1. **Upload da Imagem:**
   - Quando você cria um mercado com imagem, ela é enviada para o ImgBB
   - Você recebe uma URL pública (ex: `https://i.ibb.co/...`)

2. **Armazenamento:**
   - URL é salva no localStorage (local)
   - Se JSONBin configurado, URL é sincronizada (compartilhada)

3. **Visualização:**
   - Todos os usuários podem acessar a URL do ImgBB
   - Se JSONBin configurado, URLs são buscadas de lá primeiro

## Nota Importante

**Sem configuração:** As imagens ainda funcionam, mas apenas localmente (cada usuário vê apenas as que ele criou).

**Com ImgBB configurado:** As imagens ficam públicas e todos podem ver (mesmo sem JSONBin).

**Com ImgBB + JSONBin:** Sincronização completa - todos veem todas as imagens.

