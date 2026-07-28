/**
 * ui.js
 * Responsável por renderizar e atualizar toda a interface do jogo a partir do Game State.
 */

const UI = {
  /**
   * Função principal chamada sempre que o estado do jogo muda (SYNC_GAME_STATE)
   */
  update(gameState) {
    if (!gameState) return;

    console.log('[UI] Atualizando interface com o novo estado:', gameState);

    this.renderPlayers(gameState.players, gameState.currentPlayerIndex);
    this.renderBoard(gameState.board, gameState.players);
    this.renderControls(gameState);
    this.renderGameLog(gameState.logs);
  },

  /**
   * Atualiza o painel dos jogadores (saldo, cor, indicador de turno)
   */
  renderPlayers(players = [], currentPlayerIndex = 0) {
    const playersContainer = document.getElementById('players-list');
    if (!playersContainer) return;

    playersContainer.innerHTML = players.map((player, index) => {
      const isCurrentTurn = index === currentPlayerIndex;
      return `
        <div class="player-card ${isCurrentTurn ? 'active-turn' : ''}" style="border-left: 5px solid ${player.color || '#ccc'};">
          <div class="player-name">
            <strong>${player.name}</strong> ${isCurrentTurn ? '⭐ (Vez)' : ''}
          </div>
          <div class="player-money">R$ ${player.money}</div>
          <div class="player-properties-count">Propriedades: ${player.properties ? player.properties.length : 0}</div>
        </div>
      `;
    }).join('');
  },

  /**
   * Atualiza a posição dos peões e donos das propriedades no tabuleiro
   */
  renderBoard(board = [], players = []) {
    // 1. Limpa peões existentes nas casas
    document.querySelectorAll('.player-pawn').forEach(pawn => pawn.remove());

    // 2. Desenha os peões nas posições atuais
    players.forEach((player, index) => {
      const tile = document.getElementById(`tile-${player.position}`);
      if (tile) {
        const pawn = document.createElement('div');
        pawn.className = `player-pawn pawn-player-${index}`;
        pawn.style.backgroundColor = player.color || '#f00';
        pawn.title = player.name;
        tile.appendChild(pawn);
      }
    });

    // 3. Atualiza indicação visual de proprietários nas cartas/casas
    if (Array.isArray(board)) {
      board.forEach((tileData) => {
        const tileElement = document.getElementById(`tile-${tileData.id}`);
        if (tileElement && tileData.ownerId !== null && tileData.ownerId !== undefined) {
          tileElement.setAttribute('data-owner', tileData.ownerId);
        }
      });
    }
  },

  /**
   * Habilita/Desabilita botões conforme a vez do jogador local
   */
  renderControls(gameState) {
    const localPeerId = window.Network?.peer?.id;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Verifica se é a vez do jogador do navegador atual
    const isMyTurn = (window.Network?.isHost && gameState.currentPlayerIndex === 0) || 
                     (currentPlayer && currentPlayer.peerId === localPeerId);

    const btnRollDice = document.getElementById('btn-roll-dice');
    const btnBuyProperty = document.getElementById('btn-buy-property');
    const btnEndTurn = document.getElementById('btn-end-turn');

    if (btnRollDice) btnRollDice.disabled = !isMyTurn || gameState.hasRolledDice;
    if (btnEndTurn) btnEndTurn.disabled = !isMyTurn || !gameState.hasRolledDice;
    
    if (btnBuyProperty) {
      const currentTile = gameState.board ? gameState.board[currentPlayer?.position] : null;
      const canBuy = isMyTurn && currentTile && currentTile.price && !currentTile.ownerId && gameState.hasRolledDice;
      btnBuyProperty.disabled = !canBuy;
    }
  },

  /**
   * Atualiza o feed/histórico de mensagens do jogo
   */
  renderGameLog(logs = []) {
    const logContainer = document.getElementById('game-log');
    if (!logContainer) return;

    logContainer.innerHTML = logs.map(msg => `<div class="log-entry">${msg}</div>`).join('');
    logContainer.scrollTop = logContainer.scrollHeight;
  }
};

window.UI = UI;
