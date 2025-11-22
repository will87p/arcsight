# 📸 Solução Simples para Compartilhar Imagens

## Problema Atual
As imagens estão sendo salvas apenas no `localStorage` local, então cada usuário só vê as imagens que ele mesmo criou.

## Solução Rápida (Recomendada)

### Opção 1: Usar Apenas ImgBB (Mais Simples)

**Como funciona:**
1. Quando você cria um mercado com imagem, ela é enviada para o ImgBB
2. A URL pública é salva no localStorage local
3. **PROBLEMA:** Outros usuários não têm essa URL no localStorage deles

**Solução Temporária:**
- Compartilhe manualmente as URLs das imagens
- Ou configure o JSONBin (veja abaixo)

### Opção 2: Configurar JSONBin (Recomendado)

**Passo a Passo:**

1. **Criar conta no JSONBin:**
   - Acesse: https://jsonbin.io/
   - Crie uma conta gratuita
   - Crie um novo "Bin" (público)

2. **Obter o Bin ID:**
   - Após criar o bin, copie o ID (ex: `65a1b2c3d4e5f6g7h8i9j0k`)
   - O bin deve ser **público** (não privado)

3. **Configurar no Projeto:**

   **Para desenvolvimento local:**
   - Edite `packages/nextjs/.env.local`:
   ```env
   NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_imgbb
   NEXT_PUBLIC_JSONBIN_BIN_ID=seu_bin_id
   ```

   **Para produção (GitHub Pages):**
   - Vá em: **Settings** → **Secrets and variables** → **Actions**
   - Adicione:
     - `NEXT_PUBLIC_IMGBB_API_KEY` = sua chave do ImgBB
     - `NEXT_PUBLIC_JSONBIN_BIN_ID` = seu bin ID do JSONBin
   - Atualize `.github/workflows/deploy.yml` (já está configurado)

4. **Como Funciona:**
   - Quando você cria um mercado com imagem:
     1. Imagem é enviada para ImgBB → URL pública
     2. URL é salva no JSONBin → compartilhada com todos
   - Quando outros usuários acessam:
     1. Mercados são carregados do contrato
     2. URLs das imagens são buscadas do JSONBin
     3. Imagens são exibidas para todos

## Configuração Mínima Necessária

**Apenas ImgBB (obrigatório):**
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_aqui
```

**Com sincronização completa (recomendado):**
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_aqui
NEXT_PUBLIC_JSONBIN_BIN_ID=seu_bin_id
```

## Teste

1. Configure as variáveis de ambiente
2. Crie um mercado com imagem
3. Abra em outro navegador/computador
4. A imagem deve aparecer para todos

