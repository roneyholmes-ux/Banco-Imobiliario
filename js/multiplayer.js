/**
 * multiplayer.js
 * Gerencia a conexão PeerJS e integra com o jogo existente.
 */

window.multiplayerConnection = null;

const Multiplayer = {
  peer: null,
  roomCode: null,

  init() {
    // Escuta os eventos da UI original quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
      this.bindUIEvents();
    });
  },

  /**
   * Conecta os botões da interface real aos métodos do PeerJS
   */
  bindUIEvents() {
    // Botão de Criar Sala / Hospedar
    const btnCreate = document.getElementById('btn-create-room') || document.getElementById('btn-host-game');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => this.createRoom());
    }

    // Botão de Entrar na Sala
    const btnJoin = document.getElementById('btn-join-room') || document.getElementById('btn-connect-game');
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        const inputCode = document.getElementById('room-code-input') || document.getElementById('join-room-code');
        const code = inputCode ? inputCode.value : '';
        if (code) {
          this.joinRoom(code);
        } else {
          alert('Por favor, digite o código da sala!');
        }
      });
    }
  },

  /**
   * Inicializa como HOST (Cria a sala)
   */
  createRoom() {
    this.roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.peer = new Peer(`banco-imob-${this.roomCode}`);

    this.peer.on('open', (id) => {
      console.log(`[Multiplayer] Sala criada! Código: ${this.roomCode}`);

      if (window.Network) {
        window.Network.init(true, this.peer);
      }

      // Exibe o código da sala no elemento visual
      const display = document.getElementById('room-code-display') || document.getElementById('display-room-code');
      if (display) display.innerText = this.roomCode;

      alert(`Sala criada! Seu código é: ${this.roomCode}`);
    });

    this.peer.on('connection', (conn) => {
      console.log(`[Multiplayer] Cliente conectado: ${conn.peer}`);
      if (window.Network) window.Network.connections.push(conn);
      this.setupListeners(conn, true);
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao criar sala:', err);
    });
  },

  /**
   * Inicializa como CLIENTE (Entra em uma sala)
   */
  joinRoom(code) {
    this.roomCode = code.trim().toUpperCase();
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

        alert('Conectado com sucesso à sala!');
      });
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer] Erro ao conectar:', err);
      alert('Não foi possível conectar à sala. Verifique o código.');
    });
  },

  /**
   * Ouve mensagens recebidas
   */
  setupListeners(conn, isHost) {
    conn.on('data', (data) => {
      console.log('[Multiplayer] Recebido:', data);

      if (isHost) {
        if (window.Actions) window.Actions.handleAction(data);
      } else {
        if (data.type === 'SYNC_GAME_STATE' && window.UI) {
          window.UI.update(data.payload);
        }
      }
    });
  }
};

Multiplayer.init();
window.Multiplayer = Multiplayer;
