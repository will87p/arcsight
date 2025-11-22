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

// GitHub Raw Content como fallback (usa arquivo JSON no repositório)
// Formato: https://raw.githubusercontent.com/USER/REPO/BRANCH/path/to/file.json
const GITHUB_RAW_URL = process.env.NEXT_PUBLIC_GITHUB_IMAGES_URL || '';

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
  // Verificar se a chave está configurada
  if (!IMGBB_API_KEY || IMGBB_API_KEY === '') {
    console.warn('[uploadImageToImgBB] ⚠️ Chave de API ImgBB não configurada.');
    console.warn('[uploadImageToImgBB] Configure NEXT_PUBLIC_IMGBB_API_KEY no .env.local');
    console.warn('[uploadImageToImgBB] ⚠️ IMPORTANTE: Reinicie o servidor Next.js após adicionar variáveis no .env.local');
    return null;
  }

  try {
    // Converter data URL para base64 puro (remover o prefixo data:image/...;base64,)
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    // ImgBB aceita base64 via FormData (método recomendado)
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);

    console.log('[uploadImageToImgBB] Fazendo upload para ImgBB...');
    console.log('[uploadImageToImgBB] Chave API configurada:', IMGBB_API_KEY ? 'Sim' : 'Não');
    console.log('[uploadImageToImgBB] Chave API (primeiros 10 chars):', IMGBB_API_KEY ? IMGBB_API_KEY.substring(0, 10) + '...' : 'N/A');
    console.log('[uploadImageToImgBB] Tamanho do base64:', base64Data.length, 'caracteres');

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[uploadImageToImgBB] Erro na resposta:', response.status, response.statusText);
      console.error('[uploadImageToImgBB] Detalhes do erro:', errorText);
      throw new Error(`Erro ao fazer upload: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.url) {
      console.log('[uploadImageToImgBB] ✅ Upload bem-sucedido:', data.data.url);
      return data.data.url;
    } else {
      const errorMsg = data.error?.message || data.error || 'Erro desconhecido no upload';
      console.error('[uploadImageToImgBB] Erro na resposta da API:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('[uploadImageToImgBB] ❌ Erro ao fazer upload da imagem:', error);
    console.error('[uploadImageToImgBB] Tipo do erro:', error?.name);
    console.error('[uploadImageToImgBB] Mensagem:', error?.message);
    
    // Se for erro de rede, verificar se a chave está configurada
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      console.warn('[uploadImageToImgBB] ⚠️ Erro de rede. Verifique:');
      console.warn('[uploadImageToImgBB] 1. Conexão com a internet');
      console.warn('[uploadImageToImgBB] 2. Chave da API ImgBB está correta');
      console.warn('[uploadImageToImgBB] 3. A chave não expirou');
    }
    
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
    // IMPORTANTE: Isso permite que outros usuários vejam a imagem
    if (JSONBIN_URL && imageUrl) {
      try {
        console.log(`[saveMarketImage] Sincronizando imagem do mercado ${marketId} no JSONBin...`);
        
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
        console.log(`[saveMarketImage] ✅ Imagem do mercado ${marketId} sincronizada no JSONBin - visível para todos!`);
      } catch (syncError) {
        console.warn(`[saveMarketImage] ⚠️ Erro ao sincronizar no JSONBin:`, syncError);
        console.warn(`[saveMarketImage] A imagem foi salva localmente, mas NÃO será visível para outros usuários.`);
        console.warn(`[saveMarketImage] Verifique se NEXT_PUBLIC_JSONBIN_BIN_ID está configurado corretamente.`);
      }
    } else if (imageUrl && !JSONBIN_URL) {
      console.warn(`[saveMarketImage] ⚠️ JSONBin não configurado.`);
      console.warn(`[saveMarketImage] A imagem foi enviada para ImgBB (${imageUrl}), mas a URL não será compartilhada.`);
      console.warn(`[saveMarketImage] Configure NEXT_PUBLIC_JSONBIN_BIN_ID para que outros usuários vejam as imagens.`);
      console.warn(`[saveMarketImage] Veja SOLUCAO_IMAGENS_SIMPLES.md para instruções.`);
    }
    
    if (imageUrl) {
      console.log(`[saveMarketImage] Imagem do mercado ${marketId} salva no ImgBB: ${imageUrl}`);
    } else {
      console.warn(`[saveMarketImage] Imagem do mercado ${marketId} salva localmente (fallback - apenas você verá)`);
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
 * Busca imagens do GitHub Raw (fallback simples)
 */
async function fetchImagesFromGitHub(): Promise<MarketImage[]> {
  if (!GITHUB_RAW_URL) {
    return [];
  }

  try {
    const response = await fetch(GITHUB_RAW_URL, {
      method: 'GET',
      cache: 'no-store', // Sempre buscar versão mais recente
    });

    if (!response.ok) {
      console.warn('[fetchImagesFromGitHub] Erro ao buscar imagens do GitHub:', response.statusText);
      return [];
    }

    const data = await response.json();
    const images = data.images || data || [];
    
    console.log(`[fetchImagesFromGitHub] ${images.length} imagens encontradas no GitHub`);
    return images as MarketImage[];
  } catch (error) {
    console.warn('[fetchImagesFromGitHub] Erro ao buscar imagens do GitHub:', error);
    return [];
  }
}

/**
 * Busca imagens do JSONBin (armazenamento compartilhado)
 * Exportada para uso em outros componentes
 */
export async function fetchSharedImages(): Promise<MarketImage[]> {
  // Tentar JSONBin primeiro
  if (JSONBIN_URL) {
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

      if (response.ok) {
        const data = await response.json();
        const images = data.record?.images || data.record || [];
        
        // Garantir que é um array
        const imagesArray = Array.isArray(images) ? images : [];
        
        // Filtrar apenas imagens com URLs válidas (http)
        const validImages = imagesArray.filter((img: MarketImage) => 
          img && img.marketId && img.imageUrl && img.imageUrl.startsWith('http')
        );
        
        console.log(`[fetchSharedImages] ${validImages.length} imagens válidas encontradas no JSONBin (de ${imagesArray.length} total)`);
        return images as MarketImage[];
      }
    } catch (error) {
      console.warn('[fetchSharedImages] Erro ao buscar do JSONBin, tentando GitHub...', error);
    }
  }

  // Fallback: tentar GitHub Raw
  if (GITHUB_RAW_URL) {
    try {
      const images = await fetchImagesFromGitHub();
      if (images.length > 0) {
        return images;
      }
    } catch (error) {
      console.warn('[fetchSharedImages] Erro ao buscar do GitHub:', error);
    }
  }

  return [];
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

// Cache para evitar múltiplas requisições ao JSONBin
let sharedImagesCache: MarketImage[] | null = null;
let sharedImagesCacheTime: number = 0;
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Obtém a imagem de um mercado
 * Usa cache do localStorage primeiro, só busca do JSONBin se necessário
 */
export async function getMarketImage(marketId: number): Promise<string | null> {
  try {
    // Primeiro, tentar buscar do localStorage (mais rápido e não depende de API)
    const localImages = getMarketImages();
    const localImage = localImages.find(img => img.marketId === marketId);
    if (localImage?.imageUrl && localImage.imageUrl.startsWith('http')) {
      // Se for URL válida, retornar imediatamente (não fazer requisição)
      return localImage.imageUrl;
    }
    
    // Só buscar do serviço compartilhado se:
    // 1. Não encontrou no localStorage OU
    // 2. Encontrou mas é base64 (precisa migrar)
    // E usar cache para evitar múltiplas requisições
    
    const now = Date.now();
    if (!sharedImagesCache || (now - sharedImagesCacheTime) > CACHE_DURATION) {
      try {
        sharedImagesCache = await fetchSharedImages();
        sharedImagesCacheTime = now;
      } catch (sharedError: any) {
        // Se der erro 429, usar cache antigo se disponível
        if (sharedError?.message?.includes('429') || sharedError?.name === 'TypeError') {
          console.warn(`[getMarketImage] ⚠️ Rate limit ao buscar imagens, usando cache`);
          // Continuar com cache antigo se existir
        } else {
          console.warn(`[getMarketImage] ⚠️ Erro ao buscar do serviço compartilhado:`, sharedError);
        }
      }
    }
    
    // Buscar no cache de imagens compartilhadas
    if (sharedImagesCache && sharedImagesCache.length > 0) {
      const sharedImage = sharedImagesCache.find(img => img.marketId === marketId);
      if (sharedImage?.imageUrl && sharedImage.imageUrl.startsWith('http')) {
        // Salvar no localStorage para cache
        const allImages = getMarketImages();
        const existingIndex = allImages.findIndex(img => img.marketId === marketId);
        if (existingIndex >= 0) {
          allImages[existingIndex] = sharedImage;
        } else {
          allImages.push(sharedImage);
        }
        localStorage.setItem('arcsight_market_images', JSON.stringify(allImages));
        
        return sharedImage.imageUrl;
      }
    }

    // Fallback: retornar do localStorage (mesmo que seja base64)
    if (localImage?.imageUrl) {
      return localImage.imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`[getMarketImage] ❌ Erro ao obter imagem do mercado ${marketId}:`, error);
    // Fallback para localStorage
    const images = getMarketImages();
    const marketImage = images.find(img => img.marketId === marketId);
    return marketImage?.imageUrl || null;
  }
}

/**
 * Limpa o cache de imagens compartilhadas (útil após sincronização)
 */
export function clearSharedImagesCache(): void {
  sharedImagesCache = null;
  sharedImagesCacheTime = 0;
}

/**
 * Obtém todas as imagens de mercados
 */
/**
 * Migra imagens antigas (base64) para ImgBB e sincroniza no JSONBin
 * Esta função é chamada automaticamente para converter imagens locais em URLs públicas
 */
export async function migrateOldImages(): Promise<void> {
  try {
    console.log('[migrateOldImages] Iniciando migração de imagens antigas...');
    
    const localImages = getMarketImages();
    const imagesToMigrate = localImages.filter(img => 
      img.imageUrl && !img.imageUrl.startsWith('http')
    );
    
    if (imagesToMigrate.length === 0) {
      console.log('[migrateOldImages] Nenhuma imagem antiga para migrar');
      return;
    }
    
    console.log(`[migrateOldImages] Encontradas ${imagesToMigrate.length} imagens antigas para migrar`);
    
    let migratedCount = 0;
    for (const image of imagesToMigrate) {
      try {
        console.log(`[migrateOldImages] Migrando imagem do mercado ${image.marketId}...`);
        
        // Fazer upload para ImgBB
        const uploadedUrl = await uploadImageToImgBB(image.imageUrl);
        
        if (uploadedUrl) {
          // Atualizar no localStorage
          const allImages = getMarketImages();
          const imageIndex = allImages.findIndex(img => img.marketId === image.marketId);
          if (imageIndex >= 0) {
            allImages[imageIndex].imageUrl = uploadedUrl;
            allImages[imageIndex].timestamp = Date.now();
            localStorage.setItem('arcsight_market_images', JSON.stringify(allImages));
            console.log(`[migrateOldImages] ✅ Imagem do mercado ${image.marketId} migrada:`, uploadedUrl.substring(0, 50) + '...');
            migratedCount++;
            
            // Sincronizar no JSONBin
            if (JSONBIN_URL) {
              try {
                const sharedImages = await fetchSharedImages();
                const existingIndex = sharedImages.findIndex(img => img.marketId === image.marketId);
                const updatedImage: MarketImage = {
                  marketId: image.marketId,
                  imageUrl: uploadedUrl,
                  timestamp: Date.now(),
                };
                
                if (existingIndex >= 0) {
                  sharedImages[existingIndex] = updatedImage;
                } else {
                  sharedImages.push(updatedImage);
                }
                
                await saveSharedImages(sharedImages);
                console.log(`[migrateOldImages] ✅ Imagem do mercado ${image.marketId} sincronizada no JSONBin`);
              } catch (syncError) {
                console.warn(`[migrateOldImages] ⚠️ Erro ao sincronizar no JSONBin:`, syncError);
              }
            }
          }
        } else {
          console.warn(`[migrateOldImages] ⚠️ Falha ao fazer upload da imagem do mercado ${image.marketId}`);
        }
        
        // Aguardar um pouco entre uploads para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[migrateOldImages] ❌ Erro ao migrar imagem do mercado ${image.marketId}:`, error);
      }
    }
    
    console.log(`[migrateOldImages] ✅ Migração concluída: ${migratedCount}/${imagesToMigrate.length} imagens migradas`);
  } catch (error) {
    console.error('[migrateOldImages] ❌ Erro na migração:', error);
  }
}

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
