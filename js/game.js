// ==========================================
// CONFIGURAÇÕES GERAIS DO JOGO (Valores Dinâmicos)
// ==========================================
let GAME_CONFIG = {
    startingMoney: 25000,       // Dinheiro inicial de cada jogador
    goBonus: 2000,              // 🛑 PENALIDADE: Valor PERDIDO ao passar pela PARTIDA
    rentMultiplier: 1.0,        // Multiplicador global de aluguéis
    impostoRenda: 2000,          // Valor cobrado na casa Imposto de Renda
    taxaLuxo: 1000,             // Valor cobrado na casa Taxa de Luxo
    fiancaPrisao: 500,          // Valor para pagar e sair da prisão
    taxaTroca: 200              // Taxa cobrada pelo banco ao realizar trocas entre jogadores
};

// Presets pré-definidos para facilidade de escolha na criação da partida
const PRESETS = {
    standard: { 
        name: "Padrão",
        startingMoney: 25000,
        goBonus: 2000,
        taxaTroca: 200
    },
    fast: {
        name: "Jogo Rápido (Mais Dinheiro)",
        startingMoney: 40000,
        goBonus: 1000,
        taxaTroca: 100
    },
    hardcore: {
        name: "Desafio Escassez",
        startingMoney: 15000,
        goBonus: 3000,
        taxaTroca: 500
    }
};

// ==========================================
// CARTAS DE SORTE OU REVÉS
// ==========================================
const CARDS = [
    { text: "Sorte! Você tirou o 1º lugar no torneio de xadrez. Receba $100", type: "earn", value: 100 },
    { text: "Revés! Pague a mensalidade da escola. Pague $50", type: "pay", value: 50 },
    { text: "Sorte! Receba os dividendos de suas ações. Receba $200", type: "earn", value: 200 },
    { text: "Revés! Multa por excesso de velocidade. Pague $30", type: "pay", value: 30 }
];

