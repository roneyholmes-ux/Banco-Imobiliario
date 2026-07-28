// =================================================================
// SYSTEM: P2P MULTIPLAYER ENGINE (v1.2.1 - DIALOG SYNC FIX)
// =================================================================

let peer = null;
let connections = [];
let isHost = false;
let myPlayerId = 0; 
let roomCode = "";
let gameStarted = false; 
let lastKnownStateJSON = "";

// Função para capturar o conteúdo dinâmico do painel de controle do Host
function getPanelContentHTML() {
    const controlPanel = document.querySelector(".control-panel, #control-panel, [class*='painel']");
    if (!controlPanel) return "";
    
    // Captura o bloco de mensagem/decisão (ex: texto de compra + botões Sim/Não)
    // Preserva a estrutura mas pega o conteúdo interno
    return controlPanel.innerHTML;
}

// -----------------------------------------------------------------
// 1. BROADCAST & SYNCRONIZATION (Host -> Guests)
// -----------------------------------------------------------------

function broadcastState() {
    if (!isHost) return;
    
    const gameState = {
        type: 'GAME_STATE',
        players: typeof players !== 'undefined' ? JSON.parse(JSON.stringify(players)) : [],
        boardSpaces: typeof boardSpaces !== 'undefined' ? JSON.parse(JSON.stringify(boardSpaces)) : [],
        currentPlayerIndex: typeof currentPlayerIndex !== 'undefined' ? currentPlayerIndex : 0,
        panelHTML: getPanelContentHTML(), // Envia a tela de decisão/ação do painel
        GAME_CONFIG: typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG : {},
        gameStarted: gameStarted
    };

    lastKnownStateJSON = JSON.stringify({
        p: gameState.players,
        c: gameState.currentPlayerIndex,
        html: gameState.panelHTML,
        b: gameState.boardSpaces ? gameState.boardSpaces.map(s => ({ o: s.owner, h: s.houses })) : []
    });

    connections.forEach(conn => {
        if (conn && conn.open) {
            conn.send(gameState);
        }
    });

    applyTurnSecurityUI();
}

// Loop contínuo de verificação de estado do Host (a cada 250ms)
setInterval(() => {
    if (!isHost || !gameStarted || connections.length === 0) return;

    const currentPanelHTML = getPanelContentHTML();
    const currentStateJSON = JSON.stringify({
        p: typeof players !== 'undefined' ? players : [],
        c: typeof currentPlayerIndex !== 'undefined' ? currentPlayerIndex : 0,
        html: currentPanelHTML,
        b: typeof boardSpaces !== 'undefined' ? boardSpaces.map(s => ({ o: s.owner, h: s.houses })) : []
    });

    if (currentStateJSON !== lastKnownStateJSON) {
        broadcastState();
    }
}, 250);

// -----------------------------------------------------------------
// 2. TURN SECURITY & INTERACTION LOCK
// -----------------------------------------------------------------

function applyTurnSecurityUI() {
    if (typeof currentPlayerIndex === 'undefined' || !gameStarted) return;

    const isMyTurn = (currentPlayerIndex === myPlayerId);

    // 1. Trava/Libera botão de Rolar Dado
    const diceBtn = document.getElementById("rollDice");
    if (diceBtn) {
        diceBtn.disabled = !isMyTurn;
        diceBtn.style.opacity = isMyTurn ? "1" : "0.3";
        diceBtn.style.cursor = isMyTurn ? "pointer" : "not-allowed";
    }

    // 2. Trava/Libera botões dinâmicos de decisão (Sim/Não/Passar)
    const controlPanel = document.querySelector(".control-panel, #control-panel, [class*='painel']");
    if (controlPanel) {
        const panelButtons = controlPanel.querySelectorAll("button");
        panelButtons.forEach(btn => {
            if (btn.id === "btn-close-online" || btn.id === "rollDice") return;

            if (!isMyTurn) {
                btn.disabled = true;
                btn.style.opacity = "0.3";
                btn.style.cursor = "not-allowed";
                btn.style.pointerEvents = "none";
            } else {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                btn.style.pointerEvents = "auto";
            }
        });
    }
}

