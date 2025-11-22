/**
 * Sistema de armazenamento de imagens para mercados
 * Usa ImgBB API para armazenar imagens de forma centralizada
 * API Key gratuita disponível em: https://api.imgbb.com/
 */

// Chave da API ImgBB - pode ser configurada via variável de ambiente
// Obtenha sua chave gratuita em: https://api.imgbb.com/
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// JSONBin.io para sincronização compartilhada (opcional - pode deixar vazio)
// Se não configurado, as imagens do ImgBB ainda funcionam (URLs públicas)
const JSONBIN_BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID || '';
const JSONBIN_API_KEY = process.env.NEXT_PUBLIC_JSONBIN_API_KEY || '';
const JSONBIN_URL = JSONBIN_BIN_ID 
  ? `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`
  : null;

export interface MarketImage {
  marketId: number;
  imageUrl: string; // URL da imagem no ImgBB
  timestamp: number;
}

/**
 * Faz upload da imagem para ImgBB e retorna a URL
 * Se não houver chave de API configurada, retorna null (usa fallback local)
 */
export async function uploadImageToImgBB(base64Image: string): Promise<string | null> {
  // Se não houver chave de API, retornar null para usar fallback
  if (!IMGBB_API_KEY || IMGBB_API_KEY === '') {
    console.warn('[uploadImageToImgBB] Chave de API ImgBB não configurada. Use NEXT_PUBLIC_IMGBB_API_KEY no .env.local');
    return null;
  }

  try {
    // Converter data URL para base64 puro (remover o prefixo data:image/...;base64,)
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    // ImgBB aceita base64 diretamente via query parameter
    const params = new URLSearchParams();
    params.append('key', IMGBB_API_KEY);
    params.append('image', base64Data);

    const response = await fetch(`${IMGBB_UPLOAD_URL}?${params.toString()}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao fazer upload: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.url) {
      console.log('[uploadImageToImgBB] Upload bem-sucedido:', data.data.url);
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Erro desconhecido no upload');
    }
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    // Retornar null em caso de erro para usar fallback local
    return null;
  }
}

/**
 * Salva a imagem de um mercado (faz upload e armazena a URL)
 */
export async function saveMarketImage(marketId: number, base64Image: string): Promise<void> {
  try {
    // Tentar fazer upload da imagem para ImgBB
    const imageUrl = await uploadImageToImgBB(base64Image);
    
    // Usar URL do ImgBB se disponível, senão usar base64 local como fallback
    const finalImageUrl = imageUrl || base64Image;
    
    // Salvar no localStorage (local)
    const localImages = getMarketImages();
    const existingLocalIndex = localImages.findIndex(img => img.marketId === marketId);
    
    const marketImage: MarketImage = {
      marketId,
      imageUrl: finalImageUrl, // URL do ImgBB ou base64 local
      timestamp: Date.now(),
    };

    if (existingLocalIndex >= 0) {
      localImages[existingLocalIndex] = marketImage;
    } else {
      localImages.push(marketImage);
    }

    localStorage.setItem('arcsight_market_images', JSON.stringify(localImages));
    
    // Tentar salvar no JSONBin (compartilhado) se configurado
    if (JSONBIN_URL && imageUrl) {
      try {
        // Buscar imagens existentes do JSONBin
        const sharedImages = await fetchSharedImages();
        
        // Adicionar ou atualizar a imagem
        const existingSharedIndex = sharedImages.findIndex(img => img.marketId === marketId);
        if (existingSharedIndex >= 0) {
          sharedImages[existingSharedIndex] = marketImage;
        } else {
          sharedImages.push(marketImage);
        }
        
        // Salvar de volta no JSONBin
        await saveSharedImages(sharedImages);
        console.log(`[saveMarketImage] Imagem do mercado ${marketId} sincronizada no JSONBin`);
      } catch (syncError) {
        console.warn(`[saveMarketImage] Erro ao sincronizar no JSONBin (continuando):`, syncError);
      }
    }
    
    if (imageUrl) {
      console.log(`[saveMarketImage] Imagem do mercado ${marketId} salva no ImgBB: ${imageUrl}`);
    } else {
      console.warn(`[saveMarketImage] Imagem do mercado ${marketId} salva localmente (fallback)`);
    }
  } catch (error) {
    console.error('Erro ao salvar imagem do mercado:', error);
    // Em caso de erro, salvar como base64 localmente como fallback
    const images = getMarketImages();
    const existingIndex = images.findIndex(img => img.marketId === marketId);
    
    const marketImage: MarketImage = {
      marketId,
      imageUrl: base64Image, // Fallback para base64 local
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      images[existingIndex] = marketImage;
    } else {
      images.push(marketImage);
    }

    localStorage.setItem('arcsight_market_images', JSON.stringify(images));
    // Não relançar o erro - já salvamos localmente como fallback
  }
}

/**
 * Busca imagens do JSONBin (armazenamento compartilhado)
 */
async function fetchSharedImages(): Promise<MarketImage[]> {
  if (!JSONBIN_URL) {
    return [];
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (JSONBIN_API_KEY) {
      headers['X-Master-Key'] = JSONBIN_API_KEY;
    }

    const response = await fetch(`${JSONBIN_URL}/latest`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('[fetchSharedImages] Erro ao buscar imagens compartilhadas:', response.statusText);
      return [];
    }

    const data = await response.json();
    const images = data.record?.images || data.record || [];
    
    console.log(`[fetchSharedImages] ${images.length} imagens encontradas no JSONBin`);
    return images as MarketImage[];
  } catch (error) {
    console.warn('[fetchSharedImages] Erro ao buscar imagens compartilhadas:', error);
    return [];
  }
}

/**
 * Salva imagens no JSONBin (armazenamento compartilhado)
 */
async function saveSharedImages(images: MarketImage[]): Promise<void> {
  if (!JSONBIN_URL) {
    return;
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (JSONBIN_API_KEY) {
      headers['X-Master-Key'] = JSONBIN_API_KEY;
    }

    const response = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ images }),
    });

    if (!response.ok) {
      console.warn('[saveSharedImages] Erro ao salvar imagens compartilhadas:', response.statusText);
      return;
    }

    console.log('[saveSharedImages] Imagens salvas no JSONBin com sucesso');
  } catch (error) {
    console.warn('[saveSharedImages] Erro ao salvar imagens compartilhadas:', error);
  }
}

/**
 * Obtém a imagem de um mercado
 * Primeiro tenta buscar do JSONBin (compartilhado), depois do localStorage (local)
 */
export async function getMarketImage(marketId: number): Promise<string | null> {
  try {
    // Primeiro, tentar buscar do JSONBin (compartilhado)
    if (JSONBIN_URL) {
      const sharedImages = await fetchSharedImages();
      const sharedImage = sharedImages.find(img => img.marketId === marketId);
      if (sharedImage?.imageUrl) {
        // Verificar se é uma URL válida (não base64 local)
        if (sharedImage.imageUrl.startsWith('http')) {
          return sharedImage.imageUrl;
        }
      }
    }

    // Fallback: buscar do localStorage (local)
    const images = getMarketImages();
    const marketImage = images.find(img => img.marketId === marketId);
    return marketImage?.imageUrl || null;
  } catch (error) {
    console.error('Erro ao obter imagem do mercado:', error);
    // Fallback para localStorage
    const images = getMarketImages();
    const marketImage = images.find(img => img.marketId === marketId);
    return marketImage?.imageUrl || null;
  }
}

/**
 * Obtém todas as imagens de mercados
 */
export function getMarketImages(): MarketImage[] {
  try {
    const stored = localStorage.getItem('arcsight_market_images');
    if (!stored) return [];
    return JSON.parse(stored) as MarketImage[];
  } catch (error) {
    console.error('Erro ao obter imagens dos mercados:', error);
    return [];
  }
}

/**
 * Remove a imagem de um mercado
 */
export function removeMarketImage(marketId: number): void {
  try {
    const images = getMarketImages();
    const filtered = images.filter(img => img.marketId !== marketId);
    localStorage.setItem('arcsight_market_images', JSON.stringify(filtered));
  } catch (error) {
    console.error('Erro ao remover imagem do mercado:', error);
  }
}

/**
 * Converte um arquivo de imagem para base64 data URL
 */
export function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Erro ao converter imagem'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Imagem muito grande. Tamanho máximo: 5MB.',
    };
  }

  return { valid: true };
}
