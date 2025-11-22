// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarket
 * @dev Contrato inteligente para mercado de previsão na blockchain Arc
 * Permite criar mercados, apostar em resultados (SIM/NÃO) e resgatar ganhos
 */
contract PredictionMarket {
    // Estrutura de dados para representar um mercado
    struct Market {
        uint256 id;
        address creator;
        string description;
        uint256 resolutionTime;
        address oracle;
        bool resolved;
        bool winningOutcome; // true => YES, false => NO
        uint256 totalYesAmount;
        uint256 totalNoAmount;
    }

    // Mapeamento de ID do mercado para os dados do mercado
    mapping(uint256 => Market) public markets;
    
    // Mapeamento de (ID do mercado => endereço => valor apostado) para apostas em SIM
    mapping(uint256 => mapping(address => uint256)) public yesBets;
    
    // Mapeamento de (ID do mercado => endereço => valor apostado) para apostas em NÃO
    mapping(uint256 => mapping(address => uint256)) public noBets;
    
    // Contador para gerar IDs únicos de mercados
    uint256 public marketCounter;

    // Eventos
    event MarketCreated(
        uint256 indexed id,
        address indexed creator,
        string description,
        uint256 resolutionTime
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool outcome,
        uint256 amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        bool winningOutcome
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    event MarketDeleted(
        uint256 indexed marketId,
        address indexed creator
    );

    /**
     * @dev Cria um novo mercado de previsão
     * @param _description Descrição do evento/previsão
     * @param _resolutionTime Timestamp Unix da data/hora de resolução
     */
    function createMarket(
        string calldata _description,
        uint256 _resolutionTime
    ) external payable {
        // Requer que a data de resolução seja no futuro
        require(
            _resolutionTime > block.timestamp,
            "Resolution time must be in the future"
        );

        // Incrementa o contador e obtém o novo ID
        marketCounter++;
        uint256 newMarketId = marketCounter;

        // Cria o novo mercado
        markets[newMarketId] = Market({
            id: newMarketId,
            creator: msg.sender,
            description: _description,
            resolutionTime: _resolutionTime,
            oracle: msg.sender, // O criador é o oráculo
            resolved: false,
            winningOutcome: false,
            totalYesAmount: 0,
            totalNoAmount: 0
        });

        // Emite o evento
        emit MarketCreated(newMarketId, msg.sender, _description, _resolutionTime);
    }

    /**
     * @dev Permite que um usuário aposte em um mercado
     * @param _marketId ID do mercado
     * @param _outcome true para SIM, false para NÃO
     */
    function placeBet(uint256 _marketId, bool _outcome) external payable {
        // Requer que o valor da aposta seja maior que zero
        require(msg.value > 0, "Bet amount must be greater than zero");

        // Requer que o mercado exista
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");

        // Requer que o mercado não esteja resolvido
        require(!market.resolved, "Market is already resolved");

        // Requer que ainda não tenha passado o tempo de resolução
        require(
            block.timestamp < market.resolutionTime,
            "Market resolution time has passed"
        );

        // Atualiza os mapeamentos e totais conforme o resultado apostado
        if (_outcome) {
            // Aposta em SIM
            yesBets[_marketId][msg.sender] += msg.value;
            market.totalYesAmount += msg.value;
        } else {
            // Aposta em NÃO
            noBets[_marketId][msg.sender] += msg.value;
            market.totalNoAmount += msg.value;
        }

        // Emite o evento
        emit BetPlaced(_marketId, msg.sender, _outcome, msg.value);
    }

    /**
     * @dev Permite que o oráculo resolva o mercado
     * @param _marketId ID do mercado
     * @param _winningOutcome true se SIM venceu, false se NÃO venceu
     */
    function resolveMarket(uint256 _marketId, bool _winningOutcome) external {
        // Requer que o mercado exista
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");

        // Requer que o mercado não esteja resolvido
        require(!market.resolved, "Market is already resolved");

        // Requer que o chamador seja o oráculo
        require(msg.sender == market.oracle, "Only oracle can resolve market");

        // Requer que o tempo de resolução tenha passado
        require(
            block.timestamp >= market.resolutionTime,
            "Resolution time has not been reached"
        );

        // Atualiza o estado do mercado
        market.resolved = true;
        market.winningOutcome = _winningOutcome;

        // Emite o evento
        emit MarketResolved(_marketId, _winningOutcome);
    }

    /**
     * @dev Permite que um usuário resgate seus ganhos após a resolução
     * @param _marketId ID do mercado
     * 
     * Cálculo dos ganhos:
     * - Se o usuário apostou no lado vencedor, ele recebe uma proporção do pote total
     * - Proporção = (aposta do usuário / total apostado no lado vencedor) * pote total
     * - Pote total = totalYesAmount + totalNoAmount
     * 
     * Prevenção de reentrância: usa padrão Checks-Effects-Interactions
     */
    function claimWinnings(uint256 _marketId) external {
        // Requer que o mercado exista
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");

        // Requer que o mercado esteja resolvido
        require(market.resolved, "Market is not resolved yet");

        // Determina qual mapeamento verificar baseado no resultado vencedor
        uint256 userBet;
        uint256 totalWinningAmount;

        if (market.winningOutcome) {
            // SIM venceu - verificar apostas em SIM
            userBet = yesBets[_marketId][msg.sender];
            totalWinningAmount = market.totalYesAmount;
        } else {
            // NÃO venceu - verificar apostas em NÃO
            userBet = noBets[_marketId][msg.sender];
            totalWinningAmount = market.totalNoAmount;
        }

        // Requer que o usuário tenha uma aposta no lado vencedor
        require(userBet > 0, "No winning bet to claim");

        // Calcula o pote total
        uint256 totalPot = market.totalYesAmount + market.totalNoAmount;

        // Calcula os ganhos do usuário
        // Fórmula: (aposta do usuário / total do lado vencedor) * pote total
        uint256 winnings = (userBet * totalPot) / totalWinningAmount;

        // CHECKS: Validações feitas acima
        // EFFECTS: Zera a aposta do usuário ANTES da transferência (prevenção de reentrância)
        if (market.winningOutcome) {
            yesBets[_marketId][msg.sender] = 0;
        } else {
            noBets[_marketId][msg.sender] = 0;
        }

        // INTERACTIONS: Transfere os ganhos para o usuário
        payable(msg.sender).transfer(winnings);

        // Emite o evento
        emit WinningsClaimed(_marketId, msg.sender, winnings);
    }

    /**
     * @dev Permite que o criador delete um mercado que ainda não tem apostas
     * @param _marketId ID do mercado a ser deletado
     */
    function deleteMarket(uint256 _marketId) external {
        // Requer que o mercado exista
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");

        // Requer que o chamador seja o criador do mercado
        require(msg.sender == market.creator, "Only creator can delete market");

        // Requer que o mercado não esteja resolvido
        require(!market.resolved, "Cannot delete resolved market");

        // Requer que não haja apostas (pote total deve ser zero)
        uint256 totalPot = market.totalYesAmount + market.totalNoAmount;
        require(totalPot == 0, "Cannot delete market with bets");

        // Deleta o mercado (zera o ID)
        delete markets[_marketId];

        // Emite o evento
        emit MarketDeleted(_marketId, msg.sender);
    }

    /**
     * @dev Função auxiliar para obter informações de um mercado
     * @param _marketId ID do mercado
     * @return Market struct completa
     */
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    /**
     * @dev Função auxiliar para obter o pote total de um mercado
     * @param _marketId ID do mercado
     * @return Pote total (soma de todas as apostas)
     */
    function getTotalPot(uint256 _marketId) external view returns (uint256) {
        Market memory market = markets[_marketId];
        return market.totalYesAmount + market.totalNoAmount;
    }
}