// Intercepta cliques e envia para o Host se for ação remota
function attachNetworkTriggers() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn || btn.id === "btn-close-online") return;

        // Se o botão for de Rolar Dado
        if (btn.id === "rollDice") {
            if (currentPlayerIndex !== myPlayerId) {
                e.stopImmediatePropagation();
                e.preventDefault();
                showToastNotification("Aguarde o seu turno!");
                return;
            }

            if (!isHost) {
                e.stopImmediatePropagation();
                e.preventDefault();
                sendNetworkAction('ACTION_ROLL_DICE');
            } else {
                setTimeout(() => { broadcastState(); }, 400);
            }
            return;
        }

        // Para outros botões do Painel de Controle (ex: "Sim, Comprar", "Não, Passar Vez")
        if (currentPlayerIndex !== myPlayerId) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
        }

        if (!isHost && gameStarted) {
            e.stopImmediatePropagation();
            e.preventDefault();
            sendNetworkAction('ACTION_GENERIC_CLICK', { 
                btnId: btn.id || null, 
                btnText: btn.innerText 
            });
        }
    }, true);
}

function sendNetworkAction(actionType, payload = {}) {
    const message = { type: actionType, senderId: myPlayerId, ...payload };
    
    if (isHost) {
        connections.forEach(conn => { if (conn && conn.open) conn.send(message); });
    } else {
        if (connections[0] && connections[0].open) {
            connections[0].send(message);
        }
    }
}

// -----------------------------------------------------------------
// 3. DATA RECEIVER & GAME ENGINE INTEGRATION
// -----------------------------------------------------------------

