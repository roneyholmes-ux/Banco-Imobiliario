// ==========================================
// GERENCIADOR MULTIPLAYER (multiplayer.js)
// ==========================================

class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.conn = null; // Conexão ativa (para quem é Cliente)
    this.connections = []; // Lista de conexões ativas (para quem é Host)
    this.isHost = false;
    this.lobbyState = {
      players: []
    };
    this.playerName = "Jogador " + Math.floor(Math.random() * 1000);
  }

  // Inicializa os botões da interface
  init() {
    this.bindUI();
  }

  bindUI() {
    const btnHost = document.getElementById('btn-host-game');
    const btnJoin = document.getElementById('btn-join-game');
    const btnStart = document.getElementById('btn-start-multiplayer');
    
    if(btnHost) btnHost.addEventListener('click', () => this.hostGame());
    if(btnJoin) btnJoin.addEventListener('click', () => this.joinGame());
    if(btnStart) btnStart.addEventListener('click', () => this.startGame());
  }

  // ==========================================
  // LÓGICA DO HOST (CRIAR SALA)
  // ==========================================
  hostGame() {
    this.isHost = true;
    this.playerName = prompt("Qual o seu nome?", this.playerName) || this.playerName;
    
    // Inicializa o PeerJS
    this.peer = new Peer(); 
    
    this.peer.on('open', (id) => {
      console.log('[Multiplayer] Host criado com ID:', id);
      alert(`Sala criada!\nCompartilhe este ID com seus amigos:\n\n${id}`);
      
      // Adiciona o próprio Host na lista do Lobby
      this.lobbyState.players.push({ id: id, name: this.playerName, isHost: true });
      this.updateLobbyUI();
      this.showLobby();
    });

    // Escuta novas pessoas se conectando
    this.peer.on('connection', (conn) => {
      this.connections.push(conn);
      this.setupHostListeners(conn);
    });
  }

  // Escuta as mensagens que os Clientes enviam para o Host
  setupHostListeners(conn) {
    conn.on('data', (data) => {
      // Quando um cliente novo entra
      if (data.type === 'PLAYER_JOINED') {
        this.lobbyState.players.push(data.payload);
        this.broadcastLobbyUpdate(); // Avisa todos da nova lista
        this.updateLobbyUI(); // Atualiza a tela do Host
      }
    });
  }

  // Avisa todos os clientes sobre mudanças no Lobby
  broadcastLobbyUpdate() {
    this.connections.forEach(conn => {
      conn.send({
        type: 'LOBBY_UPDATE',
        payload: this.lobbyState
      });
    });
  }

  // ==========================================
  // LÓGICA DO CLIENTE (ENTRAR NA SALA)
  // ==========================================
  joinGame() {
    this.isHost = false;
    const hostId = prompt("Digite o ID da sala:");
    if (!hostId) return;

    this.playerName = prompt("Qual o seu nome?", this.playerName) || this.playerName;
    
    this.peer = new Peer();
    this.peer.on('open', (id) => {
      this.conn = this.peer.connect(hostId);
      
      this.conn.on('open', () => {
        console.log('[Multiplayer] Conectado ao Host!');
        // Avisa o host quem acabou de entrar
        this.conn.send({
          type: 'PLAYER_JOINED',
          payload: { id: id, name: this.playerName, isHost: false }
        });
        
        this.setupClientListeners();
        this.showLobby();
      });
    });
  }

  // Escuta as mensagens que o Host envia para o Cliente
  setupClientListeners() {
    this.conn.on('data', (data) => {
      
      // Recebeu a atualização da lista do Lobby
      if (data.type === 'LOBBY_UPDATE') {
        this.lobbyState = data.payload;
        this.updateLobbyUI();
      } 
      
      // Recebeu o aviso para COMEÇAR O JOGO
      else if (data.type === 'SYNC_GAME_STATE') {
        console.log('[Multiplayer] O Host começou o jogo! Carregando tabuleiro...');
        
        // Esconde os menus
        document.getElementById('setup-modal')?.classList.add('hidden');
        document.querySelector('.setup-overlay')?.classList.add('hidden');
        document.getElementById('online-modal')?.classList.add('hidden');
        
        // Inicia o jogo no cliente usando a função do game.js
        if (window.startMultiplayerGame) {
          window.startMultiplayerGame(data.payload.players, data.payload.config);
        }
      }
    });
  }

  // ==========================================
  // ATUALIZAÇÃO DE INTERFACE E INÍCIO DE JOGO
  // ==========================================
  updateLobbyUI() {
    const lobbyList = document.getElementById('lobby-players-list');
    if (!lobbyList) return;
    
    lobbyList.innerHTML = '';
    this.lobbyState.players.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.name + (p.isHost ? " (👑 Host)" : "");
      lobbyList.appendChild(li);
    });
  }

  showLobby() {
    // Esconde o setup inicial
    document.getElementById('setup-modal')?.classList.add('hidden');
    document.querySelector('.setup-overlay')?.classList.add('hidden');
    
    // Mostra o modal de espera do Lobby
    const onlineModal = document.getElementById('online-modal');
    if (onlineModal) onlineModal.classList.remove('hidden');

    // Somente o Host pode ver o botão de começar a partida
    const btnStart = document.getElementById('btn-start-multiplayer');
    if (btnStart) {
      btnStart.style.display = this.isHost ? 'block' : 'none';
    }
  }

  // Função disparada quando o Host clica em "Começar Partida"
  startGame() {
    if (!this.isHost) return;
    console.log('[Multiplayer] O Host iniciou a partida!');

    // 1. Esconde o modal na tela do Host
    document.getElementById('online-modal')?.classList.add('hidden');
    
    // 2. Inicia o jogo localmente na tela do Host
    if (window.startMultiplayerGame) {
      window.startMultiplayerGame(this.lobbyState.players, window.GAME_CONFIG);
    }

    // 3. Dispara a ordem de Iniciar Jogo para todos os Clientes conectados
    this.connections.forEach(conn => {
      conn.send({
        type: 'SYNC_GAME_STATE',
        payload: {
          players: this.lobbyState.players,
          config: window.GAME_CONFIG 
        }
      });
    });
  }
}

// Cria a instância global para que o game.js consiga acessar depois
window.Network = new MultiplayerManager();

// Inicializa os botões assim que a página carregar
window.addEventListener('DOMContentLoaded', () => {
  window.Network.init();
});
