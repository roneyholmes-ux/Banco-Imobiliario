
// ==========================================
// GERENCIADOR MULTIPLAYER
// multiplayer.js
// ==========================================

class MultiplayerManager {

    constructor() {
        this.peer = null;
        this.conn = null;
        this.connections = [];

        this.isHost = false;
        this.gameStarted = false;

        this.lobbyState = {
            players: []
        };

        this.playerName =
            "Jogador " + Math.floor(Math.random() * 1000);

        this.overlay = null;
    }

    // ==========================================
    // GERA CÓDIGO DA SALA
    // ==========================================

    generateShortId() {

        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let result = "";

        for (let i = 0; i < 5; i++) {
            result += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }

        return result;
    }

    // ==========================================
    // ABRIR MENU ONLINE
    // ==========================================

    openOnlineMenu() {

        console.log(
            "[Multiplayer] Abrindo menu online..."
        );

        if (typeof Peer === "undefined") {

            alert(
                "Erro: a biblioteca PeerJS não foi encontrada."
            );

            console.error(
                "[Multiplayer] PeerJS não está disponível."
            );

            return;
        }

        if (this.overlay) {
            return;
        }

        this.overlay =
            document.createElement("div");

        this.overlay.id =
            "online-setup-overlay";

        this.overlay.style.cssText =
            "position:fixed;" +
            "top:0;left:0;" +
            "width:100%;height:100%;" +
            "background:rgba(0,0,0,0.92);" +
            "display:flex;" +
            "justify-content:center;" +
            "align-items:center;" +
            "z-index:99999;" +
            "font-family:Arial,sans-serif;";

        const box =
            document.createElement("div");

        box.id =
            "online-setup-box";

        box.style.cssText =
            "background:#1e1e1e;" +
            "border:3px solid #1e90ff;" +
            "border-radius:12px;" +
            "padding:30px;" +
            "text-align:center;" +
            "color:white;" +
            "max-width:480px;" +
            "width:90%;" +
            "box-shadow:0 10px 30px rgba(0,0,0,0.5);";

        this.overlay.appendChild(box);

        document.body.appendChild(
            this.overlay
        );

        this.renderStep1();
    }

    // ==========================================
    // MENU PRINCIPAL
    // ==========================================

