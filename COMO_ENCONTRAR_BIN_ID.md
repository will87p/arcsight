# 🔍 Como Encontrar o Bin ID no JSONBin

## Passo a Passo

### 1. Criar o Bin
1. No painel "Criar Um Bin" (que está aberto), cole este JSON:
```json
{
  "images": []
}
```

2. **IMPORTANTE:** Clique no ícone de **cadeado (lock)** no topo direito do painel
3. Selecione **"Público"** (Public) - isso permite que todos leiam o bin
4. Clique no botão **"Save Bin"** (Salvar Bin)

### 2. Encontrar o Bin ID

**Opção A: Na URL (Mais Fácil)**
- Após salvar, a URL do navegador mudará
- O ID estará na URL, exemplo:
  ```
  https://jsonbin.io/app/bins/65a1b2c3d4e5f6g7h8i9j0k
  ```
- O ID é: `65a1b2c3d4e5f6g7h8i9j0k` (a parte após `/bins/`)

**Opção B: Na Lista de Bins**
- Após criar, volte para a lista de "Caixas" (Bins)
- O ID aparecerá na coluna "ID do compartimento" (Bin ID)
- Copie esse ID

**Opção C: No Editor do Bin**
- Clique no bin que você criou
- O ID aparecerá no topo da página ou na URL

### 3. Usar o Bin ID

Copie o ID e use no `.env.local`:
```env
NEXT_PUBLIC_JSONBIN_BIN_ID=65a1b2c3d4e5f6g7h8i9j0k
```

## ⚠️ Importante

- O bin **DEVE** ser **Público** (não privado)
- O JSON inicial deve ter a estrutura: `{ "images": [] }`
- O ID é a parte longa após `/bins/` na URL

