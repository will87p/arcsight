export type Language = 'pt-BR' | 'en-US';

export interface Translations {
  // Header
  header: {
    connectWallet: string;
    connecting: string;
    copyAddress: string;
    disconnect: string;
    walletConnected: string;
    searchMarkets: string;
    markets: string;
    createMarket: string;
      faucetUSDC: string;
  };
  
  // Filter Bar
  filters: {
    trending: string;
    new: string;
    all: string;
    politics: string;
    sports: string;
    culture: string;
    crypto: string;
    climate: string;
    economy: string;
    mentions: string;
    companies: string;
    finance: string;
    tech: string;
    health: string;
    world: string;
  };
  
  // Home Page
  home: {
    title: string;
    subtitle: string;
    createNewMarket: string;
    totalMarkets: string;
    openMarkets: string;
    totalVolume: string;
    loading: string;
    noMarkets: string;
    noMarketsFiltered: string;
    createFirstMarket: string;
    showing: string;
    of: string;
    markets: string;
    needTestnetUSDC: string;
    faucetDescription: string;
    getUSDC: string;
  };
  
  // Market Card
  marketCard: {
    resolved: string;
    volume: string;
    yes: string;
    no: string;
    betYes: string;
    betNo: string;
    connectToBet: string;
  };
  
  // Create Market
  create: {
    title: string;
    description: string;
    descriptionPlaceholder: string;
    image: string;
    imageOptional: string;
    clickToUpload: string;
    imageFormats: string;
    resolutionTime: string;
    resolutionTimeHelp: string;
    create: string;
    creating: string;
    cancel: string;
    connectWalletFirst: string;
    connectWallet: string;
    success: string;
    redirecting: string;
    viewTransaction: string;
    transactionSent: string;
    checkTransaction: string;
  };
  
  // Market Detail
  detail: {
    back: string;
    totalPot: string;
    status: string;
    resolved: string;
    open: string;
    result: string;
    timeRemaining: string;
    resolutionDate: string;
    creator: string;
    yourBets: string;
    claimWinnings: string;
    claimAvailable: string;
    claiming: string;
    claim: string;
    youAreOracle: string;
    selectWinner: string;
    resolve: string;
    resolving: string;
    resolveMarket: string;
    betOnYes: string;
    betOnNo: string;
    amount: string;
    amountPlaceholder: string;
    bet: string;
    betting: string;
    betYes: string;
    betNo: string;
    waitingResolution: string;
    invalidId: string;
    marketNotFound: string;
    loading: string;
  };
  
  // Common
  common: {
    error: string;
    tryAgain: string;
    confirm: string;
    cancel: string;
    delete: string;
    deleteMarket: string;
    deleteConfirm: string;
    cannotUndo: string;
    notFound: string;
    backToHome: string;
  };
  
