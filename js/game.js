/**
 * game.js
 * Estado central e motor de regras do Banco Imobiliário (Host-Authoritative).
 */

const Game = { 
  state: {
    players: [],
    currentPlayerIndex: 0,
    hasRolledDice: false,
    board: [], // Lista de propriedades/casas do tabuleiro
    logs: [],
    isStarted: false
  },

  /**
   * Inicializa o tabuleiro padrão
   */
  init() {
    this.state.board = this.createDefaultBoard();
    this.addLog('Jogo inicializado. Aguardando jogadores...');
  },

  /**
   * Adiciona um novo jogador ao estado
   */
  addPlayer(playerName, peerId) {
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#E67E22'];
    const playerColor = colors[this.state.players.length % colors.length];

    const newPlayer = {
      id: this.state.players.length,
      peerId: peerId || 'host',
      name: playerName || `Jogador ${this.state.players.length + 1}`,
      money: 1500,
      position: 0, // Casa inicial (Início)
      color: playerColor,
      properties: [],
      inJail: false
    };

    this.state.players.push(newPlayer);
    this.addLog(`${newPlayer.name} entrou na partida.`);
  },

  /**
   * Ação de Rolar os Dados
   */
  rollDice(senderId) {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || this.state.hasRolledDice) return;

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    this.state.hasRolledDice = true;
    this.addLog(`${currentPlayer.name} tirou ${die1} e ${die2} (Total: ${total}).`);

    // Atualiza posição do jogador
    const totalTiles = this.state.board.length || 40;
    const newPosition = (currentPlayer.position + total) % totalTiles;

    // Passou pelo Início? Recebe $200
    if (newPosition < currentPlayer.position) {
      currentPlayer.money += 200;
      this.addLog(`${currentPlayer.name} passou pelo Início e recebeu R$ 200.`);
    }

    currentPlayer.position = newPosition;
    
    // Processa regras da casa onde caiu (ex: aluguel)
    this.handleTileLanding(currentPlayer);
  },

  /**
   * Processa o que acontece ao cair em uma casa
   */
  handleTileLanding(player) {
    const tile = this.state.board[player.position];
    if (!tile) return;

    this.addLog(`${player.name} caiu em "${tile.name}".`);

    // Se a propriedade tiver dono e não for o próprio jogador, cobra aluguel
    if (tile.ownerId !== null && tile.ownerId !== undefined && tile.ownerId !== player.id) {
      const owner = this.state.players.find(p => p.id === tile.ownerId);
      if (owner) {
        const rent = tile.rent || 50;
        player.money -= rent;
        owner.money += rent;
        this.addLog(`${player.name} pagou R$ ${rent} de aluguel para ${owner.name}.`);
      }
    }
  },

  /**
   * Ação de Comprar Propriedade
   */
  buyProperty(senderId, propertyId) {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || !this.state.hasRolledDice) return;

    const tile = this.state.board[currentPlayer.position];

    // Validações de compra
    if (!tile || !tile.price) return;
    if (tile.ownerId !== null && tile.ownerId !== undefined) {
      this.addLog(`Esta propriedade já pertence a alguém!`);
      return;
    }
    if (currentPlayer.money < tile.price) {
      this.addLog(`${currentPlayer.name} não tem dinheiro suficiente para comprar ${tile.name}.`);
      return;
    }

    // Executa a compra
    currentPlayer.money -= tile.price;
    tile.ownerId = currentPlayer.id;
    currentPlayer.properties.push(tile.id);

    this.addLog(`${currentPlayer.name} comprou ${tile.name} por R$ ${tile.price}!`);
  },

  /**
   * Passa a vez para o próximo jogador
   */
  endTurn(senderId) {
    if (!this.state.hasRolledDice) return;

    this.state.hasRolledDice = false;
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;

    const nextPlayer = this.getCurrentPlayer();
    this.addLog(`Vez de ${nextPlayer ? nextPlayer.name : 'próximo jogador'}.`);
  },

  /**
   * Auxiliares
   */
  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex];
  },

  getState() {
    return this.state;
  },

  addLog(message) {
    const time = new Date().toLocaleTimeString().slice(0, 5);
    this.state.logs.push(`[${time}] ${message}`);
  },

  /**
   * Estrutura básica do tabuleiro (pode ser expandida conforme o projeto)
   */
  createDefaultBoard() {
    const board = [];
    for (let i = 0; i < 40; i++) {
      if (i === 0) {
        board.push({ id: 0, name: 'Ponto de Partida', price: 0, ownerId: null });
      } else if (i % 5 === 0) {
        board.push({ id: i, name: `Companhia / Estação ${i}`, price: 200, rent: 25, ownerId: null });
      } else {
        board.push({ id: i, name: `Alameda ${i}`, price: 100 + i * 10, rent: 10 + i * 2, ownerId: null });
      }
    }
    return board;
  }
};

// Inicializa o tabuleiro assim que carrega
Game.init();

window.Game = Game;
