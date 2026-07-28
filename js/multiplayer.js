/**
 * multiplayer.js
 * Gerencia as conexões WebRTC via PeerJS e integra com o Network.
 */

window.multiplayerConnection = null;

const Multiplayer = {
  peer: null,
  roomCode: null,

  /**
   * Inicializa como HOST (Cria a sala)
   */
  createRoom() {
    // Cria um ID de sala aleatório de 5 caracteres
    this.roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.peer = new Peer(`banco-imob-${this.roomCode}`);

    this.peer.on('open', (id) => {
      console.log(`[Multiplayer] Sala criada com sucesso! Código: ${this.roomCode}`);
      
      // Inicializa a camada Network como HOST
      if (window.Network) {
        window.Network.init(true, this.peer);
      }

      // Atualiza código na UI se houver elemento para isso
      const codeElement = document.getElementById('room-code-display');
      if (codeElement) codeElement.innerText = this.roomCode;
    });

    // Escuta novas conexões de clientes
    this.peer.on('connection', (conn) => {
      console.log(`[Multiplayer] Cliente conectado: ${conn.peer}`);
      
      if (window.Network) {
        window.Network.connections.push(conn);
      }

      // Configura os ouvintes de evento para esta conexão específica
      this.setupConnectionListeners(conn, true);
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro no Peer Host:', err);
    });
  },

  /**
   * Inicializa como CLIENTE (Entra em uma sala existente)
   */
  joinRoom(code) {
    this.roomCode = code.trim().toUpperCase();
    this.peer = new Peer(); // ID automático para cliente

    this.peer.on('open', () => {
      console.log(`[Multiplayer] Conectando à sala: ${this.roomCode}...`);
      
      const hostPeerId = `banco-imob-${this.roomCode}`;
      const conn = this.peer.connect(hostPeerId);

      window.multiplayerConnection = conn;

      conn.on('open', () => {
        console.log('[Multiplayer] Conectado ao Host com sucesso!');
        
        // Inicializa a camada Network como CLIENTE
        if (window.Network) {
          window.Network.init(false, this.peer);
        }

        this.setupConnectionListeners(conn, false);

        // Solicita entrada no jogo para o Host
        const playerName = document.getElementById('player-name-input')?.value || 'Jogador';
        window.Network.sendAction('JOIN_GAME', { playerName });
      });
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao tentar conectar:', err);
      alert('Não foi possível conectar à sala. Verifique o código digitado.');
    });
  },

  /**
   * Configura o recebimento de mensagens e desconexões
   */
  setupConnectionListeners(conn, isHost) {
    conn.on('data', (data) => {
      console.log('[Multiplayer] Dados recebidos via rede:', data);

      if (isHost) {
        // Se for HOST: recebe a ação do cliente e despacha para o Actions
        if (window.Actions && typeof window.Actions.handleAction === 'function') {
          window.Actions.handleAction(data);
        }
      } else {
        // Se for CLIENTE: recebe atualizações de estado enviadas pelo Host
        if (data.type === 'SYNC_GAME_STATE') {
          if (window.UI && typeof window.UI.update === 'function') {
            window.UI.update(data.payload);
          }
        }
      }
    });

    conn.on('close', () => {
      console.warn(`[Multiplayer] Conexão encerrada com: ${conn.peer}`);
      if (isHost && window.Network) {
        window.Network.connections = window.Network.connections.filter(c => c.peer !== conn.peer);
      }
    });
  }
};

window.Multiplayer = Multiplayer;
