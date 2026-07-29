/**
 * game.js
 * Lógica central do jogo, estados, regras e movimentação.
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

function rollDice() {
    if (isMoving || awaitingDecision) return;

    const player = players[currentPlayerIndex];
    if (!player || player.isBankrupt) return;

    if (player.inJail) {
        player.jailTurns += 1;
        if (player.money >= GAME_CONFIG.fiancaPrisao) {
            player.money -= GAME_CONFIG.fiancaPrisao;
            player.inJail = false;
            player.jailTurns = 0;
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = `⛓️ ${player.name} pagou $${GAME_CONFIG.fiancaPrisao} de fiança e saiu da prisão!`;
        } else {
            const statusDiv = document.getElementById("game-status");
            if (statusDiv) statusDiv.innerText = `⛓️ ${player.name} continua na prisão (${player.jailTurns}º turno).`;
            nextTurn();
            return;
        }
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    const diceDisplay = document.getElementById("dice-display");
    if (diceDisplay) diceDisplay.innerText = `🎲 ${d1} + ${d2} = ${total}`;

    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = `${player.name} tirou ${d1} e ${d2} (${total}). Avance ${total} casas!`;

    movePlayer(currentPlayerIndex, total);
}

async function movePlayer(playerIndex, steps) {
    isMoving = true;
    updateUI();
    let player = players[playerIndex];

    for (let i = 0; i < steps; i++) {
        player.position = (player.position + 1) % 40;

        if (player.position === 0) {
            player.money -= GAME_CONFIG.goBonus;
            const statusLabel = document.getElementById("game-status");
            if (statusLabel) statusLabel.innerText = `💸 ${player.name} passou pela PARTIDA e pagou $${GAME_CONFIG.goBonus}!`;

            if (player.money < 0) {
                isMoving = false;
                checkBankruptcy(player, null);
                return;
            }
            updateUI();
        }

        renderPawns();
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
            document.getElementById("game-status").innerText = `${player.name} caiu na sua própria propriedade: ${space.name}.`;
        }
    } else if (space.name === "Sorte ou Revés") {
        drawCard(player);
        return;
    } else if (space.name === "VÁ PARA A PRISÃO") {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        renderPawns();
        document.getElementById("game-status").innerText = `🚨 ${player.name} foi para a Prisão!`;
    } else if (space.name === "Imposto de Renda") {
        player.money -= GAME_CONFIG.impostoRenda;
        document.getElementById("game-status").innerText = `💸 ${player.name} pagou $${GAME_CONFIG.impostoRenda} de Imposto de Renda.`;
    } else if (space.name === "Taxa de Luxo") {
        player.money -= GAME_CONFIG.taxaLuxo;
        document.getElementById("game-status").innerText = `💎 ${player.name} pagou $${GAME_CONFIG.taxaLuxo} de Taxa de Luxo.`;
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

    document.getElementById("game-status").innerText = `💸 ${player.name} pagou $${rentAmount} de aluguel para ${owner ? owner.name : "o Banco"}.`;
    nextTurn();
}

function showPurchaseModal(player, space) {
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
        if (player.money >= space.price) {
            player.money -= space.price;
            space.owner = player.id;
            statusDiv.innerText = `🎉 ${player.name} comprou ${space.name}!`;
        } else {
            alert("Dinheiro insuficiente!");
        }
        awaitingDecision = false;
        nextTurn();
    };

    document.getElementById("btn-pass-prop").onclick = () => {
        statusDiv.innerText = `${player.name} não comprou ${space.name}.`;
        awaitingDecision = false;
        nextTurn();
    };
}

function drawCard(player) {
    const card = CARDS[Math.floor(Math.random() * CARDS.length)];
    if (card.type === "earn") player.money += card.value;
    else player.money -= card.value;

    document.getElementById("game-status").innerText = `🃏 Carta: "${card.text}"`;
    awaitingDecision = false;
    nextTurn();
}

function checkBankruptcy(player, creditorId) {
    if (player.money < 0) {
        player.isBankrupt = true;
        boardSpaces.forEach(s => { if (s.owner === player.id) s.owner = creditorId; });
        document.getElementById("game-status").innerText = `💥 ${player.name} FALIU!`;
        nextTurn();
    }
}

function nextTurn() {
    if (players.length === 0) return;

    const activePlayers = players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1 && players.length > 1) {
        const winner = activePlayers[0] || players[0];
        document.getElementById("game-status").innerHTML = `🏆 <strong>FIM DE JOGO!</strong> ${winner.name} venceu!`;
        return;
    }

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (players[currentPlayerIndex].isBankrupt);

    updateUI();
    const statusDiv = document.getElementById("game-status");
    if (statusDiv && !awaitingDecision) {
        statusDiv.innerText = `É a vez de ${players[currentPlayerIndex].name}. Role os dados!`;
    }
}

function startPlayerSetup() {
    let count = prompt("Quantos jogadores locais? (2 a 6)", "2");
    count = parseInt(count);
    if (isNaN(count) || count < 2 || count > 6) count = 2;
    initializePlayers(count);
}

// Suporte ao Multiplayer
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
};