    renderStep1() {

        const box =
            document.getElementById(
                "online-setup-box"
            );

        if (!box) {
            console.error(
                "[Multiplayer] Caixa do menu não encontrada."
            );
            return;
        }

        box.innerHTML =
            "<h2 style='color:#1e90ff;'>🌐 MODO ONLINE</h2>" +

            "<p style='color:#aaa;'>Crie uma sala ou entre em uma sala existente.</p>" +

            "<button id='btn-dyn-host' " +
            "style='width:100%;padding:14px;margin-bottom:12px;" +
            "font-size:1.05rem;background:#1e90ff;color:white;" +
            "border:none;border-radius:6px;cursor:pointer;font-weight:bold;'>" +
            "👑 Criar Sala" +
            "</button>" +

            "<button id='btn-dyn-join' " +
            "style='width:100%;padding:14px;margin-bottom:20px;" +
            "font-size:1.05rem;background:#2e7d32;color:white;" +
            "border:none;border-radius:6px;cursor:pointer;font-weight:bold;'>" +
            "🔗 Entrar em Sala" +
            "</button>" +

            "<button id='btn-close-online' " +
            "style='background:transparent;color:#aaa;border:none;" +
            "cursor:pointer;text-decoration:underline;'>" +
            "Voltar" +
            "</button>";

        document.getElementById(
            "btn-dyn-host"
        ).onclick = () => {
            this.hostGame();
        };

        document.getElementById(
            "btn-dyn-join"
        ).onclick = () => {
            this.joinGame();
        };

        document.getElementById(
            "btn-close-online"
        ).onclick = () => {
            this.closeMenu();
        };
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

        let roomHTML = "";

        if (roomId) {

            roomHTML =
                "<div style='background:#282828;" +
                "border:1px solid #1e90ff;padding:15px;" +
                "border-radius:8px;margin-bottom:20px;'>" +

                "<div style='color:#aaa;font-size:.85rem;'>" +
                "Código da Sala" +
                "</div>" +

                "<div style='color:#1e90ff;font-size:2rem;" +
                "font-family:monospace;letter-spacing:5px;" +
                "font-weight:bold;margin:8px 0;'>" +
                roomId +
                "</div>" +

                "<button id='btn-copy-id' " +
                "style='width:100%;padding:8px;" +
                "background:#1e90ff;color:white;border:none;" +
                "border-radius:5px;cursor:pointer;'>" +
                "📋 Copiar Código" +
                "</button>" +

                "</div>";
        }

        box.innerHTML =
            "<h2 style='color:#1e90ff;'>SALA DE ESPERA</h2>" +

            roomHTML +

            "<div style='background:#282828;padding:15px;" +
            "border-radius:8px;min-height:120px;" +
            "margin-bottom:20px;text-align:left;'>" +

            "<h4 style='color:#ddd;'>Jogadores conectados</h4>" +

            "<ul id='dyn-lobby-list' " +
            "style='color:white;line-height:1.8;'>" +
            "</ul>" +

            "</div>" +

            "<div id='lobby-action-area'></div>";

        const copyButton =
            document.getElementById(
                "btn-copy-id"
            );

        if (copyButton && roomId) {

            copyButton.onclick = async () => {

                try {

                    await navigator.clipboard.writeText(
                        roomId
                    );

                    copyButton.innerText =
                        "✓ Copiado!";

                } catch (error) {

                    alert(
                        "Código da sala: " +
                        roomId
                    );
                }
            };
        }

        const actionArea =
            document.getElementById(
                "lobby-action-area"
            );

        if (this.isHost) {

            actionArea.innerHTML =
                "<button id='btn-dyn-start-match' " +
                "style='padding:12px 25px;font-size:1.05rem;" +
                "background:#ff4757;color:white;border:none;" +
                "border-radius:6px;cursor:pointer;font-weight:bold;'>" +
                "🚀 Começar Partida" +
                "</button>";

            document.getElementById(
                "btn-dyn-start-match"
            ).onclick = () => {
                this.startGame();
            };

        } else {

            actionArea.innerHTML =
                "<p style='color:#ffb300;font-weight:bold;'>" +
                "⏳ Aguardando o Host iniciar a partida..." +
                "</p>";
        }

        this.updateLobbyUI();
    }

    // ==========================================
    // ATUALIZAR LOBBY
    // ==========================================

    updateLobbyUI() {

        const list =
            document.getElementById(
                "dyn-lobby-list"
            );

        if (!list) return;

        list.innerHTML = "";

        this.lobbyState.players.forEach(
            player => {

                const li =
                    document.createElement("li");

                li.textContent =
                    player.name +
                    (
                        player.isHost
                            ? " 👑"
                            : ""
                    );

                list.appendChild(li);
            }
        );
    }

    // ==========================================
    // FECHAR MENU
    // ==========================================

    closeMenu() {

        if (!this.overlay) return;

        try {
            this.overlay.remove();
        } catch (error) {
            console.warn(
                "[Multiplayer] Erro ao fechar menu:",
                error
            );
        }

        this.overlay = null;
    }

    // ==========================================
    // DESTRUIR CONEXÕES
    // ==========================================

    destroyPeer() {

        if (this.conn) {

            try {
                this.conn.close();
            } catch (error) {}

            this.conn = null;
        }

        this.connections.forEach(
            connection => {

                try {
                    connection.close();
                } catch (error) {}

            }
        );

        this.connections = [];

        if (this.peer) {

            try {
                this.peer.destroy();
            } catch (error) {}

            this.peer = null;
        }

        this.lobbyState = {
            players: []
        };

        this.gameStarted = false;
    }

    // ==========================================
    // CRIAR SALA
    // ==========================================

