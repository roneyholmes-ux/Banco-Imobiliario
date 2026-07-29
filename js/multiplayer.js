// ==========================================
// GERENCIADOR MULTIPLAYER (multiplayer.js)
// ==========================================

class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.conn = null; 
    this.connections = []; 
    this.isHost = false;
    this.lobbyState = { players: [] };
    this.playerName = "Jogador " + Math.floor(Math.random() * 1000);
    this.overlay = null; 
  }

  // ==========================================
  // GERAÇÃO DINÂMICA DA INTERFACE (Bypass do HTML)
  // ==========================================
  openOnlineMenu() {
    if (typeof Peer === 'undefined') {
        alert("Erro: A biblioteca PeerJS não foi encontrada. Verifique se a tag <script> dela está no seu HTML.");
        return;
    }

    // Cria o fundo escuro do Modal
    this.overlay = document.createElement("div");
    this.overlay.id = "online-setup-overlay";
    this.overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.92); display: flex; justify-content: center;
        align-items: center; z-index: 9999; font-family: 'Montserrat', sans-serif;
    `;

    // Cria a caixa principal
    const setupBox = document.createElement("div");
    setupBox.id = "online-setup-box";
    setupBox.style = `
        background: #1e1e1e; border: 3px solid #1e90ff; border-radius: 12px;
        padding: 30px; text-align: center; color: white; max-width: 480px; width: 90%;
        box-shadow: 0px 10px 30px rgba(0,0,0,0.5);
    `;
    
    this.overlay.appendChild(setupBox);
    document.body.appendChild(this.overlay);

    this.renderStep1();
  }

  renderStep1() {
    const box = document.getElementById("online-setup-box");
    box.innerHTML = `
        <h2 style="margin-top: 0; color: #1e90ff; font-size: 1.8rem; margin-bottom: 10px;">🌐 MODO ONLINE</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;">Crie uma sala ou conecte-se a um amigo.</p>
        
        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
            <button id="btn-dyn-host" style="padding: 12px; font-size: 1.1rem; background: #1e90ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">👑 Criar Sala (Host)</button>
            <button id="btn-dyn-join" style="padding: 12px; font-size: 1.1rem; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🔗 Entrar em Sala</button>
        </div>
        
        <button id="btn-close-online" style="background: transparent; color: #aaa; border: none; cursor: pointer; text-decoration: underline;">Voltar ao Menu</button>
    `;

    document.getElementById("btn-dyn-host").addEventListener("click", () => this.hostGame());
    document.getElementById("btn-dyn-join").addEventListener("click", () => this.joinGame());
    document.getElementById("btn-close-online").addEventListener("click", () => this.closeMenu());
  }

  renderLobby(roomId = null) {
      const box = document.getElementById("online-setup-box");
      if (!box) return;

      let hostInfo = roomId 
        ? `<div style="margin-bottom:15px; padding:10px; background:#282828; border-radius:5px; border:1px solid #1e90ff;">Copie e envie este ID:<br><strong style="font-size:1.1rem; user-select:all; color:#1e90ff;">${roomId}</strong></div>` 
        : '';

      box.innerHTML = `
        <h2 style="margin-top: 0; color: #1e90ff; font-size: 1.5rem; margin-bottom: 10px;">SALA DE ESPERA</h2>
        ${hostInfo}
        <div style="background: #282828; padding: 15px; border-radius: 8px; border: 1px solid #444; text-align: left; margin-bottom: 20px; min-height: 120px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #ddd; font-size: 0.9rem;">Jogadores Conectados:</h4>
            <ul id="dyn-lobby-list" style="color: white; padding-left: 20px; line-height: 1.6; font-weight: bold; font-size: 1.1rem;"></ul>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
            ${this.isHost 
                ? `<button id="btn-dyn-start-match" style="padding: 10px 25px; font-size: 1.1rem; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Começar Partida 🚀</button>` 
                : `<p style="color: #ffb300; font-weight: bold;">⏳ Aguardando o Host iniciar o jogo...</p>`}
        </div>
      `;

      if (this.isHost) {
          document.getElementById("btn-dyn-start-match").addEventListener("click", () => this.startGame());
      }
      this.updateLobbyUI();
  }

  closeMenu() {
      if (this.overlay) {
          document.body.removeChild(this.overlay);
          this.overlay = null;
      }
  }

  // ==========================================
  // LÓGICA DO HOST
  // ==========================================
  hostGame() {
    this.isHost = true;
    this.playerName = prompt("Qual o seu nome?", this.playerName) || this.playerName;
    
    this.peer = new Peer(); 
    this.peer.on('open', (id) => {
      this.lobbyState.players.push({ id: id, name: this.playerName, isHost: true });
      this.renderLobby(id);
    });

    this.peer.on('connection', (conn) => {
      this.connections.push(conn);
      this.setupHostListeners(conn);
    });
  }

  setupHostListeners(conn) {
    conn.on('data', (data) => {
      if (data.type === 'PLAYER_JOINED') {
        this.lobbyState.players.push(data.payload);
        this.broadcastLobbyUpdate(); 
        this.updateLobbyUI(); 
      }
    });
  }

  broadcastLobbyUpdate() {
    this.connections.forEach(conn => {
      conn.send({ type: 'LOBBY_UPDATE', payload: this.lobbyState });
    });
  }

  // ==========================================
  // LÓGICA DO CLIENTE
  // ==========================================
  joinGame() {
    this.isHost = false;
    const hostId = prompt("Cole o ID da sala:");
    if (!hostId) return;

    this.playerName = prompt("Qual o seu nome?", this.playerName) || this.playerName;
    
    this.peer = new Peer();
    this.peer.on('open', (id) => {
      this.conn = this.peer.connect(hostId);
      
      this.conn.on('open', () => {
        this.conn.send({
          type: 'PLAYER_JOINED',
          payload: { id: id, name: this.playerName, isHost: false }
        });
        
        this.setupClientListeners();
        this.renderLobby();
      });
    });
  }

  setupClientListeners() {
    this.conn.on('data', (data) => {
      if (data.type === 'LOBBY_UPDATE') {
        this.lobbyState = data.payload;
        this.updateLobbyUI();
      } 
      else if (data.type === 'SYNC_GAME_STATE') {
        this.closeMenu();
        if (window.startMultiplayerGame) {
          window.startMultiplayerGame(data.payload.players, data.payload.config);
        }
      }
    });
  }

  // ==========================================
  // ATUALIZAÇÃO E INÍCIO
  // ==========================================
  updateLobbyUI() {
    const lobbyList = document.getElementById('dyn-lobby-list');
    if (!lobbyList) return;
    
    lobbyList.innerHTML = '';
    this.lobbyState.players.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.name + (p.isHost ? " (👑 Host)" : "");
      lobbyList.appendChild(li);
    });
  }

  startGame() {
    if (!this.isHost) return;
    
    this.closeMenu();
    
    if (window.startMultiplayerGame) {
      window.startMultiplayerGame(this.lobbyState.players, null);
    }

    this.connections.forEach(conn => {
      conn.send({
        type: 'SYNC_GAME_STATE',
        payload: { players: this.lobbyState.players, config: null }
      });
    });
  }
}

// Inicializa a rede globalmente
window.Network = new MultiplayerManager();
