/**
 * multiplayer.js
 * Gerencia a conexão PeerJS e a entrada de novos jogadores na partida.
 */

window.multiplayerConnection = null;

window.showOnlineModal = function() {
  const modal = document.getElementById('online-modal');
  if (modal) modal.classList.remove('hidden');
};

const Multiplayer = {
  peer: null,
  roomCode: null,
  lobbyState: {
    players: [] // Vai guardar os jogadores que entrarem
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindUIEvents();
    });
  },

  bindUIEvents() {
    // Botão Criar Sala
    const btnHost = document.getElementById('btn-host-game');
    if (btnHost) {
      btnHost.addEventListener('click', () => this.createRoom());
    }

    // Botão Entrar na Sala
    const btnConnect = document.getElementById('btn-connect-game');
    if (btnConnect) {
      btnConnect.addEventListener('click', () => {
        const inputCode = document.getElementById('join-room-code');
        const code = inputCode ? inputCode.value.trim() : '';
        if (code) {
          this.joinRoom(code);
        } else {
          alert('Por favor, digite o código da sala!');
        }
      });
    }
  },

/**
   * Cria a sala (HOST)
   */
  createRoom(hostName, hostAvatar) {
    this.roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    // Limpa a sala e adiciona o criador como o primeiro jogador
    this.lobbyState.players = [{
        id: 'host',
        name: hostName || 'Jogador 1',
        avatar: hostAvatar || 'avatar1',
        isHost: true
    }];
    this.peer = new Peer(`banco-imob-${this.roomCode}`);

    this.peer.on('open', (id) => {
      console.log(`[Multiplayer] Sala criada! Código: ${this.roomCode}`);

      if (window.Network) window.Network.init(true, this.peer);

      const displayCode = document.getElementById('display-room-code');
      const infoBox = document.getElementById('room-created-info');
      if (displayCode) displayCode.innerText = this.roomCode;
      if (infoBox) infoBox.classList.remove('hidden');

      // Em vez de rolar direto pro jogo, vamos pedir para a interface atualizar o Lobby
      if (window.UI && typeof window.UI.updateLobby === 'function') {
        window.UI.updateLobby(this.lobbyState.players);
      }
    });

    this.peer.on('connection', (conn) => {
      console.log(`[Multiplayer] Cliente conectado: ${conn.peer}`);
      if (window.Network) window.Network.connections.push(conn);
      this.setupListeners(conn, true);
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao criar sala:', err);
      alert('Erro ao criar sala. Verifique a sua conexão.');
    });
  },

  /**
   * Entra na sala (CLIENTE)
   */
  joinRoom(code) {
    this.roomCode = code.toUpperCase();
    this.peer = new Peer();

    this.peer.on('open', () => {
      console.log(`[Multiplayer] Conectando à sala ${this.roomCode}...`);
      const hostPeerId = `banco-imob-${this.roomCode}`;
      const conn = this.peer.connect(hostPeerId);

      window.multiplayerConnection = conn;

      conn.on('open', () => {
        console.log('[Multiplayer] Conectado ao Host com sucesso!');
        if (window.Network) window.Network.init(false, this.peer);
        this.setupListeners(conn, false);

        // Oculta o modal de online
        document.getElementById('online-modal')?.classList.add('hidden');

        // Exibe a seção de jogo
        const gameArea = document.getElementById('game-section-area');
        if (gameArea) gameArea.classList.remove('hidden');

        // Oculta modais ou overlays de setup local que possam existir
        const setupModal = document.getElementById('setup-modal') || document.querySelector('.setup-overlay');
        if (setupModal) setupModal.classList.add('hidden');

        if (typeof window.scrollToGame === 'function') {
          window.scrollToGame();
        }

        // Notifica o Host que um novo jogador entrou na partida
        window.Network.sendAction('JOIN_GAME', { playerName: 'Jogador 2' });
      });
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao conectar:', err);
      alert('Não foi possível encontrar essa sala. Confirme se o código está correto!');
    });
  },

  setupListeners(conn, isHost) {
    conn.on('data', (data) => {
      console.log('[Multiplayer] Dados recebidos:', data);

      if (isHost) {
        if (window.Actions) window.Actions.handleAction(data);
      } else {
        if (data.type === 'SYNC_GAME_STATE') {
          // Oculta telas de setup local ao receber o estado do Host
          const setupModal = document.getElementById('setup-modal') || document.querySelector('.setup-overlay');
          if (setupModal) setupModal.classList.add('hidden');

          if (window.UI) window.UI.update(data.payload);
        }
      }
    });
  }
};

Multiplayer.init();
window.Multiplayer = Multiplayer;