    hostGame() {

        console.log(
            "[Multiplayer] Criando sala..."
        );

        this.destroyPeer();

        this.isHost = true;

        const name =
            prompt(
                "Qual o seu nome?",
                this.playerName
            );

        if (!name) return;

        this.playerName =
            name.trim();

        const roomId =
            this.generateShortId();

        console.log(
            "[Multiplayer] Código escolhido:",
            roomId
        );

        this.peer =
            new Peer(roomId);

        this.peer.on(
            "open",
            id => {

                console.log(
                    "[Multiplayer] Sala criada:",
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

                this.renderLobby(id);
            }
        );

        this.peer.on(
            "connection",
            conn => {

                console.log(
                    "[Multiplayer] Jogador conectando:",
                    conn.peer
                );

                this.connections.push(conn);

                this.setupHostConnection(
                    conn
                );
            }
        );

        this.peer.on(
            "error",
            error => {

                console.error(
                    "[PeerJS]",
                    error
                );

                alert(
                    "Erro de conexão: " +
                    error.type
                );
            }
        );
    }

    // ==========================================
    // CONEXÃO DO HOST
    // ==========================================

    setupHostConnection(conn) {

        conn.on(
            "open",
            () => {

                console.log(
                    "[Host] Conexão aberta:",
                    conn.peer
                );
            }
        );

        conn.on(
            "data",
            data => {

                console.log(
                    "[Host] Recebeu:",
                    data
                );

                if (
                    data &&
                    data.type === "PLAYER_JOINED"
                ) {

                    const player =
                        data.payload;

                    if (
                        player &&
                        !this.lobbyState.players.some(
                            p =>
                                p.id === player.id
                        )
                    ) {

                        this.lobbyState.players.push(
                            player
                        );
                    }

                    this.broadcastLobby();

                    this.updateLobbyUI();

                    return;
                }

                if (
    data &&
    data.type === "GAME_ACTION"
) {

    console.log(
        "[Host] Ação recebida:",
        data
    );

    // O HOST também executa a ação
    this.processGameAction(data);

    // Depois envia a ação para TODOS os clientes
    this.broadcastGameAction(
        data,
        null
    );

    return;
}
            }
        );

        conn.on(
            "close",
            () => {

                console.log(
                    "[Host] Jogador saiu:",
                    conn.peer
                );

                this.connections =
                    this.connections.filter(
                        c =>
                            c.peer !== conn.peer
                    );

                this.lobbyState.players =
                    this.lobbyState.players.filter(
                        p =>
                            p.peerId !== conn.peer
                    );

                this.broadcastLobby();

                this.updateLobbyUI();
            }
        );

        conn.on(
            "error",
            error => {

                console.error(
                    "[Host] Erro:",
                    error
                );
            }
        );
    }

    // ==========================================
    // ATUALIZAR LOBBY
    // ==========================================

    broadcastLobby() {

        const message = {
            type: "LOBBY_UPDATE",
            payload: this.lobbyState
        };

        this.connections.forEach(
            connection => {

                if (
                    connection &&
                    connection.open
                ) {

                    connection.send(
                        message
                    );
                }
            }
        );
    }

    // ==========================================
    // ENTRAR NA SALA
    // ==========================================

    joinGame() {

        console.log(
            "[Multiplayer] Entrando em sala..."
        );

        const roomInput =
            prompt(
                "Digite o código da sala:"
            );

        if (!roomInput) return;

        const roomId =
            roomInput
                .trim()
                .toUpperCase();

        const name =
            prompt(
                "Qual o seu nome?",
                this.playerName
            );

        if (!name) return;

        this.playerName =
            name.trim();

        this.destroyPeer();

        this.isHost = false;

        this.peer =
            new Peer();

        this.peer.on(
            "open",
            id => {

                console.log(
                    "[Cliente] Meu ID:",
                    id
                );

                this.conn =
                    this.peer.connect(
                        roomId,
                        {
                            reliable: true
                        }
                    );

                this.conn.on(
                    "open",
                    () => {

                        console.log(
                            "[Cliente] Conectado ao Host!"
                        );

                        this.conn.send({
                            type: "PLAYER_JOINED",

                            payload: {
                                id: id,
                                peerId: id,
                                name: this.playerName,
                                isHost: false
                            }
                        });

                        this.setupClientConnection();

                        this.renderLobby();
                    }
                );

                this.conn.on(
                    "error",
                    error => {

                        console.error(
                            "[Cliente] Erro:",
                            error
                        );
                    }
                );
            }
        );

        this.peer.on(
            "error",
            error => {

                console.error(
                    "[PeerJS]",
                    error
                );

                alert(
                    "Não foi possível entrar na sala '" +
                    roomId +
                    "'."
                );
            }
        );
    }

    // ==========================================
    // CONEXÃO DO CLIENTE
    // ==========================================

    setupClientConnection() {

        if (!this.conn) return;

        this.conn.on(
            "data",
            data => {

                console.log(
                    "[Cliente] Recebeu:",
                    data
                );

                if (
                    data &&
                    data.type === "LOBBY_UPDATE"
                ) {

                    this.lobbyState =
                        data.payload;

                    this.updateLobbyUI();

                    return;
                }

                if (
                    data &&
                    data.type === "START_GAME"
                ) {

                    console.log(
                        "[Cliente] Partida iniciada."
                    );

                    this.gameStarted = true;

                    this.closeMenu();

                    if (
                        typeof window.startMultiplayerGame ===
                        "function"
                    ) {

                        window.startMultiplayerGame(
                            data.payload.players,
                            data.payload.config || null
                        );
                    }

                    return;
                }

                if (
                    data &&
                    data.type === "GAME_ACTION"
                ) {

                    this.processGameAction(
                        data
                    );
                }
            }
        );

        this.conn.on(
            "close",
            () => {

                alert(
                    "A conexão com o Host foi perdida."
                );

                this.closeMenu();
            }
        );
    }

    // ==========================================
    // INICIAR PARTIDA
    // ==========================================

    startGame() {

        if (!this.isHost) return;

        console.log(
            "[Host] Iniciando partida..."
        );

        this.gameStarted = true;

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
                "[Host] startMultiplayerGame() não encontrada."
            );

            alert(
                "Erro: função de início da partida não encontrada."
            );

            return;
        }

