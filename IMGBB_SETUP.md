# 📸 Configuração do ImgBB para Upload de Imagens

## Problema
As imagens estavam sendo salvas apenas no `localStorage` local, então cada usuário só via as imagens que ele mesmo salvou. Outros usuários não conseguiam ver as imagens dos mercados criados por outras pessoas.

## Solução
Implementamos upload de imagens para o serviço **ImgBB**, que é gratuito e permite que todas as imagens sejam acessíveis publicamente.

## Como Configurar

### 1. Obter Chave de API do ImgBB

1. Acesse: https://api.imgbb.com/
2. Clique em "Get API Key"
3. Faça login ou crie uma conta (gratuito)
4. Copie sua chave de API

### 2. Configurar no Projeto

**Para desenvolvimento local:**
1. Crie/edite o arquivo `packages/nextjs/.env.local`
2. Adicione:
```env
NEXT_PUBLIC_IMGBB_API_KEY=sua_chave_aqui
```

**Para produção (GitHub Pages):**
1. Vá em: **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Nome: `NEXT_PUBLIC_IMGBB_API_KEY`
4. Valor: sua chave do ImgBB
5. Atualize o workflow `.github/workflows/deploy.yml` para incluir:
```yaml
NEXT_PUBLIC_IMGBB_API_KEY: ${{ secrets.NEXT_PUBLIC_IMGBB_API_KEY }}
```

### 3. Como Funciona

- **Com chave configurada:** As imagens são enviadas para o ImgBB e ficam acessíveis para todos
- **Sem chave:** As imagens são salvas localmente (fallback) - apenas o criador vê

### 4. Limites do Plano Gratuito

- 32 MB por upload
- Sem limite de uploads
- Imagens públicas (acessíveis por URL)
- Sem expiração automática

## Alternativas

Se preferir usar outro serviço:
- **IPFS** (descentralizado, gratuito)
- **Cloudinary** (plano gratuito disponível)
- **AWS S3** (pago, mas muito confiável)

