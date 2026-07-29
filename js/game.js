/** 
 * game.js
 * Lógica central do jogo, regras, movimentação e estado (Host-Authoritative).
 * 
 * Responsabilidades:
 * - O Host executa regras, movimenta peças, altera dinheiro/propriedades e transmite o estado.
 * - O Cliente envia intenções/pedidos e apenas aplica o estado recebido do Host.
 */

let GAME_CONFIG = {
    startingMoney: 25000,
    goBonus: 2000,
    rentMultiplier: 1.0,
    impostoRenda: 2000,
    taxaLuxo: 1000,
    fiancaPrisao: 500,
    taxaTroca: 200
};

const PRESETS = {
    standard: { name: "Padrão", startingMoney: 25000, goBonus: 2000, taxaTroca: 200 },
    fast: { name: "Jogo Rápido", startingMoney: 40000, goBonus: 1000, taxaTroca: 100 },
    hardcore: { name: "Escassez", startingMoney: 15000, goBonus: 3000, taxaTroca: 500 }
};

const CARDS = [
    { text: "Sorte! Você tirou o 1º lugar no torneio de xadrez. Receba $100", type: "earn", value: 100 },
    { text: "Revés! Pague a mensalidade da escola. Pague $50", type: "pay", value: 50 },
    { text: "Sorte! Receba os dividendos de suas ações. Receba $200", type: "earn", value: 200 },
    { text: "Revés! Multa por excesso de velocidade. Pague $30", type: "pay", value: 30 }
];

const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, name: "Lado do Quadrado", type: "property", color: "cor-marrom", price: 60, rent: 2, owner: null, grandezaType: "continua" },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Área", type: "property", color: "cor-marrom", price: 60, rent: 4, owner: null, grandezaType: "continua" },
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Estação Carioca", type: "station", price: 200, rent: 20, owner: null },
    { id: 6, name: "Distância Percorrida", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Velocidade", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 9, name: "Tempo de Deslocamento", type: "property", color: "cor-azul-claro", price: 120, rent: 8, owner: null, grandezaType: "continua" },
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Temperatura", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150, rent: 15, owner: null },
    { id: 13, name: "Umidade do Ar", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 14, name: "Pressão Atmosférica", type: "property", color: "cor-rosa", price: 160, rent: 12, owner: null, grandezaType: "continua" },
    { id: 15, name: "Estação da Luz", type: "station", price: 200, rent: 20, owner: null },
    { id: 16, name: "Produção", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Demanda", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 19, name: "Preço", type: "property", color: "cor-laranja", price: 200, rent: 16, owner: null, grandezaType: "continua" },
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Consumo Elétrico", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Potência", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 24, name: "Tempo de Uso", type: "property", color: "cor-vermelho", price: 240, rent: 20, owner: null, grandezaType: "continua" },
    { id: 25, name: "Estação Barra Funda", type: "station", price: 200, rent: 20, owner: null },
    { id: 26, name: "Horas de Estudo", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "continua" },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150, rent: 15, owner: null },
    { id: 28, name: "Número de Exercícios", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "discreta" },
    { id: 29, name: "Desempenho", type: "property", color: "cor-amarelo", price: 280, rent: 24, owner: null, grandezaType: "continua" },
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Número de Indivíduos", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "discreta" },
    { id: 32, name: "Taxa de Natalidade", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "continua" },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Taxa de Mortalidade", type: "property", color: "cor-verde", price: 320, rent: 28, owner: null, grandezaType: "continua" },
    { id: 35, name: "Estação Brás", type: "station", price: 200, rent: 20, owner: null },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    { id: 37, name: "Frequência Cardíaca", type: "property", color: "cor-azul-escuro", price: 350, rent: 35, owner: null, grandezaType: "discreta" },
    { id: 38, name: "Taxa de Luxo", type: "special" },
    { id: 39, name: "Massa Corporal", type: "property", color: "cor-azul-escuro", price: 400, rent: 50, owner: null, grandezaType: "continua" }
];

const PLAYER_PRESETS = [
    { name: "Jogador 1 (Azul)", color: "#1e90ff" },
    { name: "Jogador 2 (Vermelho)", color: "#ff4757" },
    { name: "Jogador 3 (Verde)", color: "#2ed573" },
    { name: "Jogador 4 (Amarelo)", color: "#ffa502" },
    { name: "Jogador 5 (Roxo)", color: "#9b59b6" },
    { name: "Jogador 6 (Laranja)", color: "#e67e22" }
];