// Lista de casas atualizada
const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    
    // 🟤 GRUPO MARROM (Geometria)
    { id: 1, name: "Lado do Quadrado", type: "property", color: "cor-marrom", price: 60, rent: 2, owner: null, grandezaType: "continua" },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Área", type: "property", color: "cor-marrom", price: 60, rent: 4, owner: null, grandezaType: "continua" },
    
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Estação Carioca", type: "station", price: 200, rent: 20, owner: null },
    
    // 🩵 GRUPO AZUL-CLARO (Movimento)
    { id: 6, name: "Distância Percorrida", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Velocidade", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 9, name: "Tempo de Deslocamento", type: "property", color: "cor-azul-claro", price: 120, rent: 8, owner: null, grandezaType: "continua" },
    
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    
    // 🩷 GRUPO ROSA (Clima)
    { id: 11, name: "Temperatura", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150, rent: 15, owner: null },
    { id: 13, name: "Umidade do Ar", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 14, name: "Pressão Atmosférica", type: "property", color: "cor-rosa", price: 160, rent: 12, owner: null, grandezaType: "continua" },
    
    { id: 15, name: "Estação da Luz", type: "station", price: 200, rent: 20, owner: null },
    
    // 🟧 GRUPO LARANJA (Economia)
    { id: 16, name: "Produção", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Demanda", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 19, name: "Preço", type: "property", color: "cor-laranja", price: 200, rent: 16, owner: null, grandezaType: "continua" },
    
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    
    // 🟥 GRUPO VERMELHO (Energia)
    { id: 21, name: "Consumo Elétrico", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Potência", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 24, name: "Tempo de Uso", type: "property", color: "cor-vermelho", price: 240, rent: 20, owner: null, grandezaType: "continua" },
    
    { id: 25, name: "Estação Barra Funda", type: "station", price: 200, rent: 20, owner: null },
    
    // 🟨 GRUPO AMARELO (Educação)
    { id: 26, name: "Horas de Estudo", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "continua" },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150, rent: 15, owner: null },
    { id: 28, name: "Número de Exercícios", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "discreta" },
    { id: 29, name: "Desempenho", type: "property", color: "cor-amarelo", price: 280, rent: 24, owner: null, grandezaType: "continua" },
    
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    
    // 🟩 GRUPO VERDE (Populações)
    { id: 31, name: "Número de Indivíduos", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "discreta" },
    { id: 32, name: "Taxa de Natalidade", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "continua" },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Taxa de Mortalidade", type: "property", color: "cor-verde", price: 320, rent: 28, owner: null, grandezaType: "continua" },
    
    { id: 35, name: "Estação Brás", type: "station", price: 200, rent: 20, owner: null },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    
    // 🟦 GRUPO AZUL ESCURO (Saúde / Biologia)
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
    if (index >= 0 && index <= 10) {
        return { row: 11, col: 11 - index };
    } else if (index > 10 && index <= 20) {
        return { row: 11 - (index - 10), col: 1 };
    } else if (index > 20 && index <= 30) {
        return { row: 1, col: index - 19 };
    } else if (index > 30 && index <= 39) {
        return { row: index - 29, col: 11 };
    }
}

function renderBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;
    document.querySelectorAll(".space").forEach(e => e.remove());
    
    boardSpaces.forEach((space) => {
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space ${space.cssClass || ''}`;
        spaceDiv.id = `space-${space.id}`;
        
        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;
        
        if (space.type === "property" || space.type === "station" || space.type === "utility") {
            const tag = document.createElement("div");
            tag.className = `property-tag ${space.color || 'cor-cinza'}`;
            tag.id = `tag-${space.id}`;
            spaceDiv.appendChild(tag);
        }
        
        const nameText = document.createElement("div");
        nameText.className = "space-name";
        nameText.innerText = space.name;
        spaceDiv.appendChild(nameText);
        
        if (space.price) {
            const priceText = document.createElement("div");
            priceText.id = `price-label-${space.id}`;
            priceText.innerText = `$${space.price}`;
            priceText.style.marginTop = "auto";
            spaceDiv.appendChild(priceText);
        }

        const tokensContainer = document.createElement("div");
        tokensContainer.className = "tokens-container";
        tokensContainer.id = `tokens-space-${space.id}`;
        spaceDiv.appendChild(tokensContainer);
        
        boardElement.appendChild(spaceDiv);
    });
}

function renderPawns() {
    document.querySelectorAll(".tokens-container").forEach(container => container.innerHTML = "");

    players.forEach(player => {
        if (player.isBankrupt) return; 
        const container = document.getElementById(`tokens-space-${player.position}`);
        if (container) {
            const pawn = document.createElement("div");
            pawn.className = "pawn";
            pawn.id = `pawn-player-${player.id}`;
            pawn.style.backgroundColor = player.color;
            container.appendChild(pawn);
        }
    });
}

function updateUI() {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;
    playersList.innerHTML = "";
    
    players.forEach((p, idx) => {
        const row = document.createElement("div");
        row.className = "player-row";
        
        if (p.isBankrupt) {
            row.style.opacity = "0.4";
            row.style.textDecoration = "line-through";
            row.style.borderLeft = `5px solid #555`;
            row.style.padding = "8px";
            row.innerHTML = `<span>${p.name} (💥 Faliu)</span> <span>$0</span>`;
        } else {
            if (idx === currentPlayerIndex) {
                row.style.fontWeight = "bold";
                row.style.backgroundColor = "rgba(255,255,255,0.15)";
                row.style.borderRadius = "5px";
            }
            row.style.borderLeft = `5px solid ${p.color}`;
            row.style.padding = "8px";
            row.innerHTML = `
                <div>
                    <div>${p.name} ${idx === currentPlayerIndex ? "👉" : ""}</div>
                    <div style="font-size: 0.8rem; color: #ddd; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                        <div>🎲 Discretas: <strong>${p.fichasDiscreta || 0}</strong></div>
                        <div>📈 Contínuas: <strong>${p.fichasContinua || 0}</strong></div>
                    </div>
                </div>
                <span style="font-size: 1.1rem; font-weight: bold;">$${p.money}</span>
            `;
        }
        playersList.appendChild(row);
    });

    const rollButton = document.getElementById("rollDice");
    let tradeButton = document.getElementById("btn-open-trade");
    
    if (!tradeButton && rollButton && rollButton.parentNode) {
        tradeButton = document.createElement("button");
        tradeButton.id = "btn-open-trade";
        tradeButton.innerText = "🤝 Negociar";
        tradeButton.style = `
            padding: 10px 20px; font-size: 1.1rem; font-weight: bold;
            background: #2e7d32; color: white; border: none; border-radius: 5px;
            cursor: pointer; margin-left: 10px; transition: all 0.2s ease;
        `;
        tradeButton.addEventListener("click", openTradeModal);
        rollButton.parentNode.insertBefore(tradeButton, rollButton.nextSibling);
    }

    let isMyTurn = true;
    if (isMultiplayer && window.Network && window.Network.peer) {
        const myPeerId = window.Network.peer.id;
        const activePlayer = players[currentPlayerIndex];
        if (activePlayer && activePlayer.peerId && activePlayer.peerId !== myPeerId) {
            isMyTurn = false;
        }
    }

    if (isMoving || awaitingDecision || players[currentPlayerIndex]?.inJail || players[currentPlayerIndex]?.isBankrupt || !isMyTurn) {
        if (rollButton) { rollButton.disabled = true; rollButton.style.opacity = "0.5"; rollButton.style.cursor = "not-allowed"; }
        if (tradeButton) { tradeButton.disabled = true; tradeButton.style.opacity = "0.5"; tradeButton.style.cursor = "not-allowed"; }
    } else {
        if (rollButton) { rollButton.disabled = false; rollButton.style.opacity = "1"; rollButton.style.cursor = "pointer"; }
        if (tradeButton) { tradeButton.disabled = false; tradeButton.style.opacity = "1"; tradeButton.style.cursor = "pointer"; }
    }
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
            if (statusLabel) statusLabel.innerText = `💸 ${player.name} passou pela PARTIDA e pagou uma taxa de $${GAME_CONFIG.goBonus}!`;
            
            if (player.money < 0) {
                isMoving = false;
                checkBankruptcy(player, null);
                return;
            }
            updateUI();
        }

        renderPawns();
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    isMoving = false;
    handleLanding(player);
}

