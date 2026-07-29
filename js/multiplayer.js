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

  // Gera ID curto de 5 caracteres (sem caracteres confusos como 0, O, 1, I)
  generateShortId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ==========================================
  // GERAÇÃO DINÂMICA DA INTERFACE
  // ==========================================
  openOnlineMenu() {
    if (typeof Peer === 'undefined') {
        alert("Erro: A biblioteca PeerJS não foi encontrada. Verifique se a tag <script> dela está no seu HTML.");
        return;
    }

    if (this.overlay) return;

    this.overlay = document.createElement("div");
    this.overlay.id = "online-setup-overlay";
    this.overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.92); display: flex; justify-content: center;
        align-items: center; z-index: 9999; font-family: 'Montserrat', sans-serif;
    `;

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
    if (!box) return;

    box.innerHTML = `
        <h2 style="margin-top: 0; color: #1e90ff; font-size: 1.8rem; margin-bottom: 10px;">🌐 MODO ONLINE</h2>
        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;">Crie uma sala ou conecte-se a um amigo.</p>
        
        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
            <button id="btn-dyn-host" style="padding: 12px; font-size: 1.1rem; background: #1e90ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">👑 Criar Sala (Host)</button>
            <button id="btn-dyn-join" style="padding: 12px; font-size: 1.1rem; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🔗 Entrar em Sala</button>
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
        ? `<div style="margin-bottom:15px; padding:12px; background:#282828; border-radius:6px; border:1px solid #1e90ff;">
            <span style="font-size:0.85rem; color:#aaa;">Código da Sala:</span><br>
            <strong style="font-size:1.8rem; color:#1e90ff; letter-spacing: 4px; font-family:monospace;">${roomId}</strong>
            <button id="btn-copy-id" style="margin-top:8px; display:block; width:100%; padding:8px; background:#1e90ff; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">📋 Copiar Código</button>
           </div>` 
        : '';

      box.innerHTML = `
        <h2 style="margin-top: 0; color: #1e90ff; font-size: 1.5rem; margin-bottom: 10px;">SALA DE ESPERA</h2>
        ${hostInfo}
        <div style="background: #282828; padding: 15px; border-radius: 8px; border: 1px solid #444; text-align: left; margin-bottom: 20px; min-height: 120px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #ddd; font-size: 0.9rem;">Jogadores Conectados:</h4>
            <ul id="dyn-lobby-list" style="color: white; padding-left: 20px; line-height: 1.6; font-weight: bold; font-size: 1.1rem; margin:0;"></ul>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
            ${this.isHost 
                ? `<button id="btn-dyn-start-match" style="padding: 10px 25px; font-size: 1.1rem; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Começar Partida 🚀</button>` 
                : `<p style="color: #ffb300; font-weight: bold;">⏳ Aguardando o Host iniciar o jogo...</p>`}
        </div>
      `;

      if (roomId) {
          const btnCopy = document.getElementById("btn-copy-id");
          if (btnCopy) {
              btnCopy.addEventListener("click", () => {
                  navigator.clipboard.writeText(roomId);
                  btnCopy.innerText = "✓ Copiado!";
                  btnCopy.style.background = "#2e7d32";
                  setTimeout(() => {
                      btnCopy.innerText = "📋 Copiar Código";
                      btnCopy.style.background = "#1e90ff";
                  }, 2000);
              });
          }
      }

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

  destroyPeer() {
      if (this.conn) {
          this.conn.close();
          this.conn = null;
      }
      this.connections.forEach(c => c.close());
      this.connections = [];
      if (this.peer) {
          this.peer.destroy();
          this.peer = null;
      }
      this.lobbyState = { players: [] };
  }

  // ==========================================
  // MOTOR DE SINCRONIZAÇÃO DE JOGO 
  // ==========================================

  sendGameAction(actionType, dataPayload) {
      const message = {
          type: 'GAME_ACTION',
          action: actionType,
          payload: dataPayload
      };

      if (this.isHost) {
          this.processGameAction(message);
          this.connections.forEach(conn => {
              if (conn.open) conn.send(message);
          });
      } else {
          if (this.conn && this.conn.open) {
              this.conn.send(message);
          } else {
              console.warn("[Network] Conexão com o Host indisponível.");
          }
      }
  }

  processGameAction(message) {
      const { action, payload } = message;
      console.log(`[Sync] Ação recebida: ${action}`, payload);

      switch(action) {
          case 'ROLL_DICE':
              if (typeof window.executeDiceRoll === 'function') {
                  window.executeDiceRoll(payload);
              } else if (typeof window.rolarDado === 'function') {
                  window.rolarDado(payload);
              } else {
                  console.warn("[Sync] Função 'window.executeDiceRoll' não encontrada no script principal!");
              }
              break;
          case 'BUY_PROPERTY':
              if (typeof window.executeBuyProperty === 'function') window.executeBuyProperty(payload);
              break;
          case 'END_TURN':
              if (typeof window.executeEndTurn === 'function') window.executeEndTurn(payload);
              break;
          default:
              console.warn("Ação não reconhecida:", action);
      }
  }

  // ==========================================
  // LÓGICA DO HOST
  // ==========================================
  hostGame() {
    this.destroyPeer();
    this.isHost = true;
    
    const inputName = prompt("Qual o seu nome?", this.playerName);
    if (!inputName) return;
    this.playerName = inputName;
    
    // Cria sala com ID de 5 caracteres
    const shortId = this.generateShortId();
    this.peer = new Peer(shortId); 

    this.peer.on('open', (id) => {
      this.lobbyState.players = [{ id: id, name: this.playerName, isHost: true }];
      this.renderLobby(id);
    });

    this.peer.on('connection', (conn) => {
      this.connections.push(conn);
      this.setupHostListeners(conn);
    });

    this.peer.on('error', (err) => {
      console.error("[PeerJS Error]", err);
      if (err.type === 'unavailable-id') {
          // Se houver colisão de ID no servidor PeerJS, tenta gerar outro
          this.hostGame();
      } else {
          alert("Erro no servidor de conexão: " + err.type);
      }
    });
  }

  setupHostListeners(conn) {
    conn.on('data', (data) => {
      if (data.type === 'PLAYER_JOINED') {
        if (!this.lobbyState.players.some(p => p.id === data.payload.id)) {
            this.lobbyState.players.push(data.payload);
        }
        this.broadcastLobbyUpdate(); 
        this.updateLobbyUI(); 
      }
      else if (data.type === 'GAME_ACTION') {
        this.processGameAction(data);
        this.connections.forEach(c => {
            if (c.peer !== conn.peer && c.open) c.send(data); 
        });
      }
    });

    conn.on('close', () => {
        this.connections = this.connections.filter(c => c.peer !== conn.peer);
        this.lobbyState.players = this.lobbyState.players.filter(p => p.id !== conn.peer);
        this.broadcastLobbyUpdate();
        this.updateLobbyUI();
    });
  }

  broadcastLobbyUpdate() {
    this.connections.forEach(conn => {
      if (conn.open) {
          conn.send({ type: 'LOBBY_UPDATE', payload: this.lobbyState });
      }
    });
  }

  // ==========================================
  // LÓGICA DO CLIENTE
  // ==========================================
  joinGame() {
    const inputHostId = prompt("Digite o código da sala (5 caracteres):");
    if (!inputHostId) return;
    const hostId = inputHostId.trim().toUpperCase();

    const inputName = prompt("Qual o seu nome?", this.playerName);
    if (!inputName) return;
    this.playerName = inputName;

    this.destroyPeer();
    this.isHost = false;
    
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

    this.peer.on('error', (err) => {
      console.error("[PeerJS Error]", err);
      alert("Não foi possível encontrar a sala '" + hostId + "'. Verifique o código digitado.");
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
      else if (data.type === 'GAME_ACTION') {
        this.processGameAction(data);
      }
    });

    this.conn.on('close', () => {
        alert("A conexão com o Host foi perdida.");
        this.closeMenu();
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
      if (conn.open) {
          conn.send({
            type: 'SYNC_GAME_STATE',
            payload: { players: this.lobbyState.players, config: null }
          });
      }
    });
  }
}

// Inicializa a rede globalmente
window.Network = new MultiplayerManager();