function handleIncomingData(data, conn) {
    if (!data) return;

    if (data.type === 'GAME_STATE') {
        if (typeof players !== 'undefined') players = data.players;
        if (typeof currentPlayerIndex !== 'undefined') currentPlayerIndex = data.currentPlayerIndex;
        gameStarted = data.gameStarted;
        
        if (data.boardSpaces && typeof boardSpaces !== 'undefined') {
            data.boardSpaces.forEach((space, idx) => {
                if (boardSpaces[idx]) {
                    boardSpaces[idx].owner = space.owner;
                    boardSpaces[idx].houses = space.houses;
                }
            });
        }

        if (gameStarted) {
            const overlay = document.getElementById("online-modal-overlay");
            if (overlay) overlay.remove();

            const gameSection = document.getElementById("game-section-area");
            if (gameSection && gameSection.classList.contains("hidden")) {
                gameSection.classList.remove("hidden");
                gameSection.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Renderiza tabuleiro e elementos estáticos
        if (typeof renderBoard === "function") renderBoard();
        if (typeof renderPawns === "function") renderPawns();
        if (typeof updateUI === "function") updateUI();
        
        // Sincroniza com precisão as opções e botões de decisão no painel do Convidado
        if (!isHost && data.panelHTML) {
            const controlPanel = document.querySelector(".control-panel, #control-panel, [class*='painel']");
            if (controlPanel && controlPanel.innerHTML !== data.panelHTML) {
                controlPanel.innerHTML = data.panelHTML;
            }
        }

        applyTurnSecurityUI();
    } 
    else if (data.type === 'REGISTER_PLAYER' && isHost) {
        const newPlayerId = players.length;
        const presetColor = (typeof PLAYER_PRESETS !== 'undefined' && PLAYER_PRESETS[newPlayerId]) 
            ? PLAYER_PRESETS[newPlayerId].color 
            : "#" + Math.floor(Math.random()*16777215).toString(16);

        players.push({
            id: newPlayerId,
            name: `Jogador ${newPlayerId + 1}`,
            money: typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG.startingMoney : 1500,
            position: 0,
            color: presetColor,
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
            fichasDiscreta: 0,
            fichasContinua: 0
        });

        updateLobbyUI();
        
        if (conn && conn.open) {
            conn.send({ type: 'WELCOME_PLAYER', assignedId: newPlayerId });
        }
        
        broadcastState();
    }
    else if (data.type === 'WELCOME_PLAYER') {
        myPlayerId = data.assignedId;
        const statusText = document.getElementById("guest-wait-status");
        if (statusText) {
            statusText.innerHTML = `<span style="color: #2ed573;">✔ Conectado como Jogador ${myPlayerId + 1}!</span><br><small style="color: #aaa;">Aguardando o Host iniciar a partida...</small>`;
        }
    }
    else if (data.type === 'ACTION_ROLL_DICE' && isHost) {
        if (currentPlayerIndex === data.senderId) {
            if (typeof rollDice === "function") rollDice();
            setTimeout(() => { broadcastState(); }, 400);
        }
    }
    else if (data.type === 'ACTION_GENERIC_CLICK' && isHost) {
        if (currentPlayerIndex === data.senderId) {
            let targetBtn = null;
            if (data.btnId) targetBtn = document.getElementById(data.btnId);
            if (!targetBtn && data.btnText) {
                const buttons = document.querySelectorAll("button");
                buttons.forEach(b => {
                    if (b.innerText.trim() === data.btnText.trim()) targetBtn = b;
                });
            }

            if (targetBtn && typeof targetBtn.onclick === "function") {
                targetBtn.onclick();
            } else if (targetBtn) {
                targetBtn.click();
            }
            
            setTimeout(() => { broadcastState(); }, 300);
        }
    }
}

// -----------------------------------------------------------------
// 4. LOBBY & PEERJS INITIALIZATION
// -----------------------------------------------------------------

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function showToastNotification(msg) {
    const toast = document.createElement("div");
    toast.style = "position: fixed; bottom: 20px; right: 20px; background: #6c5ce7; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.4);";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showOnlineModal() {
    const existingModal = document.getElementById("online-modal-overlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "online-modal-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(10, 10, 25, 0.94); display: flex; justify-content: center;
        align-items: center; z-index: 10000; font-family: 'Montserrat', sans-serif;
    `;

    overlay.innerHTML = `
        <div style="background: #181528; border: 2px solid #6c5ce7; border-radius: 16px; padding: 30px; text-align: center; color: white; max-width: 450px; width: 90%; box-shadow: 0 0 30px rgba(108, 92, 231, 0.3);">
            <span style="font-size: 0.75rem; background: #6c5ce7; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold;">v1.2.1 - DIALOG SYNC</span>
            <h2 style="margin: 15px 0 20px; font-size: 1.8rem;">Lobby Online</h2>
            
            <div id="online-actions-view">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <button id="btn-create-room" style="flex: 1; padding: 20px 10px; background: #2d264a; border: 2px solid #6c5ce7; color: white; border-radius: 12px; cursor: pointer; font-weight: bold;">
                        🏠 Criar Sala<br><small style="font-weight: normal; color: #aaa;">Seja o Anfitrião</small>
                    </button>
                    <button id="btn-join-view" style="flex: 1; padding: 20px 10px; background: #2d264a; border: 2px solid #6c5ce7; color: white; border-radius: 12px; cursor: pointer; font-weight: bold;">
                        🔑 Entrar em Sala<br><small style="font-weight: normal; color: #aaa;">Entrar com Código</small>
                    </button>
                </div>
            </div>

            <div id="online-join-view" style="display: none; margin-bottom: 20px;">
                <p style="margin-bottom: 10px; color: #ccc;">Digite o código da sala de 4 dígitos:</p>
                <input type="text" id="join-room-input" maxlength="4" placeholder="EX: X9W2" style="text-transform: uppercase; font-size: 1.5rem; text-align: center; letter-spacing: 4px; width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #6c5ce7; background: #0f0c1b; color: white; margin-bottom: 15px;">
                <div id="join-error-msg" style="color: #ff4757; font-size: 0.85rem; margin-bottom: 10px; display: none;"></div>
                <button id="btn-confirm-join" style="width: 100%; padding: 12px; background: #2ed573; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; font-size: 1rem;">CONECTAR À SALA</button>
            </div>

            <div id="online-wait-view" style="display: none; margin-bottom: 20px;">
                <div id="guest-wait-status" style="font-size: 1.1rem; color: #eccc68; margin: 20px 0;">Conectando ao servidor da sala...</div>
            </div>

            <button id="btn-close-online" style="background: transparent; border: 1px solid #444; color: #ccc; padding: 8px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px;">Voltar</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btn-close-online").onclick = () => overlay.remove();

    document.getElementById("btn-join-view").onclick = () => {
        document.getElementById("online-actions-view").style.display = "none";
        document.getElementById("online-join-view").style.display = "block";
    };

    document.getElementById("btn-create-room").onclick = () => {
        isHost = true;
        myPlayerId = 0;
        gameStarted = false;
        roomCode = generateRoomCode();
        
        if (peer) peer.destroy();
        peer = new Peer(`banco-imobiliario-${roomCode}`);

        peer.on('open', () => {
            showLobbyModal(overlay, roomCode);
        });

        peer.on('connection', (conn) => {
            if (gameStarted) {
                conn.send({ type: 'ERROR', message: 'A partida nesta sala já foi iniciada.' });
                setTimeout(() => conn.close(), 500);
                return;
            }

            connections.push(conn);
            conn.on('data', (data) => handleIncomingData(data, conn));
            conn.on('open', () => {
                broadcastState();
            });
        });

        peer.on('error', (err) => showToastNotification("Erro Host: " + err.type));
    };

    document.getElementById("btn-confirm-join").onclick = () => {
        const errorDiv = document.getElementById("join-error-msg");
        errorDiv.style.display = "none";

        const inputCode = document.getElementById("join-room-input").value.trim().toUpperCase();
        if (!inputCode || inputCode.length < 4) {
            errorDiv.innerText = "Digite um código válido de 4 caracteres.";
            errorDiv.style.display = "block";
            return;
        }

        isHost = false;
        if (peer) peer.destroy();
        peer = new Peer();

        peer.on('open', () => {
            const conn = peer.connect(`banco-imobiliario-${inputCode}`);
            connections = [conn];

            conn.on('open', () => {
                document.getElementById("online-join-view").style.display = "none";
                document.getElementById("online-wait-view").style.display = "block";
                
                conn.send({ type: 'REGISTER_PLAYER' });
                attachNetworkTriggers();
            });

            conn.on('data', (data) => handleIncomingData(data, conn));

            conn.on('error', () => {
                errorDiv.innerText = "Não foi possível encontrar essa sala.";
                errorDiv.style.display = "block";
            });
        });
    };
}

function showLobbyModal(overlay, code) {
    if (typeof initializePlayers === "function") {
        initializePlayers(1);
    } else {
        players = [{
            id: 0, name: "Jogador 1 (Host)", money: 1500, position: 0, color: "#6c5ce7", inJail: false, jailTurns: 0, isBankrupt: false, fichasDiscreta: 0, fichasContinua: 0
        }];
    }
    
    overlay.innerHTML = `
        <div style="background: #181528; border: 2px solid #6c5ce7; border-radius: 16px; padding: 30px; text-align: center; color: white; max-width: 450px; width: 90%;">
            <h3>Sala Aberta!</h3>
            <p style="margin-top: 10px; color: #aaa;">Compartilhe este código com os amigos:</p>
            <h1 style="font-size: 2.8rem; letter-spacing: 5px; color: #a29bfe; margin: 15px 0; background: #2d264a; padding: 10px; border-radius: 8px; user-select: all;">${code}</h1>
            <div id="lobby-players-count" style="margin: 15px 0 20px; font-weight: bold; color: #00b894;">1 Jogador Conectado (Você)</div>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 15px;">Espere todos entrarem na sala antes de clicar abaixo!</p>
            <button id="btn-start-online-game" style="width: 100%; padding: 14px; background: #2ed573; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">INICIAR PARTIDA 🚀</button>
        </div>
    `;

    document.getElementById("btn-start-online-game").onclick = () => {
        gameStarted = true;
        overlay.remove();
        
        attachNetworkTriggers();
        broadcastState();

        const gameSection = document.getElementById("game-section-area");
        if (gameSection) {
            gameSection.classList.remove("hidden");
            gameSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
}

function updateLobbyUI() {
    const lobbyCount = document.getElementById("lobby-players-count");
    if (lobbyCount && typeof players !== 'undefined') {
        lobbyCount.innerText = `${players.length} Jogador(es) Conectado(s)`;
    }
}
