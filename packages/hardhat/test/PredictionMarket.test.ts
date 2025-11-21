import { expect } from "chai";
import { ethers } from "hardhat";
import { PredictionMarket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Testes completos para o contrato PredictionMarket
 * 
 * Cobre todos os cenários principais:
 * - Criação de mercados
 * - Realização de apostas
 * - Resolução de mercados
 * - Resgate de ganhos
 */
describe("PredictionMarket", function () {
  let predictionMarket: PredictionMarket;
  let owner: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  beforeEach(async function () {
    // Obter signers para diferentes usuários
    [owner, oracle, user1, user2, user3] = await ethers.getSigners();

    // Deploy do contrato antes de cada teste
    const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarketFactory.deploy();
    await predictionMarket.waitForDeployment();
  });

  describe("Market Creation", function () {
    it("Should create a market successfully", async function () {
      const description = "Will it rain tomorrow?";
      const resolutionTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      await expect(
        predictionMarket.createMarket(description, resolutionTime)
      )
        .to.emit(predictionMarket, "MarketCreated")
        .withArgs(1, owner.address, description, resolutionTime);

      const market = await predictionMarket.markets(1);
      expect(market.id).to.equal(1);
      expect(market.creator).to.equal(owner.address);
      expect(market.oracle).to.equal(owner.address);
      expect(market.description).to.equal(description);
      expect(market.resolutionTime).to.equal(resolutionTime);
      expect(market.resolved).to.be.false;
    });

    it("Should fail to create market with past resolution time", async function () {
      const description = "Past event";
      const pastTime = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago

      await expect(
        predictionMarket.createMarket(description, pastTime)
      ).to.be.revertedWith("Resolution time must be in the future");
    });

    it("Should increment market counter", async function () {
      const resolutionTime = Math.floor(Date.now() / 1000) + 86400;

      await predictionMarket.createMarket("Market 1", resolutionTime);
      expect(await predictionMarket.marketCounter()).to.equal(1);

      await predictionMarket.createMarket("Market 2", resolutionTime + 86400);
      expect(await predictionMarket.marketCounter()).to.equal(2);
    });
  });

  describe("Placing Bets", function () {
    let marketId: bigint;
    let resolutionTime: number;

    beforeEach(async function () {
      // Criar um mercado de teste antes de cada teste de aposta
      resolutionTime = Math.floor(Date.now() / 1000) + 86400;
      await predictionMarket.createMarket("Test Market", resolutionTime);
      marketId = 1n;
    });

    it("Should place a YES bet successfully", async function () {
      const betAmount = ethers.parseEther("1.0");

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, { value: betAmount })
      )
        .to.emit(predictionMarket, "BetPlaced")
        .withArgs(marketId, user1.address, true, betAmount);

      expect(await predictionMarket.yesBets(marketId, user1.address)).to.equal(betAmount);
      
      const market = await predictionMarket.markets(marketId);
      expect(market.totalYesAmount).to.equal(betAmount);
    });

    it("Should place a NO bet successfully", async function () {
      const betAmount = ethers.parseEther("0.5");

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, false, { value: betAmount })
      )
        .to.emit(predictionMarket, "BetPlaced")
        .withArgs(marketId, user1.address, false, betAmount);

      expect(await predictionMarket.noBets(marketId, user1.address)).to.equal(betAmount);
      
      const market = await predictionMarket.markets(marketId);
      expect(market.totalNoAmount).to.equal(betAmount);
    });

    it("Should allow multiple users to bet", async function () {
      const bet1 = ethers.parseEther("1.0");
      const bet2 = ethers.parseEther("2.0");
      const bet3 = ethers.parseEther("0.5");

      await predictionMarket.connect(user1).placeBet(marketId, true, { value: bet1 });
      await predictionMarket.connect(user2).placeBet(marketId, true, { value: bet2 });
      await predictionMarket.connect(user3).placeBet(marketId, false, { value: bet3 });

      const market = await predictionMarket.markets(marketId);
      expect(market.totalYesAmount).to.equal(ethers.parseEther("3.0"));
      expect(market.totalNoAmount).to.equal(bet3);
    });

    it("Should fail to bet with zero amount", async function () {
      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, { value: 0 })
      ).to.be.revertedWith("Bet amount must be greater than zero");
    });

    it("Should fail to bet on non-existent market", async function () {
      const betAmount = ethers.parseEther("1.0");

      await expect(
        predictionMarket.connect(user1).placeBet(999n, true, { value: betAmount })
      ).to.be.revertedWith("Market does not exist");
    });

    it("Should fail to bet after resolution time", async function () {
      const betAmount = ethers.parseEther("1.0");
      
      // Avançar o tempo para após a data de resolução
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, { value: betAmount })
      ).to.be.revertedWith("Market resolution time has passed");
    });

    it("Should fail to bet on already resolved market", async function () {
      const betAmount = ethers.parseEther("1.0");
      
      // Resolver o mercado primeiro
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true);

      // Tentar apostar após resolução deve falhar
      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, { value: betAmount })
      ).to.be.revertedWith("Market is already resolved");
    });
  });

  describe("Market Resolution", function () {
    let marketId: bigint;
    let resolutionTime: number;

    beforeEach(async function () {
      resolutionTime = Math.floor(Date.now() / 1000) + 86400;
      await predictionMarket.createMarket("Test Market", resolutionTime);
      marketId = 1n;
    });

    it("Should resolve market successfully by oracle", async function () {
      // Place some bets
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Move time forward
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        predictionMarket.resolveMarket(marketId, true)
      )
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(marketId, true);

      const market = await predictionMarket.markets(marketId);
      expect(market.resolved).to.be.true;
      expect(market.winningOutcome).to.be.true;
    });

    it("Should fail to resolve by non-oracle", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        predictionMarket.connect(user1).resolveMarket(marketId, true)
      ).to.be.revertedWith("Only oracle can resolve market");
    });

    it("Should fail to resolve before resolution time", async function () {
      await expect(
        predictionMarket.resolveMarket(marketId, true)
      ).to.be.revertedWith("Resolution time has not been reached");
    });

    it("Should fail to resolve already resolved market", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await predictionMarket.resolveMarket(marketId, true);

      await expect(
        predictionMarket.resolveMarket(marketId, false)
      ).to.be.revertedWith("Market is already resolved");
    });
  });

  describe("Claiming Winnings", function () {
    let marketId: bigint;
    let resolutionTime: number;

    beforeEach(async function () {
      // Criar um mercado de teste antes de cada teste de resgate
      resolutionTime = Math.floor(Date.now() / 1000) + 86400;
      await predictionMarket.createMarket("Test Market", resolutionTime);
      marketId = 1n;
    });

    it("Should calculate and claim winnings correctly for winner", async function () {
      // Configuração do cenário:
      // User1 aposta 1 ETH em SIM
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      
      // User2 aposta 2 ETH em SIM
      await predictionMarket.connect(user2).placeBet(marketId, true, { value: ethers.parseEther("2.0") });
      
      // User3 aposta 1 ETH em NÃO
      await predictionMarket.connect(user3).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Pote total = 4 ETH
      // Total SIM = 3 ETH, Total NÃO = 1 ETH

      // Resolver mercado: SIM vence
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true);

      // Cálculo esperado dos ganhos:
      // User1 deve receber: (1/3) * 4 = 1.333... ETH
      // User2 deve receber: (2/3) * 4 = 2.666... ETH
      // Fórmula: (aposta_do_usuario / total_do_lado_vencedor) * pote_total

      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      
      // Resgatar ganhos do User1
      const tx = await predictionMarket.connect(user1).claimWinnings(marketId);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      const expectedWinnings = (ethers.parseEther("1.0") * ethers.parseEther("4.0")) / ethers.parseEther("3.0");
      
      // Verificar que o saldo aumentou pelos ganhos menos o gas
      expect(user1BalanceAfter).to.be.closeTo(
        user1BalanceBefore + expectedWinnings - gasUsed,
        ethers.parseEther("0.01") // Tolerância para diferenças de gas
      );

      // Verificar que a aposta foi zerada (prevenção de resgate duplo)
      expect(await predictionMarket.yesBets(marketId, user1.address)).to.equal(0);
    });

    it("Should prevent loser from claiming winnings", async function () {
      // User1 aposta em SIM, User3 aposta em NÃO
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user3).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Resolver mercado: SIM vence
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true);

      // User3 (perdedor) não deve conseguir resgatar ganhos
      await expect(
        predictionMarket.connect(user3).claimWinnings(marketId)
      ).to.be.revertedWith("No winning bet to claim");
    });

    it("Should prevent double claiming", async function () {
      // Configurar cenário: User1 aposta em SIM, User2 aposta em NÃO
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Resolver mercado: SIM vence
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true);

      // Primeiro resgate deve ter sucesso
      await expect(
        predictionMarket.connect(user1).claimWinnings(marketId)
      ).to.emit(predictionMarket, "WinningsClaimed");

      // Segundo resgate deve falhar (aposta foi zerada)
      await expect(
        predictionMarket.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWith("No winning bet to claim");
    });

    it("Should fail to claim before resolution", async function () {
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });

      await expect(
        predictionMarket.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWith("Market is not resolved yet");
    });

    it("Should emit WinningsClaimed event with correct parameters", async function () {
      // Configurar cenário simples: 1 ETH em cada lado
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Resolver mercado: SIM vence
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true);

      // Calcular ganhos esperados: (1/1) * 2 = 2 ETH (User1 recebe todo o pote)
      const expectedWinnings = (ethers.parseEther("1.0") * ethers.parseEther("2.0")) / ethers.parseEther("1.0");

      // Verificar que o evento é emitido com os parâmetros corretos
      await expect(
        predictionMarket.connect(user1).claimWinnings(marketId)
      )
        .to.emit(predictionMarket, "WinningsClaimed")
        .withArgs(marketId, user1.address, expectedWinnings);
    });

    it("Should handle multiple winners correctly", async function () {
      // Cenário com múltiplos vencedores
      await predictionMarket.connect(user1).placeBet(marketId, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).placeBet(marketId, true, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user3).placeBet(marketId, false, { value: ethers.parseEther("1.0") });

      // Pote total = 4 ETH, SIM = 3 ETH, NÃO = 1 ETH
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      await predictionMarket.resolveMarket(marketId, true); // SIM vence

      // User1 deve receber (1/3) * 4 = 1.333... ETH
      await expect(
        predictionMarket.connect(user1).claimWinnings(marketId)
      ).to.emit(predictionMarket, "WinningsClaimed");

      // User2 deve receber (2/3) * 4 = 2.666... ETH
      await expect(
        predictionMarket.connect(user2).claimWinnings(marketId)
      ).to.emit(predictionMarket, "WinningsClaimed");

      // Verificar que ambos conseguiram resgatar (apostas foram zeradas)
      expect(await predictionMarket.yesBets(marketId, user1.address)).to.equal(0);
      expect(await predictionMarket.yesBets(marketId, user2.address)).to.equal(0);
    });
  });
});

