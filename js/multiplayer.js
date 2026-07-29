/**
 * multiplayer.js
 * Gerenciador de conexão P2P utilizando PeerJS com Autoridade do Host e diagnóstico de erros.
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.conn = null;            // Conexão do cliente com o Host
        this.connections = [];       // Lista de conexões mantida pelo Host
        this.isHost = false;
        this.lobbyState = { players: [] };
        this.playerName = "Jogador " + Math.floor(Math.random() * 1000);
        this.overlay = null;
        this.myPeerId = null;
    }

    generateShortId() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let res = "";
        for (let i = 0; i < 5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
    } 

    openOnlineMenu() {
        if (typeof Peer === "undefined") {
            alert("Biblioteca PeerJS não encontrada.");
            return;
        }

        this.overlay = document.createElement("div");
        this.overlay.className = "modal-overlay";
        this.overlay.innerHTML = `
            <div class="rules-box text-center" style="max-width: 420px;">
                <h2 style="color: #1e90ff;">🌐 MODO ONLINE</h2>
                <p style="color: #aaa; margin-bottom: 20px;">Crie uma sala ou entre em uma existente.</p>
                <button id="btn-dyn-host" class="hero-btn-primary" style="width: 100%; margin-bottom: 10px;">👑 Criar Sala</button>
                <button id="btn-dyn-join" class="hero-btn-primary" style="width: 100%; background: #2e7d32; margin-bottom: 15px;">🔗 Entrar em Sala</button>
                <button class="menu-btn" style="background: transparent; color: #aaa;" onclick="window.location.href='index.html'">Voltar ao Menu</button>
            </div>
        `;
        document.body.appendChild(this.overlay);

        document.getElementById("btn-dyn-host").onclick = () => this.hostGame();
        document.getElementById("btn-dyn-join").onclick = () => this.joinGame();
    }

    hostGame() {
        this.isHost = true;
        const name = prompt("Seu nome:", this.playerName);
        if (!name) return;
        this.playerName = name.trim();

        const roomId = this.generateShortId();
        console.log("[PeerJS] Criando Sala Host com ID:", roomId);
        this.peer = new Peer(roomId);

        this.peer.on("open", id => {
            console.log("[PeerJS] Host aberto com sucesso. ID:", id);
            this.myPeerId = id;
            this.lobbyState.players = [{ id: 0, peerId: id, name: this.playerName, isHost: true }];
            this.renderLobby(id);
        });

        this.peer.on("connection", conn => {
            console.log("[PeerJS] Novo jogador conectando:", conn.peer);
            this.connections.push(conn);

            conn.on("open", () => {
                console.log("[PeerJS] Conexão estabelecida com cliente:", conn.peer);
            });

            conn.on("data", data => {
                console.log("[PeerJS Host] Dados recebidos do cliente:", data);
                if (data.type === "PLAYER_JOINED") {
                    const newPlayerId = this.lobbyState.players.length;
                    data.payload.id = newPlayerId;
                    this.lobbyState.players.push(data.payload);
                    this.broadcastLobby();
                    this.updateLobbyUI();
                } else {
                    if (window.Actions && typeof window.Actions.handleAction === "function") {
                        window.Actions.handleAction(data);
                    }
                    this.connections.forEach(c => {
                        if (c !== conn && c && c.open) {
                            c.send(data);
                        }
                    });
                }
            });

            conn.on("close", () => {
                console.warn("[PeerJS] Cliente desconectou:", conn.peer);
                this.connections = this.connections.filter(c => c !== conn);
            });
        });

        this.peer.on("error", err => {
            console.error("[PeerJS Error Host]:", err);
            alert("Erro na conexão P2P (Host): " + err.type);
        });
    }

    joinGame() {
        const roomId = prompt("Digite o Código da Sala:");
        if (!roomId) return;
        const name = prompt("Seu nome:", this.playerName);
        if (!name) return;
        this.playerName = name.trim();

        this.isHost = false;
        console.log("[PeerJS] Tentando conectar à sala:", roomId);
        this.peer = new Peer();

        this.peer.on("open", id => {
            this.myPeerId = id;
            console.log("[PeerJS] Meu Peer ID de cliente:", id);
            this.conn = this.peer.connect(roomId.trim().toUpperCase(), { reliable: true });

            this.conn.on("open", () => {
                console.log("[PeerJS] Conectado com sucesso ao Host!");
                this.conn.send({
                    type: "PLAYER_JOINED",
                    payload: { peerId: id, name: this.playerName, isHost: false }
                });
                this.renderLobby(null);
            });

            this.conn.on("data", data => {
                console.log("[PeerJS Cliente] Dados recebidos do Host:", data);
                if (data.type === "LOBBY_UPDATE") {
                    this.lobbyState = data.payload;
                    this.updateLobbyUI();
                } else if (data.type === "START_GAME") {
                    console.log("[PeerJS Cliente] Recebido comando para iniciar jogo!");
                    if (this.overlay) this.overlay.remove();
                    if (typeof window.startMultiplayerGame === "function") {
                        window.startMultiplayerGame(data.payload.players);
                    }
                } else {
                    if (window.Actions && typeof window.Actions.handleAction === "function") {
                        window.Actions.handleAction(data);
                    }
                }
            });

            this.conn.on("error", err => {
                console.error("[PeerJS Conn Error]:", err);
                alert("Erro ao conectar na sala: " + err);
            });
        });

        this.peer.on("error", err => {
            console.error("[PeerJS Error Cliente]:", err);
            alert("Erro no PeerJS (Cliente): " + err.type + "\nVerifique se o código da sala está correto.");
        });
    }

    renderLobby(roomId) {
        const box = this.overlay.querySelector(".rules-box");
        box.innerHTML = `
            <h2 style="color:#1e90ff;">SALA DE ESPERA</h2>
            ${roomId ? `<div style="font-size:2rem; letter-spacing:4px; color:#1e90ff; font-weight:bold; margin:15px 0;">${roomId}</div>` : ''}
            <div style="background:#282828; padding:15px; border-radius:8px; text-align:left; margin-bottom:15px;">
                <h4>Jogadores na Sala:</h4>
                <ul id="dyn-lobby-list" style="margin-top:10px; color:#fff;"></ul>
            </div>
            ${this.isHost ? `<button id="btn-start-match" class="hero-btn-primary" style="width:100%;">🚀 Começar Partida</button>` : `<p style="color:#ffb300;">⏳ Aguardando Host iniciar a partida...</p>`}
        `;

        if (this.isHost) {
            document.getElementById("btn-start-match").onclick = () => this.startGame();
        }
        this.updateLobbyUI();
    }

    updateLobbyUI() {
        const list = document.getElementById("dyn-lobby-list");
        if (!list) return;
        list.innerHTML = "";
        this.lobbyState.players.forEach(p => {
            const li = document.createElement("li");
            li.textContent = `${p.name} ${p.isHost ? "👑 (Host)" : ""}`;
            list.appendChild(li);
        });
    }

    broadcastLobby() {
        this.broadcast({ type: "LOBBY_UPDATE", payload: this.lobbyState });
    }

    startGame() {
        if (!this.isHost) return;
        console.log("[PeerJS Host] Iniciando partida para todos os jogadores...");
        this.broadcast({ type: "START_GAME", payload: { players: this.lobbyState.players } });
        if (this.overlay) this.overlay.remove();
        if (typeof window.startMultiplayerGame === "function") {
            window.startMultiplayerGame(this.lobbyState.players);
        }
    }

    sendGameAction(type, payload = {}) {
        const message = { type, payload, senderPeerId: this.myPeerId };
        console.log("[PeerJS Envio] Enviando ação:", message);
        if (this.isHost) {
            this.broadcast(message);
        } else if (this.conn && this.conn.open) {
            this.conn.send(message);
        } else {
            console.error("[PeerJS Envio Falhou] Conexão não está aberta!");
        }
    }

    broadcast(data) {
        this.connections.forEach(c => {
            if (c && c.open) {
                c.send(data);
            }
        });
    }
}

window.Network = new MultiplayerManager();