// ==========================================
// INICIALIZAÇÃO LOCAL E MULTIPLAYER
// ==========================================
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
        if (space.type === "property" || space.type === "station" || space.type === "utility") {
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

// Função exigida pelo multiplayer.js
window.startMultiplayerGame = function(lobbyPlayers, hostConfig = null) {
    isMultiplayer = true;
    if (hostConfig) {
        GAME_CONFIG = { ...GAME_CONFIG, ...hostConfig };
    }

    players = lobbyPlayers.map((lp, idx) => {
        const preset = PLAYER_PRESETS[idx % PLAYER_PRESETS.length];
        return {
            id: idx,
            peerId: lp.peerId || lp.id,
            name: lp.name || preset.name,
            color: lp.color || preset.color,
            money: GAME_CONFIG.startingMoney,
            position: 0,
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
            fichasDiscreta: 0,
            fichasContinua: 0
        };
    });

    resetBoardState();
};

function startPlayerSetup() {
    let selectedPlayerCount = 2;

    const overlay = document.createElement("div");
    overlay.id = "setup-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.92); display: flex; justify-content: center;
        align-items: center; z-index: 9999; font-family: 'Montserrat', sans-serif;
    `;

    const setupBox = document.createElement("div");
    setupBox.style = `
        background: #1e1e1e; border: 3px solid #ff4757; border-radius: 12px;
        padding: 30px; text-align: center; color: white; max-width: 480px; width: 90%;
        box-shadow: 0px 10px 30px rgba(0,0,0,0.5); max-height: 90vh; overflow-y: auto;
    `;

    function renderStep1() {
        setupBox.innerHTML = `
            <h2 style="margin-top: 0; color: #ff4757; font-size: 1.8rem; margin-bottom: 10px;">BANCO IMOBILIÁRIO</h2>
            <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;">Passo 1 de 2: Selecione a quantidade de participantes</p>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px;">
                <button class="setup-qty-btn active-qty" data-qty="2">2</button>
                <button class="setup-qty-btn" data-qty="3">3</button>
                <button class="setup-qty-btn" data-qty="4">4</button>
                <button class="setup-qty-btn" data-qty="5">5</button>
                <button class="setup-qty-btn" data-qty="6">6</button>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="btn-next-step" style="padding: 10px 25px; font-size: 1rem; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Avançar para Presets ➡️</button>
            </div>
            <button id="btn-back-to-menu" style="background: transparent; color: #aaa; border: none; cursor: pointer; text-decoration: underline; margin-top: 15px;">Voltar ao Menu</button>
        `;

        setupBox.querySelectorAll(".setup-qty-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                setupBox.querySelectorAll(".setup-qty-btn").forEach(b => b.classList.remove("active-qty"));
                e.target.classList.add("active-qty");
                selectedPlayerCount = parseInt(e.target.getAttribute("data-qty"));
            });
        });

        document.getElementById("btn-next-step").addEventListener("click", renderStep2);
        document.getElementById("btn-back-to-menu").addEventListener("click", () => document.body.removeChild(overlay));
    }

    function renderStep2() {
        setupBox.innerHTML = `
            <h3 style="margin-top: 0; color: #ff4757; font-size: 1.5rem; margin-bottom: 5px;">⚙️ Presets & Configurações</h3>
            <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 20px;">Passo 2 de 2: Escolha um preset ou personalize as regras</p>

            <div style="margin-bottom: 15px; text-align: left;">
                <label style="font-size: 0.85rem; color: #ddd; font-weight: bold;">Selecione um Preset:</label>
                <select id="preset-selector" style="width: 100%; padding: 8px; margin-top: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 5px; font-size: 0.95rem;">
                    <option value="standard">Padrão ($25k iniciais / -$2k Partida / $200 Taxa Troca)</option>
                    <option value="fast">Jogo Rápido ($40k iniciais / -$1k Partida / $100 Taxa Troca)</option>
                    <option value="hardcore">Desafio Escassez ($15k iniciais / -$3k Partida / $500 Taxa Troca)</option>
                    <option value="custom">Personalizado (Editar abaixo)</option>
                </select>
            </div>

            <div style="background: #282828; padding: 15px; border-radius: 8px; border: 1px solid #444; text-align: left; margin-bottom: 20px;">
                <label style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Dinheiro Inicial de cada Jogador ($):</label>
                <input type="number" id="input-start-money" value="${GAME_CONFIG.startingMoney}" style="width: 93%; padding: 6px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">

                <label style="font-size: 0.8rem; display: block; margin-bottom: 4px; color: #ff4757; font-weight: bold;">
                    🔻 Taxa Cobrada ao Passar na PARTIDA ($):
                </label>
                <input type="number" id="input-go-tax" value="${GAME_CONFIG.goBonus}" style="width: 93%; padding: 6px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">

                <label style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Taxa do Banco para Trocas ($):</label>
                <input type="number" id="input-trade-tax" value="${GAME_CONFIG.taxaTroca}" style="width: 93%; padding: 6px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
            </div>

            <div style="display: flex; gap: 10px; justify-content: space-between;">
                <button id="btn-prev-step" style="padding: 10px 15px; font-size: 0.9rem; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer;">⬅️ Voltar</button>
                <button id="btn-start-game" style="padding: 10px 25px; font-size: 1rem; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Iniciar Partida 🚀</button>
            </div>
        `;

        const presetSelector = document.getElementById("preset-selector");
        const moneyInput = document.getElementById("input-start-money");
        const goTaxInput = document.getElementById("input-go-tax");
        const tradeTaxInput = document.getElementById("input-trade-tax");

        presetSelector.addEventListener("change", (e) => {
            const key = e.target.value;
            if (key !== "custom" && PRESETS[key]) {
                moneyInput.value = PRESETS[key].startingMoney;
                goTaxInput.value = PRESETS[key].goBonus;
                tradeTaxInput.value = PRESETS[key].taxaTroca;
            }
        });

        document.getElementById("btn-prev-step").addEventListener("click", renderStep1);

        document.getElementById("btn-start-game").addEventListener("click", () => {
            GAME_CONFIG.startingMoney = parseInt(moneyInput.value) || 25000;
            GAME_CONFIG.goBonus = parseInt(goTaxInput.value) || 2000;
            GAME_CONFIG.taxaTroca = parseInt(tradeTaxInput.value) || 200;

            document.body.removeChild(overlay);
            initializePlayers(selectedPlayerCount);
        });
    }

    overlay.appendChild(setupBox);
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.innerHTML = `
        .setup-qty-btn {
            background: #2e2e2e; color: white; border: 2px solid #555;
            padding: 12px 20px; font-size: 1.2rem; border-radius: 8px;
            cursor: pointer; transition: all 0.2s ease; font-weight: bold; width: 55px;
        }
        .setup-qty-btn:hover, .setup-qty-btn.active-qty {
            background: #ff4757; border-color: #ff4757; transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    renderStep1();
}

function handleLanding(player) {
    const currentSpace = boardSpaces[player.position];
    const purchaseableTypes = ["property", "station", "utility"];

    if (purchaseableTypes.includes(currentSpace.type)) {
        if (currentSpace.owner === null) {
            awaitingDecision = true;
            updateUI();
            showPurchaseModal(player, currentSpace);
            return; 
        } 
        else if (currentSpace.owner !== player.id) {
            if (currentSpace.grandezaType) {
                handleGrandezaLandingOtherPlayer(player, currentSpace);
            } else {
                payRent(player, currentSpace);
            }
            return; 
        } 
        else {
            if (currentSpace.grandezaType) {
                const kind = currentSpace.grandezaType;
                if (kind === "discreta") player.fichasDiscreta = (player.fichasDiscreta || 0) + 1;
                else player.fichasContinua = (player.fichasContinua || 0) + 1;

                const statusDiv = document.getElementById("game-status");
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div style="margin-bottom: 10px; color: #2ed573;">
                            👑 <strong>Sua propriedade de Grandeza!</strong><br>
                            ${player.name} visitou sua casa de <strong>${currentSpace.name}</strong>. Ganhou <strong>1 Ficha de Grandeza ${kind.toUpperCase()}</strong>!
                        </div>
                        <button id="btn-owner-ok" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Excelente!</button>
                    `;
                }
                awaitingDecision = true;
                updateUI();

                const btnOk = document.getElementById("btn-owner-ok");
                if (btnOk) {
                    btnOk.addEventListener("click", () => {
                        awaitingDecision = false;
                        nextTurn();
                    });
                }
                return;
            } else if (currentSpace.type === "property" && hasMonopoly(player, currentSpace.color)) {
                if (currentSpace.houses < 5) {
                    showBuildModal(player, currentSpace);
                    return;
                } else {
                    document.getElementById("game-status").innerText = `${player.name} caiu em ${currentSpace.name} (Hotel completo!).`;
                }
            } else {
                document.getElementById("game-status").innerText = `${player.name} caiu na sua própria propriedade: ${currentSpace.name}.`;
            }
        }
    } else if (currentSpace.name === "Sorte ou Revés") {
        if (isMultiplayer && window.Network) {
            const cardIndex = Math.floor(Math.random() * CARDS.length);
            window.Network.sendGameAction('DRAW_CARD', { playerIndex: player.id, cardIndex: cardIndex });
            return;
        }
        drawCard(player);
        return; 
    } else if (currentSpace.name === "VÁ PARA A PRISÃO") {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        renderPawns();
        
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="margin-bottom: 10px; color: #c62828;">
                    🚨 <strong>Vá para a Prisão!</strong><br>
                    ${player.name} foi enviado para a Prisão!
                </div>
                <button id="btn-confirm-jail" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, continuar</button>
            `;
        }
        
        awaitingDecision = true;
        updateUI();
        
        const btnJail = document.getElementById("btn-confirm-jail");
        if (btnJail) {
            btnJail.addEventListener("click", () => {
                awaitingDecision = false;
                nextTurn();
            });
        }
        return;
    } else if (currentSpace.name === "Imposto de Renda") {
        player.money -= GAME_CONFIG.impostoRenda;
        
        if (player.money < 0) {
            checkBankruptcy(player, null);
            return;
        }

        const statusDiv = document.getElementById("game-status");
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="margin-bottom: 10px; color: #c62828;">
                    💸 <strong>Imposto de Renda!</strong><br>
                    ${player.name} pagou <strong>$${GAME_CONFIG.impostoRenda}</strong> ao Leão!
                </div>
                <button id="btn-confirm-tax" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, pagar</button>
            `;
        }
        
        awaitingDecision = true;
        updateUI();
        
        const btnTax = document.getElementById("btn-confirm-tax");
        if (btnTax) {
            btnTax.addEventListener("click", () => {
                awaitingDecision = false;
                nextTurn();
            });
        }
        return;
    } else if (currentSpace.name === "Taxa de Luxo") {
        player.money -= GAME_CONFIG.taxaLuxo;
        
        if (player.money < 0) {
            checkBankruptcy(player, null);
            return;
        }

        const statusDiv = document.getElementById("game-status");
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="margin-bottom: 10px; color: #c62828;">
                    💎 <strong>Taxa de Luxo!</strong><br>
                    ${player.name} pagou <strong>$${GAME_CONFIG.taxaLuxo}</strong>!
                </div>
                <button id="btn-confirm-luxury" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, pagar</button>
            `;
        }
        
        awaitingDecision = true;
        updateUI();
        
        const btnLux = document.getElementById("btn-confirm-luxury");
        if (btnLux) {
            btnLux.addEventListener("click", () => {
                awaitingDecision = false;
                nextTurn();
            });
        }
        return;
    } else {
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = `${player.name} caiu em ${currentSpace.name}.`;
    }

    nextTurn();
}

function handleGrandezaLandingOtherPlayer(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = calculateCurrentRent(space);
    const kind = space.grandezaType;

    const statusDiv = document.getElementById("game-status");
    if (statusDiv) {
        statusDiv.innerHTML = `
            <div style="margin-bottom: 12px; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #ffb300;">
                📍 <strong>Você caiu em ${space.name} de ${owner ? owner.name : 'outro jogador'}!</strong><br>
                Escolha uma das ações abaixo:
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="btn-pay-rent-g" style="padding: 8px 12px; font-size: 0.85rem; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Pagar Aluguel ($${rentAmount})
                </button>
                <button id="btn-give-tokens-g" style="padding: 8px 12px; font-size: 0.85rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Gerar 1 Ficha ${kind.toUpperCase()} para TODOS os Jogadores 🎁
                </button>
            </div>
        `;
    }

    awaitingDecision = true;
    updateUI();

    const btnRent = document.getElementById("btn-pay-rent-g");
    if (btnRent) {
        btnRent.addEventListener("click", () => {
            if (isMultiplayer && window.Network) {
                window.Network.sendGameAction('GRANDEZA_CHOICE', { choice: 'PAY', playerIndex: player.id, spaceId: space.id });
                return;
            }
            executeGrandezaChoice('PAY', player.id, space.id);
        });
    }

    const btnTokens = document.getElementById("btn-give-tokens-g");
    if (btnTokens) {
        btnTokens.addEventListener("click", () => {
            if (isMultiplayer && window.Network) {
                window.Network.sendGameAction('GRANDEZA_CHOICE', { choice: 'TOKENS', playerIndex: player.id, spaceId: space.id });
                return;
            }
            executeGrandezaChoice('TOKENS', player.id, space.id);
        });
    }
}

function executeGrandezaChoice(choice, playerIndex, spaceId) {
    const player = players[playerIndex];
    const space = boardSpaces[spaceId];
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = calculateCurrentRent(space);
    const kind = space.grandezaType;

    if (choice === 'PAY') {
        player.money -= rentAmount;
        if (owner) owner.money += rentAmount;

        if (player.money < 0) {
            checkBankruptcy(player, owner ? owner.id : null);
            return;
        }

        awaitingDecision = false;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = `${player.name} pagou aluguel de $${rentAmount} para ${owner ? owner.name : 'o Banco'}.`;
        nextTurn();
    } else {
        players.forEach(p => {
            if (!p.isBankrupt) {
                if (kind === "discreta") p.fichasDiscreta = (p.fichasDiscreta || 0) + 1;
                else p.fichasContinua = (p.fichasContinua || 0) + 1;
            }
        });

        awaitingDecision = false;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = `${player.name} ativou o benefício global! Todos ganharam 1 Ficha ${kind.toUpperCase()}!`;
        updateUI();
        nextTurn();
    }
}

function drawCard(player, cardIndex = null) {
    const randomIndex = cardIndex !== null ? cardIndex : Math.floor(Math.random() * CARDS.length);
    const card = CARDS[randomIndex];
    
    if (card.type === "earn") {
        player.money += card.value;
    } else if (card.type === "pay") {
        player.money -= card.value;
    }

    if (player.money < 0) {
        checkBankruptcy(player, null);
        return;
    }

    const statusDiv = document.getElementById("game-status");
    if (statusDiv) {
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; background: #fff8e1; color: #333; padding: 10px; border-radius: 5px; border: 2px solid #ffb300;">
                🃏 <strong>Carta Sorte ou Revés</strong><br><br>
                <em>"${card.text}"</em>
            </div>
            <button id="btn-confirm-card" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, continuar</button>
        `;
    }
    
    awaitingDecision = true; 
    updateUI();
    
    const btnCard = document.getElementById("btn-confirm-card");
    if (btnCard) {
        btnCard.addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
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
    if (diceDisplay) {
        diceDisplay.innerText = `🎲 ${d1} + ${d2} = ${total}`;
    }

    const statusDiv = document.getElementById("game-status");
    if (statusDiv) {
        statusDiv.innerText = `${player.name} tirou ${d1} e ${d2} (${total}). Avance ${total} casas!`;
    }

    movePlayer(currentPlayerIndex, total);
}

function nextTurn() {
    if (players.length === 0) return;

    const activePlayers = players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1 && players.length > 1) {
        const winner = activePlayers[0] || players[0];
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) {
            statusDiv.innerHTML = `🏆 <strong>FIM DE JOGO!</strong> ${winner.name} venceu a partida! 🎉`;
        }
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

function calculateCurrentRent(space) {
    let rent = space.rent || 0;
    if (space.houses && space.houses > 0) {
        rent = rent * (1 + space.houses * 1.5);
    }
    return Math.round(rent * GAME_CONFIG.rentMultiplier);
}

function payRent(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = calculateCurrentRent(space);

    player.money -= rentAmount;
    if (owner) owner.money += rentAmount;

    if (player.money < 0) {
        checkBankruptcy(player, owner ? owner.id : null);
        return;
    }

    const statusDiv = document.getElementById("game-status");
    if (statusDiv) {
        statusDiv.innerText = `💸 ${player.name} pagou $${rentAmount} de aluguel para ${owner ? owner.name : "o Banco"}.`;
    }

    nextTurn();
}

function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #1e90ff;">
            🏠 <strong>${space.name}</strong> está disponível por <strong>$${space.price}</strong>.<br>
            Deseja comprar esta propriedade?
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-buy-prop" style="padding: 8px 16px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Comprar ($${space.price})</button>
            <button id="btn-pass-prop" style="padding: 8px 16px; font-size: 0.9rem; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Passar</button>
        </div>
    `;

    document.getElementById("btn-buy-prop").addEventListener("click", () => {
        if (player.money >= space.price) {
            player.money -= space.price;
            space.owner = player.id;

            const tag = document.getElementById(`tag-${space.id}`);
            if (tag) {
                tag.style.borderBottom = `4px solid ${player.color}`;
            }

            statusDiv.innerText = `🎉 ${player.name} comprou ${space.name}!`;
        } else {
            alert("Você não tem dinheiro suficiente!");
        }
        awaitingDecision = false;
        nextTurn();
    });

    document.getElementById("btn-pass-prop").addEventListener("click", () => {
        statusDiv.innerText = `${player.name} decidiu não comprar ${space.name}.`;
        awaitingDecision = false;
        nextTurn();
    });
}

function hasMonopoly(player, color) {
    if (!color) return false;
    const colorProperties = boardSpaces.filter(s => s.color === color);
    return colorProperties.every(s => s.owner === player.id);
}

function showBuildModal(player, space) {
    const houseCost = Math.round(space.price * 0.5);
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #ffa502;">
            🏗️ <strong>${space.name}</strong> (Monopólio do grupo!)<br>
            Melhorias: ${space.houses || 0}/5. Custo: <strong>$${houseCost}</strong>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-build-house" style="padding: 8px 16px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Construir ($${houseCost})</button>
            <button id="btn-skip-build" style="padding: 8px 16px; font-size: 0.9rem; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">Pular</button>
        </div>
    `;

    document.getElementById("btn-build-house").addEventListener("click", () => {
        if (player.money >= houseCost) {
            player.money -= houseCost;
            space.houses = (space.houses || 0) + 1;
            statusDiv.innerText = `🏡 ${player.name} construiu em ${space.name}!`;
        } else {
            alert("Dinheiro insuficiente!");
        }
        awaitingDecision = false;
        nextTurn();
    });

    document.getElementById("btn-skip-build").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

function checkBankruptcy(player, creditorId = null) {
    if (player.money < 0) {
        player.isBankrupt = true;

        boardSpaces.forEach(space => {
            if (space.owner === player.id) {
                space.owner = creditorId !== null ? creditorId : null;
                space.houses = 0;
            }
        });

        renderPawns();
        updateUI();

        const statusDiv = document.getElementById("game-status");
        if (statusDiv) {
            statusDiv.innerHTML = `💥 <strong>${player.name} FALIU!</strong>`;
        }

        nextTurn();
    }
}

function openTradeModal() {
    alert("Menu de Negociação em breve!");
}

// ==========================================
// EXPOSIÇÃO GLOBAL DE FUNÇÕES
// ==========================================
window.iniciarPartida = function(count) {
    if (typeof count === 'number' && count >= 2) {
        initializePlayers(count);
    } else {
        startPlayerSetup();
    }
};
window.startGame = window.iniciarPartida;
window.startPlayerSetup = startPlayerSetup;
window.initializePlayers = initializePlayers;
window.rollDice = rollDice;
window.renderBoard = renderBoard;
window.updateUI = updateUI;

document.addEventListener("DOMContentLoaded", () => {
    renderBoard();
    updateUI();
});
