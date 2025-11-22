/**
 * Sistema de armazenamento de imagens para mercados
 * Usa localStorage para armazenar imagens como base64
 * Em produção, isso pode ser migrado para IPFS ou outro serviço
 */

const STORAGE_KEY = 'arcsight_market_images';

export interface MarketImage {
  marketId: number;
  imageUrl: string; // base64 data URL ou URL externa
  timestamp: number;
}

/**
 * Salva a imagem de um mercado
 */
export function saveMarketImage(marketId: number, imageUrl: string): void {
  try {
    const images = getMarketImages();
    const existingIndex = images.findIndex(img => img.marketId === marketId);
    
    const marketImage: MarketImage = {
      marketId,
      imageUrl,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      images[existingIndex] = marketImage;
    } else {
      images.push(marketImage);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Erro ao salvar imagem do mercado:', error);
  }
}

/**
 * Obtém a imagem de um mercado
 */
export function getMarketImage(marketId: number): string | null {
  try {
    const images = getMarketImages();
    const marketImage = images.find(img => img.marketId === marketId);
    return marketImage?.imageUrl || null;
  } catch (error) {
    console.error('Erro ao obter imagem do mercado:', error);
    return null;
  }
}

/**
 * Obtém todas as imagens de mercados
 */
export function getMarketImages(): MarketImage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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

