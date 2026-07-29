/**
 * multiplayer.js
 * Gerencia a conexão PeerJS, o Lobby e a entrada de novos jogadores na partida.
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
    players: [] // Guarda os jogadores que estão na sala de espera
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindUIEvents();
    });
  },

  bindUIEvents() {
    // ---------------------------------------------------------
    // 1. Lógica do Botão Criar Sala (HOST)
    // ---------------------------------------------------------
    const btnHost = document.getElementById('btn-host-game');
    if (btnHost) {
      btnHost.addEventListener('click', () => {
        // Captura o nome e avatar digitados pelo Host
        const nameInput = document.getElementById('host-player-name');
        const avatarInput = document.getElementById('host-player-avatar');
        
        const hostName = nameInput && nameInput.value.trim() !== '' ? nameInput.value.trim() : 'Jogador 1';
        const hostAvatar = avatarInput ? avatarInput.value : 'avatar1';

        this.createRoom(hostName, hostAvatar);
      });
    }

    // ---------------------------------------------------------
    // 2. Lógica do Botão Entrar na Sala (CLIENTE)
    // ---------------------------------------------------------
    const btnConnect = document.getElementById('btn-connect-game');
    if (btnConnect) {
      btnConnect.addEventListener('click', () => {
        // Captura o código da sala, nome e avatar digitados pelo Cliente
        const inputCode = document.getElementById('join-room-code');
        const nameInput = document.getElementById('join-player-name');
        const avatarInput = document.getElementById('join-player-avatar');

        const code = inputCode ? inputCode.value.trim() : '';
        const guestName = nameInput && nameInput.value.trim() !== '' ? nameInput.value.trim() : 'Visitante';
        const guestAvatar = avatarInput ? avatarInput.value : 'avatar2';

        if (code) {
          this.joinRoom(code, guestName, guestAvatar);
        } else {
          alert('Por favor, digite o código da sala!');
        }
      });
    }
  },

  /**
   * Cria a sala e aguarda conexões no Lobby (HOST)
   */
  createRoom(hostName, hostAvatar) {
    this.roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    // Limpa o lobby e adiciona o criador como o primeiro jogador
    this.lobbyState.players = [{
        id: 'host',
        name: hostName,
        avatar: hostAvatar,
        isHost: true
    }];

    this.peer = new Peer(`banco-imob-${this.roomCode}`);

    this.peer.on('open', (id) => {
      console.log(`[Multiplayer] Sala criada! Código: ${this.roomCode}`);

      if (window.Network) window.Network.init(true, this.peer);

      // Atualiza a tela exibindo o código para convidar amigos
      const displayCode = document.getElementById('display-room-code');
      const infoBox = document.getElementById('room-created-info');
      if (displayCode) displayCode.innerText = this.roomCode;
      if (infoBox) infoBox.classList.remove('hidden');

      // Pede para a interface atualizar o Lobby visualmente com o Host na lista
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
   * Entra na sala e se apresenta para o Lobby (CLIENTE)
   */
  joinRoom(code, guestName, guestAvatar) {
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

        // Oculta o modal antigo de online
        document.getElementById('online-modal')?.classList.add('hidden');

        // Envia os dados do Cliente para o Host o adicionar no Lobby
        conn.send({
          type: 'JOIN_LOBBY',
          payload: {
            id: this.peer.id,
            name: guestName,
            avatar: guestAvatar,
            isHost: false
          }
        });
      });
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao conectar:', err);
      alert('Não foi possível encontrar essa sala. Confirme se o código está correto!');
    });
  },

  /**
   * Configura os ouvintes de eventos da rede (LOBBY + JOGO)
   */
  setupListeners(conn, isHost) {
    conn.on('data', (data) => {
      console.log('[Multiplayer] Dados recebidos:', data);

      if (isHost) {
        // --- LÓGICA DO HOST ---
        if (data.type === 'JOIN_LOBBY') {
          // 1. Um novo cliente pediu para entrar no Lobby, então adicionamos na lista
          this.lobbyState.players.push(data.payload);
          
          // 2. O Host atualiza sua própria tela
          if (window.UI && typeof window.UI.updateLobby === 'function') {
            window.UI.updateLobby(this.lobbyState.players);
          }

          // 3. O Host avisa TODOS os clientes conectados da nova lista do Lobby
          if (window.Network) {
            window.Network.connections.forEach(connection => {
              connection.send({
                type: 'SYNC_LOBBY',
                payload: this.lobbyState.players
              });
            });
          }
        } else {
          // Se não for Lobby, é uma ação normal do jogo em andamento
          if (window.Actions) window.Actions.handleAction(data);
        }

      } else {
        // --- LÓGICA DO CLIENTE ---
        if (data.type === 'SYNC_LOBBY') {
          // O Host mandou a lista atualizada de quem está no Lobby, atualiza a tela
          if (window.UI && typeof window.UI.updateLobby === 'function') {
            window.UI.updateLobby(data.payload);
          }
        } else if (data.type === 'SYNC_GAME_STATE') {
          // O Host clicou em "Começar Jogo" e mandou o estado inicial. 
          // Ocultamos os modais de lobby/setup e abrimos o jogo
          const setupModal = document.getElementById('setup-modal') || document.querySelector('.setup-overlay');
          const lobbyModal = document.getElementById('tela-lobby'); // Adapte para o ID da sua tela de lobby
          
          if (setupModal) setupModal.classList.add('hidden');
          if (lobbyModal) lobbyModal.classList.add('hidden');
          
          const gameArea = document.getElementById('game-section-area');
          if (gameArea) gameArea.classList.remove('hidden');

          if (typeof window.scrollToGame === 'function') window.scrollToGame();
          if (window.UI) window.UI.update(data.payload);
        }
      }
    });
  }
};

Multiplayer.init();
window.Multiplayer = Multiplayer;