let players = [];
let currentPlayerIndex = 0;
let isMoving = false;
let awaitingDecision = false;
let isMultiplayer = false;

function getGridPosition(index) {
    if (index >= 0 && index <= 10) return { row: 11, col: 11 - index };
    if (index > 10 && index <= 20) return { row: 11 - (index - 10), col: 1 };
    if (index > 20 && index <= 30) return { row: 1, col: index - 19 };
    if (index > 30 && index <= 39) return { row: index - 29, col: 11 };
}

function initializePlayers(count = 2) {
    isMultiplayer = false;
    players = [];
    for (let i = 0; i < count; i++) {
        const preset = PLAYER_PRESETS[i % PLAYER_PRESETS.length];
        players.push({
            id: i,
            peerId: null,
            name: preset.name,
            color: preset.color,
            money: GAME_CONFIG.startingMoney,
            position: 0,
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
            fichasDiscreta: 0,
            fichasContinua: 0
        });
    }
    resetBoardState();
}

function resetBoardState() {
    boardSpaces.forEach(space => {
        if (["property", "station", "utility"].includes(space.type)) {
            space.owner = null;
            space.houses = 0;
        }
    });
    currentPlayerIndex = 0;
    isMoving = false;
    awaitingDecision = false;
    renderBoard();
    renderPawns();
    updateUI();
    const statusDiv = document.getElementById("game-status");
    if (statusDiv && players.length > 0) {
        statusDiv.innerText = `Partida iniciada! É a vez de ${players[0].name}. Role os dados!`;
    }
}

// ==========================================
// ROLAGEM DE DADOS E MOVIMENTAÇÃO
// ==========================================
function rollDice() {
    if (isMoving || awaitingDecision) return;
    const player = players[currentPlayerIndex];
    if (!player || player.isBankrupt) return;

    // Se for modo Multiplayer Online
    if (isMultiplayer && window.Network) {
        const myPeerId = window.Network.myPeerId;
        
        // Se não for a vez do jogador local, ignora
        if (player.peerId !== myPeerId) {
            console.log("[rollDice] Não é a sua vez!");
            return;
        }

        // Se for Cliente, envia requisição ao Host
        if (!window.Network.isHost) {
            sendNetworkAction("REQUEST_ROLL_DICE");
            return;
        }
    }

    // Se for Host ou jogo Local, executa a rolagens diretamente
    executeRollDice();
}