        const message = {
            type: "START_GAME",

            payload: {
                players: this.lobbyState.players,
                config: null
            }
        };

        this.connections.forEach(
            connection => {

                if (
                    connection &&
                    connection.open
                ) {

                    connection.send(
                        message
                    );
                }
            }
        );

        this.closeMenu();

        console.log(
            "[Host] Partida iniciada."
        );
    }

    // ==========================================
    // ENVIO DE AÇÕES
    // ==========================================

    sendGameAction(
        actionType,
        payload = {}
    ) {

        const message = {
            type: "GAME_ACTION",
            action: actionType,
            payload: payload,
            senderId:
                this.peer
                    ? this.peer.id
                    : null
        };

        if (this.isHost) {

            this.processGameAction(
                message
            );

            this.broadcastGameAction(
                message,
                null
            );

            return;
        }

        if (
            this.conn &&
            this.conn.open
        ) {

            this.conn.send(
                message
            );

        } else {

            console.warn(
                "[Cliente] Sem conexão com o Host."
            );
        }
    }

    // ==========================================
    // PROCESSAR AÇÃO
    // ==========================================

    processGameAction(message) {

        console.log(
            "[Sync] Processando:",
            message
        );

        window.dispatchEvent(
            new CustomEvent(
                "networkGameAction",
                {
                    detail: {
                        action:
                            message.action,

                        payload:
                            message.payload
                    }
                }
            )
        );
    }

    // ==========================================
    // DISTRIBUIR AÇÃO
    // ==========================================

    broadcastGameAction(
        message,
        senderConnection
    ) {

        this.connections.forEach(
            connection => {

                if (
                    connection &&
                    connection.open &&
                    (
                        !senderConnection ||
                        connection.peer !==
                        senderConnection.peer
                    )
                ) {

                    connection.send(
                        message
                    );
                }
            }
        );
    }

    // ==========================================
    // COMPATIBILIDADE
    // ==========================================

    sendAction(
        actionType,
        payload = {}
    ) {

        this.sendGameAction(
            actionType,
            payload
        );
    }

    init(
        isHost,
        peerInstance
    ) {

        this.isHost =
            isHost;

        this.peer =
            peerInstance;

        this.gameStarted =
            true;
    }

    // ==========================================
    // SAIR
    // ==========================================

    leaveGame() {

        this.destroyPeer();

        this.closeMenu();

        this.isHost = false;

        this.gameStarted = false;
    }
}


// ==========================================
// INSTÂNCIA GLOBAL
// ==========================================

window.Network =
    new MultiplayerManager();

console.log(
    "🌐 MultiplayerManager carregado com sucesso."
);

console.log(
    "🌐 window.Network:",
    window.Network
);
