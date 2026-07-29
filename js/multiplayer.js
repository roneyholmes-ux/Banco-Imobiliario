/**
 * multiplayer.js
 * Camada de Transporte e Conexão P2P (PeerJS).
 * Responsabilidade ÚNICA: Gerenciar conexões WebRTC, criar/entrar em salas e enviar/receber dados brutos.
 * NÃO possui conhecimento sobre regras do jogo, rotas de actions ou lógica de tabuleiro.
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.conn = null;            // Conexão do cliente com o Host
        this.connections = [];       // Lista de conexões ativas mantida pelo Host
        this.isHost = false;
        this.myPeerId = null;
        this.lobbyState = { players: [] };
        this.playerName = "Jogador " + Math.floor(Math.random() * 1000);
        this.overlay = null;

        // Callbacks de eventos para desacoplar da camada network.js
        this.onDataReceived = null;      // Função fn(data, senderPeerId)
        this.onGameStartCallback = null; // Função fn(players)
    }

    /**
     * Registra o manipulador de dados brutos recebidos da rede.
     */
    setDataHandler(callback) {
        this.onDataReceived = callback;
    }

    /**
     * Registra o manipulador para o sinal de início de partida.
     */
    setGameStartHandler(callback) {
        this.onGameStartCallback = callback;
    }

    /**
     * Gera um código de sala curto de 5 caracteres
     */
    generateShortId() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let res = "";
        for (let i = 0; i < 5; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    }

    /**
     * Abre a interface gráfica simples do menu da sala
     */
    openOnlineMenu() {
        if (typeof Peer === "undefined") {
            alert("A biblioteca PeerJS não foi encontrada no navegador.");
            return;
        }

        if (this.overlay) this.overlay.remove();

        this.overlay = document.createElement("div");
        this.overlay.className = "modal-overlay";
        this.overlay.innerHTML = `
            <div class="rules-box text-center" style="max-width: 420px;">
                <h2 style="color: #1e90ff; margin-bottom: 10px;">🌐 MODO ONLINE</h2>
                <p style="color: #aaa; margin-bottom: 20px;">Crie uma sala ou entre em uma existente.</p>
                <button id="btn-dyn-host" class="hero-btn-primary" style="width: 100%; margin-bottom: 10px;">👑 Criar Sala (Host)</button>
                <button id="btn-dyn-join" class="hero-btn-primary" style="width: 100%; background: #2e7d32; margin-bottom: 15px;">🔗 Entrar em Sala</button>
                <button class="menu-btn" style="background: transparent; color: #aaa; border: none; cursor: pointer;" onclick="window.location.href='index.html'">Voltar ao Menu</button>
            </div>
        `;
        document.body.appendChild(this.overlay);

        document.getElementById("btn-dyn-host").onclick = () => this.hostGame();
        document.getElementById("btn-dyn-join").onclick = () => this.joinGame();
    }

    /**
     * Inicializa a sala como Host
     */
    hostGame() {
        this.isHost = true;
        const name = prompt("Seu nome:", this.playerName);
        if (!name) return;
        this.playerName = name.trim();

        const roomId = this.generateShortId();
        console.log("[Multiplayer] Criando sala Host:", roomId);

        this.peer = new Peer(roomId);

        this.peer.on("open", id => {
            console.log("[Multiplayer] Host aberto com sucesso. ID:", id);
            this.myPeerId = id;
            this.lobbyState.players = [
                { id: 0, peerId: id, name: this.playerName, isHost: true }
            ];
            this.renderLobby(id);
        });

        this.peer.on("connection", conn => {
            console.log("[Multiplayer] Novo cliente conectando:", conn.peer);
            this.connections.push(conn);

            conn.on("open", () => {
                console.log("[Multiplayer] Conexão P2P estabelecida com:", conn.peer);
            });

            conn.on("data", data => {
                console.log("[Multiplayer Host] Mensagem recebida:", data);
                if (data.type === "PLAYER_JOINED") {
                    const newPlayerId = this.lobbyState.players.length;
                    this.lobbyState.players.push({
                        id: newPlayerId,
                        peerId: data.payload.peerId,
                        name: data.payload.name,
                        isHost: false
                    });
                    this.broadcastLobby();
                    this.updateLobbyUI();
                } else {
                    // Repassa o dado bruto recebido para o callback da camada superior
                    if (typeof this.onDataReceived === "function") {
                        this.onDataReceived(data, conn.peer);
                    }
                }
            });

            conn.on("close", () => {
                console.warn("[Multiplayer] Cliente desconectou:", conn.peer);
                this.connections = this.connections.filter(c => c !== conn);
                this.lobbyState.players = this.lobbyState.players.filter(p => p.peerId !== conn.peer);
                this.broadcastLobby();
                this.updateLobbyUI();
            });
        });

        this.peer.on("error", err => {
            console.error("[Multiplayer Host Error]:", err);
            alert("Erro na conexão P2P do Host: " + err.type);
        });
    }

    /**
     * Conecta a uma sala existente como Cliente
     */
    joinGame() {
        const roomId = prompt("Digite o Código da Sala (5 caracteres):");
        if (!roomId) return;

        const name = prompt("Seu nome:", this.playerName);
        if (!name) return;

        this.playerName = name.trim();
        this.isHost = false;

        const targetRoom = roomId.trim().toUpperCase();
        console.log("[Multiplayer] Tentando conectar à sala Host:", targetRoom);

        this.peer = new Peer();

        this.peer.on("open", id => {
            this.myPeerId = id;
            console.log("[Multiplayer] Cliente inicializado com ID:", id);

            this.conn = this.peer.connect(targetRoom, { reliable: true });

            this.conn.on("open", () => {
                console.log("[Multiplayer] Conectado com sucesso ao Host!");
                this.conn.send({
                    type: "PLAYER_JOINED",
                    payload: { peerId: id, name: this.playerName, isHost: false },
                    senderPeerId: id
                });
                this.renderLobby(null);
            });

            this.conn.on("data", data => {
                console.log("[Multiplayer Cliente] Dados recebidos do Host:", data);

                if (data.type === "LOBBY_UPDATE") {
                    this.lobbyState = data.payload;
                    this.updateLobbyUI();
                } else if (data.type === "START_GAME") {
                    console.log("[Multiplayer Cliente] Recebido sinal para iniciar partida!");
                    if (this.overlay) this.overlay.remove();
                    if (typeof this.onGameStartCallback === "function") {
                        this.onGameStartCallback(data.payload.players);
                    }
                } else {
                    // Repassa o dado bruto recebido para o callback da camada superior
                    if (typeof this.onDataReceived === "function") {
                        this.onDataReceived(data, this.conn.peer);
                    }
                }
            });

            this.conn.on("close", () => {
                console.warn("[Multiplayer] A conexão com o Host foi encerrada.");
                alert("Conexão perdida com a sala.");
            });
        });

        this.peer.on("error", err => {
            console.error("[Multiplayer Cliente Error]:", err);
            alert("Erro ao conectar na sala: " + err.type);
        });
    }

    /**
     * Renderiza a interface do Lobby
     */
    renderLobby(roomId) {
        if (!this.overlay) return;
        const box = this.overlay.querySelector(".rules-box");
        if (!box) return;

        box.innerHTML = `
            <h2 style="color:#1e90ff; margin-bottom: 10px;">SALA DE ESPERA</h2>
            ${roomId ? `<div style="font-size:2rem; letter-spacing:4px; color:#1e90ff; font-weight:bold; margin:15px 0;">${roomId}</div>` : ''}
            <div style="background:#282828; padding:15px; border-radius:8px; text-align:left; margin-bottom:15px;">
                <h4 style="margin-bottom:10px; color:#ddd;">Jogadores na Sala:</h4>
                <ul id="dyn-lobby-list" style="list-style:none; padding-left:0; color:#fff;"></ul>
            </div>
            ${this.isHost 
                ? `<button id="btn-start-match" class="hero-btn-primary" style="width:100%;">🚀 Começar Partida</button>` 
                : `<p style="color:#ffb300; font-size:0.9rem;">⏳ Aguardando Host iniciar a partida...</p>`
            }
        `;

        if (this.isHost) {
            document.getElementById("btn-start-match").onclick = () => this.startGame();
        }

        this.updateLobbyUI();
    }

    /**
     * Atualiza a lista visual de jogadores conectados
     */
    updateLobbyUI() {
        const list = document.getElementById("dyn-lobby-list");
        if (!list) return;

        list.innerHTML = "";
        this.lobbyState.players.forEach(p => {
            const li = document.createElement("li");
            li.style.padding = "6px 0";
            li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            li.textContent = `${p.name} ${p.isHost ? "👑 (Host)" : ""}`;
            list.appendChild(li);
        });
    }

    /**
     * Envia o estado atual do lobby para todos os clientes
     */
    broadcastLobby() {
        if (!this.isHost) return;
        this.broadcast({ type: "LOBBY_UPDATE", payload: this.lobbyState });
    }

    /**
     * Dispara o comando de início de jogo
     */
    startGame() {
        if (!this.isHost) return;

        console.log("[Multiplayer Host] Transmitindo START_GAME...");
        this.broadcast({
            type: "START_GAME",
            payload: { players: this.lobbyState.players }
        });

        if (this.overlay) this.overlay.remove();

        if (typeof this.onGameStartCallback === "function") {
            this.onGameStartCallback(this.lobbyState.players);
        }
    }

    /**
     * Envia uma mensagem genérica de rede
     */
    sendRaw(message) {
        if (this.isHost) {
            this.broadcast(message);
        } else if (this.conn && this.conn.open) {
            this.conn.send(message);
        } else {
            console.error("[Multiplayer] Falha ao enviar mensagem: Sem conexão ativa.");
        }
    }

    /**
     * Transmite uma mensagem para todos os clientes (apenas Host)
     */
    broadcast(data) {
        if (!this.isHost) return;
        this.connections.forEach(conn => {
            if (conn && conn.open) {
                conn.send(data);
            }
        });
    }
}

// Instância global limpa de transporte
window.Multiplayer = new MultiplayerManager();
