```javascript
// ==========================================
// GERENCIADOR MULTIPLAYER (multiplayer.js)
// BANCO IMOBILIÁRIO - VERSÃO SINCRONIZADA
// ==========================================
//
// ARQUITETURA:
//
//  CLIENTE
//     ↓
//  envia pedido de ação
//     ↓
//  HOST
//     ↓
//  executa a ação
//     ↓
//  HOST envia o estado completo
//     ↓
//  TODOS atualizam suas telas
//
// O HOST é a autoridade da partida.
// Os clientes NÃO executam ações recebidas diretamente.
// ==========================================

class MultiplayerManager {

  constructor() {

    // ------------------------------------------
    // CONEXÃO PEERJS
    // ------------------------------------------

    this.peer = null;

    // Conexão do cliente com o Host
    this.conn = null;

    // Conexões dos clientes quando este navegador é Host
    this.connections = [];

    // ------------------------------------------
    // ESTADO DA SALA
    // ------------------------------------------

    this.isHost = false;

    this.lobbyState = {
      players: []
    };

    this.playerName =
      "Jogador " + Math.floor(Math.random() * 1000);

    this.overlay = null;

    // ------------------------------------------
    // CONTROLE DA PARTIDA
    // ------------------------------------------

    this.gameStarted = false;

    // Evita que várias sincronizações sejam executadas
    // ao mesmo tempo.
    this.syncTimer = null;

    // Identificador simples da partida
    this.gameId = null;
  }


  // ==========================================
  // GERA ID CURTO DA SALA
  // ==========================================

  generateShortId() {

    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';

    for (let i = 0; i < 5; i++) {

      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );

    }

    return result;
  }


  // ==========================================
  // INTERFACE ONLINE
  // ==========================================

  openOnlineMenu() {

    if (typeof Peer === 'undefined') {

      alert(
        "Erro: a biblioteca PeerJS não foi encontrada no HTML."
      );

      return;
    }

    if (this.overlay) return;


    // ------------------------------------------
    // CRIA OVERLAY
    // ------------------------------------------

    this.overlay = document.createElement("div");

    this.overlay.id =
      "online-setup-overlay";

    this.overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.92);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: 'Montserrat', sans-serif;
    `;


    const setupBox =
      document.createElement("div");

    setupBox.id =
      "online-setup-box";

    setupBox.style = `
      background: #1e1e1e;
      border: 3px solid #1e90ff;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      color: white;
      max-width: 480px;
      width: 90%;
      box-shadow: 0px 10px 30px rgba(0,0,0,0.5);
    `;


    this.overlay.appendChild(setupBox);

    document.body.appendChild(
      this.overlay
    );


    this.renderStep1();
  }


  // ==========================================
  // PRIMEIRA TELA
  // ==========================================

  renderStep1() {

    const box =
      document.getElementById(
        "online-setup-box"
      );

    if (!box) return;


    box.innerHTML = `

      <h2 style="
        margin-top: 0;
        color: #1e90ff;
        font-size: 1.8rem;
        margin-bottom: 10px;
      ">
        🌐 MODO ONLINE
      </h2>

      <p style="
        color: #aaa;
        font-size: 0.9rem;
        margin-bottom: 20px;
      ">
        Crie uma sala ou conecte-se a um amigo.
      </p>

      <div style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 25px;
      ">

        <button
          id="btn-dyn-host"
          style="
            padding: 12px;
            font-size: 1.1rem;
            background: #1e90ff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
          "
        >
          👑 Criar Sala (Host)
        </button>


        <button
          id="btn-dyn-join"
          style="
            padding: 12px;
            font-size: 1.1rem;
            background: #2e7d32;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
          "
        >
          🔗 Entrar em Sala
        </button>

      </div>


      <button
        id="btn-close-online"
        style="
          background: transparent;
          color: #aaa;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        "
      >
        Voltar ao Menu
      </button>
    `;


    document
      .getElementById("btn-dyn-host")
      .addEventListener(
        "click",
        () => this.hostGame()
      );


    document
      .getElementById("btn-dyn-join")
      .addEventListener(
        "click",
        () => this.joinGame()
      );


    document
      .getElementById("btn-close-online")
      .addEventListener(
        "click",
        () => this.closeMenu()
      );
  }


  // ==========================================
  // LOBBY
  // ==========================================

  renderLobby(roomId = null) {

    const box =
      document.getElementById(
        "online-setup-box"
      );

    if (!box) return;


    let hostInfo = roomId

      ? `
        <div style="
          margin-bottom:15px;
          padding:12px;
          background:#282828;
          border-radius:6px;
          border:1px solid #1e90ff;
        ">

          <span style="
            font-size:0.85rem;
            color:#aaa;
          ">
            Código da Sala:
          </span>

          <br>

          <strong style="
            font-size:1.8rem;
            color:#1e90ff;
            letter-spacing:4px;
            font-family:monospace;
          ">
            ${roomId}
          </strong>


          <button
            id="btn-copy-id"
            style="
              margin-top:8px;
              display:block;
              width:100%;
              padding:8px;
              background:#1e90ff;
              color:white;
              border:none;
              border-radius:4px;
              cursor:pointer;
              font-weight:bold;
            "
          >
            📋 Copiar Código
          </button>

        </div>
      `

      : '';


    box.innerHTML = `

      <h2 style="
        margin-top:0;
        color:#1e90ff;
        font-size:1.5rem;
        margin-bottom:10px;
      ">
        SALA DE ESPERA
      </h2>


      ${hostInfo}


      <div style="
        background:#282828;
        padding:15px;
        border-radius:8px;
        border:1px solid #444;
        text-align:left;
        margin-bottom:20px;
        min-height:120px;
      ">

        <h4 style="
          margin-top:0;
          margin-bottom:10px;
          color:#ddd;
          font-size:0.9rem;
        ">
          Jogadores Conectados:
        </h4>

        <ul
          id="dyn-lobby-list"
          style="
            color:white;
            padding-left:20px;
            line-height:1.6;
            font-weight:bold;
            font-size:1.1rem;
            margin:0;
          "
        >
        </ul>

      </div>


      <div style="
        display:flex;
        gap:10px;
        justify-content:center;
      ">

        ${
          this.isHost

          ? `
            <button
              id="btn-dyn-start-match"
              style="
                padding:10px 25px;
                font-size:1.1rem;
                background:#ff4757;
                color:white;
                border:none;
                border-radius:6px;
                cursor:pointer;
                font-weight:bold;
              "
            >
              Começar Partida 🚀
            </button>
          `

          : `
            <p style="
              color:#ffb300;
              font-weight:bold;
            ">
              ⏳ Aguardando o Host iniciar o jogo...
            </p>
          `
        }

      </div>
    `;


    // ------------------------------------------
    // COPIAR CÓDIGO
    // ------------------------------------------

    if (roomId) {

      const btnCopy =
        document.getElementById(
          "btn-copy-id"
        );

      if (btnCopy) {

        btnCopy.addEventListener(
          "click",
          async () => {

            try {

              await navigator
                .clipboard
                .writeText(roomId);

              btnCopy.innerText =
                "✓ Copiado!";

              btnCopy.style.background =
                "#2e7d32";

              setTimeout(() => {

                btnCopy.innerText =
                  "📋 Copiar Código";

                btnCopy.style.background =
                  "#1e90ff";

              }, 2000);

            } catch (error) {

              alert(
                "Não foi possível copiar automaticamente. Código: " +
                roomId
              );

            }

          }
        );

      }

    }


    // ------------------------------------------
    // BOTÃO DO HOST
    // ------------------------------------------

    if (this.isHost) {

      const startButton =
        document.getElementById(
          "btn-dyn-start-match"
        );

      if (startButton) {

        startButton.addEventListener(
          "click",
          () => this.startGame()
        );

      }

    }


    this.updateLobbyUI();
  }


  // ==========================================
  // FECHAR MENU
  // ==========================================

  closeMenu() {

    if (!this.overlay) return;

    try {

      document.body.removeChild(
        this.overlay
      );

    } catch (error) {

      console.warn(
        "[Multiplayer] Overlay já removido."
      );

    }

    this.overlay = null;
  }


  // ==========================================
  // DESTRUIR CONEXÃO
  // ==========================================

  destroyPeer() {

    if (this.syncTimer) {

      clearInterval(
        this.syncTimer
      );

      this.syncTimer = null;
    }


    if (this.conn) {

      try {
        this.conn.close();
      } catch (e) {}

      this.conn = null;
    }


    this.connections.forEach(
      connection => {

        try {
          connection.close();
        } catch (e) {}

      }
    );


    this.connections = [];


    if (this.peer) {

      try {
        this.peer.destroy();
      } catch (e) {}

      this.peer = null;
    }


    this.lobbyState = {
      players: []
    };


    this.gameStarted = false;
  }


  // ==========================================
  // ESTADO COMPLETO DA PARTIDA
  // ==========================================
  //
  // O Host usa esta função para construir
  // uma fotografia completa do jogo.
  //
  // Os clientes recebem essa fotografia e
  // substituem o estado local.
  // ==========================================

  getGameState() {

    const state = {

      players:
        typeof players !== "undefined"
          ? JSON.parse(
              JSON.stringify(players)
            )
          : [],


      boardSpaces:
        typeof boardSpaces !== "undefined"
          ? JSON.parse(
              JSON.stringify(boardSpaces)
            )
          : [],


      currentPlayerIndex:
        typeof currentPlayerIndex !== "undefined"
          ? currentPlayerIndex
          : 0,


      awaitingDecision:
        typeof awaitingDecision !== "undefined"
          ? awaitingDecision
          : false,


      isMoving:
        typeof isMoving !== "undefined"
          ? isMoving
          : false,


      gameConfig:
        typeof GAME_CONFIG !== "undefined"
          ? JSON.parse(
              JSON.stringify(GAME_CONFIG)
            )
          : null,

      timestamp:
        Date.now()

    };


    return state;
  }


  // ==========================================
  // APLICA ESTADO RECEBIDO DO HOST
  // ==========================================

  applyGameState(state) {

    if (!state) return;


    try {

      // ----------------------------------------
      // JOGADORES
      // ----------------------------------------

      if (
        Array.isArray(state.players)
      ) {

        players =
          JSON.parse(
            JSON.stringify(
              state.players
            )
          );

      }


      // ----------------------------------------
      // TABULEIRO
      // ----------------------------------------

      if (
        Array.isArray(state.boardSpaces)
      ) {

        boardSpaces =
          JSON.parse(
            JSON.stringify(
              state.boardSpaces
            )
          );

      }


      // ----------------------------------------
      // TURNO
      // ----------------------------------------

      if (
        typeof state.currentPlayerIndex ===
        "number"
      ) {

        currentPlayerIndex =
          state.currentPlayerIndex;

      }


      // ----------------------------------------
      // DECISÃO
      // ----------------------------------------

      if (
        typeof state.awaitingDecision ===
        "boolean"
      ) {

        awaitingDecision =
          state.awaitingDecision;

      }


      // ----------------------------------------
      // MOVIMENTO
      // ----------------------------------------

      if (
        typeof state.isMoving ===
        "boolean"
      ) {

        isMoving =
          state.isMoving;

      }


      // ----------------------------------------
      // CONFIGURAÇÕES
      // ----------------------------------------

      if (state.gameConfig) {

        GAME_CONFIG =
          JSON.parse(
            JSON.stringify(
              state.gameConfig
            )
          );

      }


      // ----------------------------------------
      // GARANTE QUE O TABULEIRO EXISTE
      // ----------------------------------------

      const gameArea =
        document.getElementById(
          "game-section-area"
        );

      if (gameArea) {

        gameArea.classList.remove(
          "hidden"
        );

      }


      // ----------------------------------------
      // REDESENHA TUDO
      // ----------------------------------------

      if (
        typeof renderBoard ===
        "function"
      ) {

        renderBoard();

      }


      if (
        typeof renderPawns ===
        "function"
      ) {

        renderPawns();

      }


      if (
        typeof updateUI ===
        "function"
      ) {

        updateUI();

      }


      // ----------------------------------------
      // ATUALIZA MENSAGEM
      // ----------------------------------------

      const status =
        document.getElementById(
          "game-status"
        );


      if (
        status &&
        players &&
        players[currentPlayerIndex]
      ) {

        status.innerHTML =
          `É a vez de <strong>${
            players[currentPlayerIndex].name
          }</strong> jogar!`;

      }


      console.log(
        "[Multiplayer] Estado recebido e aplicado.",
        state
      );

    } catch (error) {

      console.error(
        "[Multiplayer] Erro ao aplicar estado:",
        error
      );

    }

  }


  // ==========================================
  // ENVIA ESTADO COMPLETO
  // ==========================================

  broadcastGameState() {

    if (!this.isHost) return;

    if (!this.gameStarted) return;


    const state =
      this.getGameState();


    const message = {

      type:
        "SYNC_GAME_STATE",

      payload:
        state,

      timestamp:
        Date.now()

    };


    this.connections.forEach(
      connection => {

        if (
          connection &&
          connection.open
        ) {

          try {

            connection.send(
              message
            );

          } catch (error) {

            console.error(
              "[Multiplayer] Erro ao enviar estado:",
              error
            );

          }

        }

      }
    );


    console.log(
      "[Multiplayer] Estado enviado aos jogadores.",
      state
    );

  }


  // ==========================================
  // SINCRONIZAÇÃO CONTÍNUA TEMPORÁRIA
  // ==========================================
  //
  // Algumas funções do game.js são assíncronas.
  //
  // Exemplo:
  //
  // movePlayer()
  //
  // que movimenta o peão passo a passo.
  //
  // Durante essas ações fazemos algumas
  // sincronizações rápidas para que os clientes
  // acompanhem o Host.
  // ==========================================

  startTemporarySync(duration = 5000) {

    if (!this.isHost) return;


    if (this.syncTimer) {

      clearInterval(
        this.syncTimer
      );

    }


    this.syncTimer =
      setInterval(
        () => {

          if (
            !this.gameStarted
          ) {

            clearInterval(
              this.syncTimer
            );

            this.syncTimer = null;

            return;
          }


          this.broadcastGameState();

        },
        300
      );


    setTimeout(
      () => {

        if (this.syncTimer) {

          clearInterval(
            this.syncTimer
          );

          this.syncTimer = null;

          // Último estado definitivo
          this.broadcastGameState();

        }

      },
      duration
    );

  }


  // ==========================================
  // ENVIO DE AÇÃO
  // ==========================================
  //
  // Esta é a função utilizada pelo game.js:
  //
  // Network.sendGameAction(...)
  //
  // IMPORTANTE:
  //
  // CLIENTE:
  //     não executa
  //     apenas envia ao Host
  //
  // HOST:
  //     executa
  //     depois sincroniza
  // ==========================================

  sendGameAction(
    actionType,
    dataPayload = {}
  ) {

    const message = {

      type:
        "GAME_ACTION",

      action:
        actionType,

      payload:
        dataPayload,

      senderId:
        this.peer
          ? this.peer.id
          : null,

      timestamp:
        Date.now()

    };


    console.log(
      "[Multiplayer] Ação solicitada:",
      message
    );


    // ----------------------------------------
    // HOST
    // ----------------------------------------

    if (this.isHost) {

      this.processHostAction(
        message
      );

      return;

    }


    // ----------------------------------------
    // CLIENTE
    // ----------------------------------------

    if (
      this.conn &&
      this.conn.open
    ) {

      this.conn.send(
        message
      );

    } else {

      console.warn(
        "[Multiplayer] Cliente sem conexão com o Host."
      );

    }

  }


  // ==========================================
  // COMPATIBILIDADE COM Network.sendAction()
  // ==========================================

  sendAction(
    actionType,
    payload = {}
  ) {

    // Se não estiver em uma partida online,
    // mantém o comportamento local.

    if (!this.gameStarted) {

      if (
        actionType === "ROLL_DICE" &&
        typeof rollDice ===
        "function"
      ) {

        rollDice();

      }

      else if (
        actionType === "BUY_PROPERTY" &&
        typeof buyProperty ===
        "function"
      ) {

        buyProperty();

      }

      else if (
        actionType === "END_TURN" &&
        typeof nextTurn ===
        "function"
      ) {

        nextTurn();

      }

      return;
    }


    this.sendGameAction(
      actionType,
      payload
    );

  }


  // ==========================================
  // PROCESSAMENTO DO HOST
  // ==========================================

  processHostAction(message) {

    if (!this.isHost) return;


    const {
      action,
      payload
    } = message;


    console.log(
      "[HOST] Executando ação:",
      action,
      payload
    );


    // ----------------------------------------
    // VALIDAÇÃO BÁSICA
    // ----------------------------------------

    if (
      !action
    ) {

      console.warn(
        "[HOST] Ação sem tipo recebida."
      );

      return;
    }


    // ----------------------------------------
    // EXECUTA A REGRA REAL DO JOGO
    // ----------------------------------------

    if (
      typeof window.executeMultiplayerAction ===
      "function"
    ) {

      try {

        window.executeMultiplayerAction(
          action,
          payload
        );

      } catch (error) {

        console.error(
          "[HOST] Erro ao executar ação:",
          error
        );

      }

    } else {

      console.error(
        "[HOST] executeMultiplayerAction() não encontrada."
      );

      return;
    }


    // ----------------------------------------
    // ENVIA O ESTADO
    // ----------------------------------------
    //
    // Primeiro fazemos uma sincronização
    // imediata.
    //
    // Depois fazemos sincronizações temporárias
    // para acompanhar movimentos/animações.
    // ----------------------------------------

    setTimeout(
      () => {

        this.broadcastGameState();

      },
      100
    );


    this.startTemporarySync(
      5000
    );

  }


  // ==========================================
  // PROCESSAMENTO DE MENSAGENS RECEBIDAS
  // ==========================================

  processIncomingGameAction(
    message
  ) {

    if (!this.isHost) return;

    this.processHostAction(
      message
    );

  }


  // ==========================================
  // HOST
  // ==========================================

  hostGame() {

    this.destroyPeer();

    this.isHost = true;

    this.gameStarted = false;


    const inputName =
      prompt(
        "Qual o seu nome?",
        this.playerName
      );


    if (!inputName) {

      this.isHost = false;

      return;

    }


    this.playerName =
      inputName.trim();


    // ----------------------------------------
    // GERA CÓDIGO DA SALA
    // ----------------------------------------

    const shortId =
      this.generateShortId();


    this.gameId =
      shortId;


    this.peer =
      new Peer(shortId);


    // ----------------------------------------
    // PEER ABERTO
    // ----------------------------------------

    this.peer.on(
      "open",
      id => {

        console.log(
          "[HOST] Sala criada:",
          id
        );


        this.lobbyState = {

          players: [

            {
              id: id,
              peerId: id,
              name: this.playerName,
              isHost: true
            }

          ]

        };


        this.renderLobby(
          id
        );

      }
    );


    // ----------------------------------------
    // NOVO JOGADOR
    // ----------------------------------------

    this.peer.on(
      "connection",
      conn => {

        console.log(
          "[HOST] Nova conexão:",
          conn.peer
        );


        this.connections.push(
          conn
        );


        this.setupHostListeners(
          conn
        );

      }
    );


    // ----------------------------------------
    // ERRO PEERJS
    // ----------------------------------------

    this.peer.on(
      "error",
      err => {

        console.error(
          "[PeerJS Error]",
          err
        );


        if (
          err.type ===
          "unavailable-id"
        ) {

          // Tenta criar outro código
          setTimeout(
            () => this.hostGame(),
            300
          );

        }

        else {

          alert(
            "Erro no servidor de conexão: " +
            err.type
          );

        }

      }
    );

  }


  // ==========================================
  // LISTENERS DO HOST
  // ==========================================

  setupHostListeners(
    conn
  ) {

    conn.on(
      "open",
      () => {

        console.log(
          "[HOST] Conexão aberta com:",
          conn.peer
        );

      }
    );


    conn.on(
      "data",
      data => {

        console.log(
          "[HOST] Mensagem recebida:",
          data
        );


        // --------------------------------------
        // JOGADOR ENTROU
        // --------------------------------------

        if (
          data &&
          data.type ===
          "PLAYER_JOINED"
        ) {

          const newPlayer =
            data.payload;


          if (
            newPlayer &&
            !this.lobbyState.players.some(
              p =>
                p.id ===
                newPlayer.id
            )
          ) {

            this.lobbyState.players.push(
              newPlayer
            );

          }


          this.broadcastLobbyUpdate();

          this.updateLobbyUI();


          // Se a partida já começou,
          // envia o estado atual para o jogador.
          if (
            this.gameStarted
          ) {

            setTimeout(
              () => {

                if (
                  conn.open
                ) {

                  conn.send({

                    type:
                      "SYNC_GAME_STATE",

                    payload:
                      this.getGameState(),

                    timestamp:
                      Date.now()

                  });

                }

              },
              300
            );

          }


          return;
        }


        // --------------------------------------
        // AÇÃO DE JOGO
        // --------------------------------------

        if (
          data &&
          data.type ===
          "GAME_ACTION"
        ) {

          this.processIncomingGameAction(
            data
          );

          return;
        }

      }
    );


    // ----------------------------------------
    // CONEXÃO FECHADA
    // ----------------------------------------

    conn.on(
      "close",
      () => {

        console.log(
          "[HOST] Jogador desconectado:",
          conn.peer
        );


        this.connections =
          this.connections.filter(
            c =>
              c.peer !==
              conn.peer
          );


        this.lobbyState.players =
          this.lobbyState.players.filter(
            p =>
              p.id !==
              conn.peer
          );


        this.broadcastLobbyUpdate();

        this.updateLobbyUI();


        // Se a partida está acontecendo,
        // atualiza todos os jogadores.
        if (
          this.gameStarted
        ) {

          this.broadcastGameState();

        }

      }
    );


    conn.on(
      "error",
      error => {

        console.error(
          "[HOST] Erro na conexão:",
          error
        );

      }
    );

  }


  // ==========================================
  // ATUALIZA LOBBY
  // ==========================================

  broadcastLobbyUpdate() {

    const message = {

      type:
        "LOBBY_UPDATE",

      payload:
        this.lobbyState,

      timestamp:
        Date.now()

    };


    this.connections.forEach(
      conn => {

        if (
          conn &&
          conn.open
        ) {

          try {

            conn.send(
              message
            );

          } catch (error) {

            console.error(
              "[HOST] Erro ao atualizar lobby:",
              error
            );

          }

        }

      }
    );

  }


  // ==========================================
  // CLIENTE
  // ==========================================

  joinGame() {

    const inputHostId =
      prompt(
        "Digite o código da sala (5 caracteres):"
      );


    if (!inputHostId) return;


    const hostId =
      inputHostId
        .trim()
        .toUpperCase();


    const inputName =
      prompt(
        "Qual o seu nome?",
        this.playerName
      );


    if (!inputName) return;


    this.playerName =
      inputName.trim();


    this.destroyPeer();

    this.isHost = false;

    this.gameStarted = false;


    // ----------------------------------------
    // PEER DO CLIENTE
    // ----------------------------------------

    this.peer =
      new Peer();


    this.peer.on(
      "open",
      id => {

        console.log(
          "[CLIENTE] Meu Peer ID:",
          id
        );


        this.conn =
          this.peer.connect(
            hostId,
            {
              reliable: true
            }
          );


        this.conn.on(
          "open",
          () => {

            console.log(
              "[CLIENTE] Conectado ao Host."
            );


            // --------------------------------
            // AVISA QUE ENTROU
            // --------------------------------

            this.conn.send({

              type:
                "PLAYER_JOINED",

              payload: {

                id: id,

                peerId: id,

                name:
                  this.playerName,

                isHost:
                  false

              }

            });


            this.setupClientListeners();

            this.renderLobby();

          }
        );


        this.conn.on(
          "error",
          error => {

            console.error(
              "[CLIENTE] Erro:",
              error
            );

          }
        );

      }
    );


    this.peer.on(
      "error",
      err => {

        console.error(
          "[PeerJS Error]",
          err
        );


        alert(
          "Não foi possível encontrar a sala '" +
          hostId +
          "'. Verifique se o código está correto."
        );

      }
    );

  }


  // ==========================================
  // LISTENERS DO CLIENTE
  // ==========================================

  setupClientListeners() {

    if (
      !this.conn
    ) return;


    this.conn.on(
      "data",
      data => {

        console.log(
          "[CLIENTE] Mensagem recebida:",
          data
        );


        // --------------------------------------
        // ATUALIZA LOBBY
        // --------------------------------------

        if (
          data &&
          data.type ===
          "LOBBY_UPDATE"
        ) {

          this.lobbyState =
            data.payload;

          this.updateLobbyUI();

          return;
        }


        // --------------------------------------
        // INÍCIO / SINCRONIZAÇÃO DA PARTIDA
        // --------------------------------------

        if (
          data &&
          data.type ===
          "SYNC_GAME_STATE"
        ) {

          // A partida começou.
          this.gameStarted =
            true;


          // Fecha o lobby.
          this.closeMenu();


          // ------------------------------------
          // PRIMEIRO ESTADO
          // ------------------------------------
          //
          // Quando a partida começa, usamos
          // startMultiplayerGame() para criar
          // a estrutura inicial.
          //
          // Depois aplicamos o estado oficial
          // enviado pelo Host.
          // ------------------------------------

          if (
            data.payload &&
            Array.isArray(
              data.payload.players
            )
          ) {

            if (
              typeof window.startMultiplayerGame ===
              "function"
            ) {

              // Converte o estado oficial para
              // o formato esperado pela função
              // existente do game.js.
              const lobbyPlayers =
                data.payload.players.map(
                  player => ({

                    id:
                      player.peerId ||
                      player.id,

                    name:
                      player.name,

                    isHost:
                      player.isHost === true

                  })
                );


              try {

                window.startMultiplayerGame(
                  lobbyPlayers,
                  data.payload.gameConfig || null
                );

              } catch (error) {

                console.error(
                  "[CLIENTE] Erro ao iniciar partida:",
                  error
                );

              }

            }

          }


          // ------------------------------------
          // APLICA ESTADO OFICIAL
          // ------------------------------------

          setTimeout(
            () => {

              this.applyGameState(
                data.payload
              );

            },
            50
          );


          return;
        }

      }
    );


    // ----------------------------------------
    // CONEXÃO FECHADA
    // ----------------------------------------

    this.conn.on(
      "close",
      () => {

        this.gameStarted =
          false;


        alert(
          "A conexão com o Host foi perdida."
        );


        this.closeMenu();

      }
    );


    this.conn.on(
      "error",
      error => {

        console.error(
          "[CLIENTE] Erro de conexão:",
          error
        );

      }
    );

  }


  // ==========================================
  // ATUALIZA INTERFACE DO LOBBY
  // ==========================================

  updateLobbyUI() {

    const lobbyList =
      document.getElementById(
        "dyn-lobby-list"
      );


    if (!lobbyList) return;


    lobbyList.innerHTML =
      "";


    this.lobbyState.players.forEach(
      player => {

        const li =
          document.createElement(
            "li"
          );


        li.textContent =
          player.name +
          (
            player.isHost
              ? " (👑 Host)"
              : ""
          );


        lobbyList.appendChild(
          li
        );

      }
    );

  }


  // ==========================================
  // COMEÇA A PARTIDA
  // ==========================================

  startGame() {

    if (
      !this.isHost
    ) return;


    if (
      this.lobbyState.players.length <
      1
    ) {

      alert(
        "Não há jogadores na sala."
      );

      return;
    }


    console.log(
      "[HOST] Iniciando partida..."
    );


    // ----------------------------------------
    // FECHA LOBBY
    // ----------------------------------------

    this.closeMenu();


    // ----------------------------------------
    // CRIA PARTIDA NO HOST
    // ----------------------------------------

    this.gameStarted =
      true;


    if (
      typeof window.startMultiplayerGame ===
      "function"
    ) {

      window.startMultiplayerGame(
        this.lobbyState.players,
        null
      );

    } else {

      console.error(
        "[HOST] startMultiplayerGame() não encontrada."
      );

      alert(
        "Erro: a função de início da partida não foi encontrada no game.js."
      );

      return;
    }


    // ----------------------------------------
    // ENVIA ESTADO INICIAL
    // ----------------------------------------

    setTimeout(
      () => {

        this.broadcastGameState();

      },
      300
    );


    console.log(
      "[HOST] Partida iniciada com:",
      this.lobbyState.players
    );

  }


  // ==========================================
  // FUNÇÃO DE COMPATIBILIDADE
  // ==========================================
  //
  // Alguns arquivos antigos podem tentar
  // acessar Network.init().
  //
  // Mantemos a função para evitar erro.
  // ==========================================

  init(
    isHost,
    peerInstance
  ) {

    this.isHost =
      isHost;

    if (
      peerInstance
    ) {

      this.peer =
        peerInstance;

    }

    this.gameStarted =
      true;

  }

}


// ==========================================
// INSTÂNCIA GLOBAL
// ==========================================

window.Network =
  new MultiplayerManager();


// ==========================================
// COMPATIBILIDADE
// ==========================================
//
// Alguns trechos antigos do projeto podem
// procurar window.multiplayerConnection.
//
// Mantemos essa referência para o cliente.
// ==========================================

Object.defineProperty(
  window,
  "multiplayerConnection",
  {

    configurable: true,

    get() {

      return window.Network
        ? window.Network.conn
        : null;

    }

  }
);


// ==========================================
// LOG DE INICIALIZAÇÃO
// ==========================================

console.log(
  "🌐 MultiplayerManager carregado."
);

console.log(
  "🏠 Arquitetura: Host autoritativo + sincronização de estado."
);
```