function executeRollDice() {
    const player = players[currentPlayerIndex];
    if (!player || player.isBankrupt) return;

    if (player.inJail) {
        player.jailTurns += 1;
        if (player.money >= GAME_CONFIG.fiancaPrisao) {
            player.money -= GAME_CONFIG.fiancaPrisao;
            player.inJail = false;
            player.jailTurns = 0;
            const msg = `⛓️ ${player.name} pagou $${GAME_CONFIG.fiancaPrisao} de fiança e saiu da prisão!`;
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = msg;
            syncGameState(msg);
        } else {
            const msg = `⛓️ ${player.name} continua na prisão (${player.jailTurns}º turno).`;
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = msg;
            syncGameState(msg);
            nextTurn();
            return;
        }
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const diceText = `🎲 ${d1} + ${d2} = ${total}`;
    const diceDisplay = document.getElementById("dice-display");
    if (diceDisplay) diceDisplay.innerText = diceText;

    const statusMsg = `${player.name} tirou ${d1} e ${d2} (${total}). Avance ${total} casas!`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = statusMsg;

    syncGameState(statusMsg, diceText);
    movePlayer(currentPlayerIndex, total);
}

async function movePlayer(playerIndex, steps) {
    isMoving = true;
    updateUI();
    let player = players[playerIndex];

    for (let i = 0; i < steps; i++) {
        player.position = (player.position + 1) % 40;
        if (player.position === 0) {
            player.money += GAME_CONFIG.goBonus;
            const statusMsg = `💸 ${player.name} passou pela PARTIDA e recebeu $${GAME_CONFIG.goBonus}!`;
            const statusLabel = document.getElementById("game-status");
            if (statusLabel) statusLabel.innerText = statusMsg;
            syncGameState(statusMsg);
            updateUI();
        }
        renderPawns();
        syncGameState();
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    isMoving = false;
    handleLanding(player);
}

function handleLanding(player) {
    const space = boardSpaces[player.position];
    const purchaseableTypes = ["property", "station", "utility"];

    if (purchaseableTypes.includes(space.type)) {
        if (space.owner === null) {
            awaitingDecision = true;
            updateUI();
            showPurchaseModal(player, space);
            return;
        } else if (space.owner !== player.id) {
            payRent(player, space);
            return;
        } else {
            const msg = `${player.name} caiu na sua própria propriedade: ${space.name}.`;
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = msg;
            syncGameState(msg);
        }
    } else if (space.name === "Sorte ou Revés") {
        drawCard(player);
        return;
    } else if (space.name === "VÁ PARA A PRISÃO") {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        renderPawns();
        const msg = `🚨 ${player.name} foi para a Prisão!`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
    } else if (space.name === "Imposto de Renda") {
        player.money -= GAME_CONFIG.impostoRenda;
        const msg = `💸 ${player.name} pagou $${GAME_CONFIG.impostoRenda} de Imposto de Renda.`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
    } else if (space.name === "Taxa de Luxo") {
        player.money -= GAME_CONFIG.taxaLuxo;
        const msg = `💎 ${player.name} pagou $${GAME_CONFIG.taxaLuxo} de Taxa de Luxo.`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
    }

    nextTurn();
}

function payRent(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = space.rent || 10;

    player.money -= rentAmount;
    if (owner) owner.money += rentAmount;

    if (player.money < 0) {
        checkBankruptcy(player, owner ? owner.id : null);
        return;
    }

    const msg = `💸 ${player.name} pagou $${rentAmount} de aluguel para ${owner ? owner.name : "o Banco"}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    nextTurn();
}

function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    syncGameState(`Aguardando decisão de ${player.name} sobre ${space.name}...`);
    const myPeerId = window.Network ? window.Network.myPeerId : null;

    if (!isMultiplayer || player.peerId === myPeerId) {
        showPurchaseModalUI(player, space);
    } else {
        statusDiv.innerText = `🏠 ${space.name} ($${space.price}) disponível! Aguardando ${player.name}...`;
    }
}

function showPurchaseModalUI(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #1a293d; padding: 10px; border-radius: 6px;">
            🏠 <strong>${space.name}</strong> disponível por <strong>$${space.price}</strong>.
        </div>
        <div style="display: flex; gap: 10px;">
            <button id="btn-buy-prop" style="padding: 6px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Comprar</button>
            <button id="btn-pass-prop" style="padding: 6px 12px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Passar</button>
        </div>
    `;

    document.getElementById("btn-buy-prop").onclick = () => {
        if (isMultiplayer && window.Network && !window.Network.isHost) {
            sendNetworkAction("REQUEST_BUY_PROPERTY");
        } else {
            hostProcessBuyProperty(window.Network ? window.Network.myPeerId : null);
        }
    };

    document.getElementById("btn-pass-prop").onclick = () => {
        if (isMultiplayer && window.Network && !window.Network.isHost) {
            sendNetworkAction("REQUEST_PASS_PROPERTY");
        } else {
            hostProcessPassProperty(window.Network ? window.Network.myPeerId : null);
        }
    };
}

function drawCard(player) {
    const card = CARDS[Math.floor(Math.random() * CARDS.length)];
    if (card.type === "earn") player.money += card.value;
    else player.money -= card.value;

    const msg = `🃏 Carta: "${card.text}"`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    awaitingDecision = false;
    syncGameState(msg);
    nextTurn();
}

function checkBankruptcy(player, creditorId) {
    if (player.money < 0) {
        player.isBankrupt = true;
        boardSpaces.forEach(s => { if (s.owner === player.id) s.owner = creditorId; });
        const msg = `💥 ${player.name} FALIU!`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
        nextTurn();
    }
}

function nextTurn() {
    if (players.length === 0) return;

    const activePlayers = players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1 && players.length > 1) {
        const winner = activePlayers[0] || players[0];
        const msg = `🏆 <strong>FIM DE JOGO!</strong> ${winner.name} venceu!`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerHTML = msg;
        syncGameState(msg);
        return;
    }

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (players[currentPlayerIndex].isBankrupt);

    awaitingDecision = false;
    updateUI();

    const nextPlayer = players[currentPlayerIndex];
    const msg = `É a vez de ${nextPlayer.name}. Role os dados!`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    
    syncGameState(msg);
}

// ==========================================
// PROCESSADORES DE COMANDOS EXECUTADOS PELO HOST
// ==========================================
function hostProcessRollDice(senderPeerId) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    const player = players[currentPlayerIndex];
    if (player && player.peerId === senderPeerId) {
        executeRollDice();
    }
}