  // Footer
  footer: {
    createdBy: string;
    memberOf: string;
    community: string;
    followOnX: string;
  };
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    header: {
      connectWallet: 'Conectar Carteira',
      connecting: 'Conectando...',
      copyAddress: 'Copiar endereço',
      disconnect: 'Desconectar',
      walletConnected: 'Carteira conectada',
      searchMarkets: 'Buscar mercados...',
      markets: 'Mercados',
      createMarket: 'Criar Mercado',
      faucetUSDC: 'Faucet USDC',
    },
    filters: {
      trending: 'Tendências',
      new: 'Novo',
      all: 'Tudo',
      politics: 'Política',
      sports: 'Esportes',
      culture: 'Cultura',
      crypto: 'Criptografia',
      climate: 'Clima',
      economy: 'Economia',
      mentions: 'Menções',
      companies: 'Empresas',
      finance: 'Finanças',
      tech: 'Tecnologia e Ciência',
      health: 'Saúde',
      world: 'Mundo',
    },
    home: {
      title: 'Mercados de Previsão',
      subtitle: 'Aposte em eventos futuros e ganhe recompensas baseadas em resultados reais',
      createNewMarket: '+ Criar Novo Mercado',
      totalMarkets: 'Total de Mercados',
      openMarkets: 'Mercados Abertos',
      totalVolume: 'Volume Total',
      loading: 'Carregando mercados...',
      noMarkets: 'Nenhum mercado encontrado.',
      noMarketsFiltered: 'Nenhum mercado encontrado com os filtros aplicados.',
      createFirstMarket: 'Criar o primeiro mercado',
      showing: 'Mostrando',
      of: 'de',
      markets: 'mercado',
      needTestnetUSDC: 'Precisa de USDC de teste?',
      faucetDescription: 'Obtenha 10 USDC de teste gratuitamente na rede Arc Testnet para testar a plataforma.',
      getUSDC: 'Obter USDC Testnet',
    },
    marketCard: {
      resolved: 'Resolvido',
      volume: 'Volume',
      yes: 'SIM',
      no: 'NÃO',
      betYes: 'Apostar SIM',
      betNo: 'Apostar NÃO',
      connectToBet: 'Conecte sua carteira para fazer uma aposta',
    },
    create: {
      title: 'Criar Novo Mercado',
      description: 'Descrição do Mercado',
      descriptionPlaceholder: 'Ex: O Bitcoin atingirá $100.000 até o final de 2024?',
      image: 'Imagem do Mercado (Opcional)',
      imageOptional: 'Imagem do Mercado (Opcional)',
      clickToUpload: 'Clique para fazer upload de uma imagem',
      imageFormats: 'JPG, PNG, WEBP ou GIF (máx. 5MB)',
      resolutionTime: 'Data e Hora de Resolução',
      resolutionTimeHelp: 'A data deve ser no futuro. O mercado será resolvido nesta data.',
      create: 'Criar Mercado',
      creating: 'Criando...',
      cancel: 'Cancelar',
      connectWalletFirst: 'Você precisa conectar sua carteira para criar um mercado.',
      connectWallet: 'Conectar Carteira',
      success: 'Mercado criado com sucesso! Redirecionando...',
      redirecting: 'Redirecionando...',
      viewTransaction: 'Ver transação:',
      transactionSent: 'Transação enviada:',
      checkTransaction: 'Clique no link acima para verificar o status da transação no explorador.',
    },
    detail: {
      back: '← Voltar para a lista',
      totalPot: 'Pote Total',
      status: 'Status:',
      resolved: 'Resolvido',
      open: 'Aberto',
      result: 'Resultado:',
      timeRemaining: 'Tempo Restante:',
      resolutionDate: 'Data de Resolução:',
      creator: 'Criador:',
      yourBets: 'Suas Apostas:',
      claimWinnings: 'Resgatar Ganhos',
      claimAvailable: 'Você tem ganhos disponíveis para resgate!',
      claiming: 'Resgatando...',
      claim: 'Resgatar Ganhos',
      youAreOracle: 'Você é o oráculo deste mercado. Selecione o resultado vencedor:',
      selectWinner: 'Selecione o resultado vencedor:',
      resolve: 'Resolver',
      resolving: 'Resolvendo...',
      resolveMarket: 'Resolver Mercado',
      betOnYes: 'Apostar em SIM',
      betOnNo: 'Apostar em NÃO',
      amount: 'Valor (USDC)',
      amountPlaceholder: '0.1',
      bet: 'Apostar',
      betting: 'Apostando...',
      betYes: 'Apostar SIM',
      betNo: 'Apostar NÃO',
      waitingResolution: 'O tempo de resolução já passou. Aguardando resolução do mercado pelo oráculo.',
      invalidId: 'ID do mercado inválido ou não encontrado.',
      marketNotFound: 'Mercado não encontrado.',
      loading: 'Carregando mercado...',
    },
    common: {
      error: 'Erro:',
      tryAgain: 'Tentar novamente',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      delete: 'Deletar',
      deleteMarket: 'Deletar mercado',
      deleteConfirm: 'Tem certeza que deseja deletar este mercado?',
      cannotUndo: 'Esta ação não pode ser desfeita.',
      notFound: 'Página não encontrada',
      backToHome: 'Voltar para a página inicial',
    },
    footer: {
      createdBy: 'Criado por',
      memberOf: 'membro da comunidade',
      community: 'ID Labs',
      followOnX: 'Seguir no X',
    },
  },
  'en-US': {
    header: {
      connectWallet: 'Connect Wallet',
      connecting: 'Connecting...',
      copyAddress: 'Copy address',
      disconnect: 'Disconnect',
      walletConnected: 'Wallet connected',
      searchMarkets: 'Search markets...',
      markets: 'Markets',
      createMarket: 'Create Market',
      faucetUSDC: 'Faucet USDC',
    },
    filters: {
      trending: 'Trending',
      new: 'New',
      all: 'All',
      politics: 'Politics',
      sports: 'Sports',
      culture: 'Culture',
      crypto: 'Crypto',
      climate: 'Climate',
      economy: 'Economy',
      mentions: 'Mentions',
      companies: 'Companies',
      finance: 'Finance',
      tech: 'Technology & Science',
      health: 'Health',
      world: 'World',
    },
    home: {
      title: 'Prediction Markets',
      subtitle: 'Bet on future events and earn rewards based on real outcomes',
      createNewMarket: '+ Create New Market',
      totalMarkets: 'Total Markets',
      openMarkets: 'Open Markets',
      totalVolume: 'Total Volume',
      loading: 'Loading markets...',
      noMarkets: 'No markets found.',
      noMarketsFiltered: 'No markets found with the applied filters.',
      createFirstMarket: 'Create the first market',
      showing: 'Showing',
      of: 'of',
      markets: 'market',
      needTestnetUSDC: 'Need Testnet USDC?',
      faucetDescription: 'Get 10 free testnet USDC on Arc Testnet to test the platform.',
      getUSDC: 'Get Testnet USDC',
    },
    marketCard: {
      resolved: 'Resolved',
      volume: 'Volume',
      yes: 'YES',
      no: 'NO',
      betYes: 'Bet YES',
      betNo: 'Bet NO',
      connectToBet: 'Connect your wallet to place a bet',
    },
    create: {
      title: 'Create New Market',
      description: 'Market Description',
      descriptionPlaceholder: 'Ex: Will Bitcoin reach $100,000 by the end of 2024?',
      image: 'Market Image (Optional)',
      imageOptional: 'Market Image (Optional)',
      clickToUpload: 'Click to upload an image',
      imageFormats: 'JPG, PNG, WEBP or GIF (max. 5MB)',
      resolutionTime: 'Resolution Date and Time',
      resolutionTimeHelp: 'The date must be in the future. The market will be resolved on this date.',
      create: 'Create Market',
      creating: 'Creating...',
      cancel: 'Cancel',
      connectWalletFirst: 'You need to connect your wallet to create a market.',
      connectWallet: 'Connect Wallet',
      success: 'Market created successfully! Redirecting...',
      redirecting: 'Redirecting...',
      viewTransaction: 'View transaction:',
      transactionSent: 'Transaction sent:',
      checkTransaction: 'Click the link above to check the transaction status on the explorer.',
    },
    detail: {
      back: '← Back to list',
      totalPot: 'Total Pot',
      status: 'Status:',
      resolved: 'Resolved',
      open: 'Open',
      result: 'Result:',
      timeRemaining: 'Time Remaining:',
      resolutionDate: 'Resolution Date:',
      creator: 'Creator:',
      yourBets: 'Your Bets:',
      claimWinnings: 'Claim Winnings',
      claimAvailable: 'You have winnings available to claim!',
      claiming: 'Claiming...',
      claim: 'Claim Winnings',
      youAreOracle: 'You are the oracle of this market. Select the winning outcome:',
      selectWinner: 'Select the winning outcome:',
      resolve: 'Resolve',
      resolving: 'Resolving...',
      resolveMarket: 'Resolve Market',
      betOnYes: 'Bet on YES',
      betOnNo: 'Bet on NO',
      amount: 'Amount (USDC)',
      amountPlaceholder: '0.1',
      bet: 'Bet',
      betting: 'Betting...',
      betYes: 'Bet YES',
      betNo: 'Bet NO',
      waitingResolution: 'The resolution time has passed. Waiting for the market to be resolved by the oracle.',
      invalidId: 'Invalid or not found market ID.',
      marketNotFound: 'Market not found.',
      loading: 'Loading market...',
    },
    common: {
      error: 'Error:',
      tryAgain: 'Try again',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteMarket: 'Delete market',
      deleteConfirm: 'Are you sure you want to delete this market?',
      cannotUndo: 'This action cannot be undone.',
      notFound: 'Page not found',
      backToHome: 'Back to home page',
    },
    footer: {
      createdBy: 'Created by',
      memberOf: 'member of the',
      community: 'ID Labs community',
      followOnX: 'Follow on X',
    },
  },
};

