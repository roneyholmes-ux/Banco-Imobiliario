/**
 * network.js
 * Gerencia a ponte de comunicação entre PeerJS e a lógica do jogo.
 */

const Network = {
  isHost: false,
  peer: null,
  connections: [], // Lista de conexões ativas se for Host

  init(isHost, peerInstance) {
    this.isHost = isHost;
    this.peer = peerInstance;
  },

  /**
   * Envia uma ação para a rede.
   * Se for Cliente: envia para o Host.
   * Se for Host: processa localmente a ação e faz o broadcast.
   */
  sendAction(actionType, payload = {}) {
    const message = {
      type: actionType,
      payload: payload,
      senderId: this.peer ? this.peer.id : 'local',
      timestamp: Date.now()
    };

    if (this.isHost) {
      // O Host processa diretamente no seu próprio gerenciador de ações
      if (window.Actions && typeof window.Actions.handleAction === 'function') {
        window.Actions.handleAction(message);
      }
    } else {
      // O Cliente envia a mensagem para a conexão do Host
      if (window.multiplayerConnection) {
        window.multiplayerConnection.send(message);
      }
    }
  },

  /**
   * Envia o estado atualizado do jogo do Host para TODOS os clientes conectados.
   */
  broadcastGameState(gameState) {
    if (!this.isHost) return;

    const message = {
      type: 'SYNC_GAME_STATE',
      payload: gameState,
      timestamp: Date.now()
    };

    // Envia para cada cliente conectado no Host
    if (Array.isArray(this.connections)) {
      this.connections.forEach(conn => {
        if (conn && conn.open) {
          conn.send(message);
        }
      });
    }

    // Atualiza a UI do próprio Host localmente
    if (window.UI && typeof window.UI.update === 'function') {
      window.UI.update(gameState);
    }
  }
};

window.Network = Network;