function hostProcessBuyProperty(senderPeerId) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    const player = players[currentPlayerIndex];

    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const space = boardSpaces[player.position];
    if (space && space.owner === null && player.money >= space.price) {
        player.money -= space.price;
        space.owner = player.id;
        const msg = `🎉 ${player.name} comprou ${space.name}!`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        awaitingDecision = false;
        syncGameState(msg);
        nextTurn();
    }
}

function hostProcessPassProperty(senderPeerId) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    const player = players[currentPlayerIndex];

    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const space = boardSpaces[player.position];
    const msg = `${player.name} não comprou ${space.name}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    awaitingDecision = false;
    syncGameState(msg);
    nextTurn();
}

// ==========================================
// SINCRONIZAÇÃO DE REDE (BROADCAST E RECEBIMENTO)
// ==========================================
function syncGameState(statusMessage = null, diceDisplay = null) {
    if (!isMultiplayer || !window.Network || !window.Network.isHost) return;

    sendNetworkAction("SYNC_GAME_STATE", {
        players: players,
        boardSpaces: boardSpaces.map(s => ({ id: s.id, owner: s.owner, houses: s.houses || 0 })),
        currentPlayerIndex: currentPlayerIndex,
        isMoving: isMoving,
        awaitingDecision: awaitingDecision,
        statusMessage: statusMessage || (document.getElementById("game-status") ? document.getElementById("game-status").innerText : ""),
        diceDisplay: diceDisplay || (document.getElementById("dice-display") ? document.getElementById("dice-display").innerText : "")
    });
}

function applyGameStateSync(payload) {
    if (!payload) return;
    if (window.Network && window.Network.isHost) return; // O Host já possui o estado autorritativo

    if (payload.players) players = payload.players;
    if (payload.boardSpaces) {
        payload.boardSpaces.forEach(syncSpace => {
            const localSpace = boardSpaces.find(s => s.id === syncSpace.id);
            if (localSpace) {
                localSpace.owner = syncSpace.owner;
                localSpace.houses = syncSpace.houses;
            }
        });
    }

    if (payload.currentPlayerIndex !== undefined) currentPlayerIndex = payload.currentPlayerIndex;
    if (payload.isMoving !== undefined) isMoving = payload.isMoving;
    if (payload.awaitingDecision !== undefined) awaitingDecision = payload.awaitingDecision;

    if (payload.diceDisplay) {
        const diceDisplayEl = document.getElementById("dice-display");
        if (diceDisplayEl) diceDisplayEl.innerText = payload.diceDisplay;
    }

    if (payload.statusMessage) {
        const statusDiv = document.getElementById("game-status");
        if (statusDiv && !awaitingDecision) {
            statusDiv.innerText = payload.statusMessage;
        }
    }

    renderPawns();
    updateUI();

    if (awaitingDecision) {
        const currentPlayer = players[currentPlayerIndex];
        const myPeerId = window.Network ? window.Network.myPeerId : null;
        const space = boardSpaces[currentPlayer.position];

        if (currentPlayer && currentPlayer.peerId === myPeerId) {
            showPurchaseModalUI(currentPlayer, space);
        } else {
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = `Aguardando decisão de ${currentPlayer.name}...`;
        }
    }
}

// ==========================================
// INICIAIS E BINDINGS GLOBAIS
// ==========================================
function startPlayerSetup() {
    let count = prompt("Quantos jogadores locais? (2 a 6)", "2");
    count = parseInt(count);
    if (isNaN(count) || count < 2 || count > 6) count = 2;
    initializePlayers(count);
}

window.startMultiplayerGame = function(lobbyPlayers) {
    isMultiplayer = true;
    players = lobbyPlayers.map((lp, idx) => ({
        id: idx,
        peerId: lp.peerId || lp.id,
        name: lp.name || `Jogador ${idx + 1}`,
        color: PLAYER_PRESETS[idx % PLAYER_PRESETS.length].color,
        money: GAME_CONFIG.startingMoney,
        position: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false
    }));

    resetBoardState();

    if (window.Network && window.Network.isHost) {
        syncGameState("A partida começou! Role os dados.");
    }
};

window.hostProcessRollDice = hostProcessRollDice;
window.hostProcessBuyProperty = hostProcessBuyProperty;
window.hostProcessPassProperty = hostProcessPassProperty;
window.applyGameStateSync = applyGameStateSync;
