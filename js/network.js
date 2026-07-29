/**
 * network.js
 * Modulo Hibrido: Funciona no modo Local e Online sem quebrar a UI original.
 */

const Network = {
  isHost: true,
  isOnline: false,
  peer: null,
  connections: [],

  init(isHost, peerInstance) {
    this.isHost = isHost;
    this.peer = peerInstance;
    this.isOnline = true;
  },

  /**
   * Envia uma ação. Se for jogo local, chama diretamente a função do game.js original.
   */
  sendAction(actionType, payload = {}) {
    if (!this.isOnline) {
      // MODO LOCAL: Executa as funções globais que seu jogo original já possui
      this.executeLocalAction(actionType, payload);
      return;
    }

    // MODO ONLINE
    const message = {
      type: actionType,
      payload: payload,
      senderId: this.peer ? this.peer.id : 'local',
      timestamp: Date.now()
    };

    if (this.isHost) {
      if (window.Actions) window.Actions.handleAction(message);
    } else {
      if (window.multiplayerConnection) {
        window.multiplayerConnection.send(message);
      }
    }
  },

  executeLocalAction(actionType, payload) {
    // Integração com funções legadas/originais do game.js
    if (actionType === 'ROLL_DICE' && typeof window.rollDice === 'function') {
      window.rollDice();
    } else if (actionType === 'BUY_PROPERTY' && typeof window.buyProperty === 'function') {
      window.buyProperty();
    } else if (actionType === 'END_TURN' && typeof window.endTurn === 'function') {
      window.endTurn();
    }
  },

  broadcastGameState(gameState) {
    if (!this.isOnline || !this.isHost) return;

    const message = {
      type: 'SYNC_GAME_STATE',
      payload: gameState,
      timestamp: Date.now()
    };

    this.connections.forEach(conn => {
      if (conn && conn.open) conn.send(message);
    });
  }
};

window.Network = Network;
