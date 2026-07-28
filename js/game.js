// ==========================================
// CONFIGURAÇÕES GERAIS DO JOGO (Valores Dinâmicos)
// ==========================================
let GAME_CONFIG = {
    startingMoney: 25000,       // Dinheiro inicial de cada jogador
    goBonus: 2000,              // 🛑 AGORA É PENALIDADE: Valor PERDIDO ao passar pela PARTIDA
    rentMultiplier: 1.0,        // Multiplicador global de aluguéis
    impostoRenda: 2000,         // Valor cobrado na casa Imposto de Renda
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

// Lista de casas atualizada com os novos Sistemas Científicos/Pedagógicos
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
    document.querySelectorAll(".space").forEach(e => e.remove());
    
    boardSpaces.forEach((space) => {
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space ${space.cssClass || ''}`;
        spaceDiv.id = `space-${space.id}`;
        
        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;
        
        if (space.type === "property" || space.type === "station" || space.type === "utility" || space.type === "grandeza") {
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
                        <div>🎲 Discretas: <strong>${p.fichasDiscreta}</strong></div>
                        <div>📈 Contínuas: <strong>${p.fichasContinua}</strong></div>
                    </div>
                </div>
                <span style="font-size: 1.1rem; font-weight: bold;">$${p.money}</span>
            `;
        }
        playersList.appendChild(row);
    });

    const rollButton = document.getElementById("rollDice");
    let tradeButton = document.getElementById("btn-open-trade");
    
    if (!tradeButton && rollButton) {
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

    if (isMoving || awaitingDecision || players[currentPlayerIndex]?.inJail || players[currentPlayerIndex]?.isBankrupt) {
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
        
        // 🛑 REGRA ALTERADA: Ao passar pela PARTIDA o jogador PERDE dinheiro ao invés de ganhar
        if (player.position === 0) {
            player.money -= GAME_CONFIG.goBonus;
            document.getElementById("game-status").innerText = `💸 ${player.name} passou pela PARTIDA e pagou uma taxa de $${GAME_CONFIG.goBonus}!`;
            
            if (player.money < 0) {
                checkBankruptcy(player, null);
                isMoving = false;
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
// TELA DE SETUP E PRESETS INICIAIS
// ==========================================
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

    // ETAPA 1: Quantidade de Jogadores
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

    // ETAPA 2: Seleção e Edição de Presets
    function renderStep2() {
        setupBox.innerHTML = `
            <h3 style="margin-top: 0; color: #ff4757; font-size: 1.5rem; margin-bottom: 5px;">⚙️ Presets & Configurações</h3>
            <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 20px;">Passo 2 de 2: Escolha um preset ou personalize as regras</p>

            <!-- Seleção de Presets Rápidos -->
            <div style="margin-bottom: 15px; text-align: left;">
                <label style="font-size: 0.85rem; color: #ddd; font-weight: bold;">Selecione um Preset:</label>
                <select id="preset-selector" style="width: 100%; padding: 8px; margin-top: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 5px; font-size: 0.95rem;">
                    <option value="standard">Padrão ($25k iniciais / -$2k Partida / $200 Taxa Troca)</option>
                    <option value="fast">Jogo Rápido ($40k iniciais / -$1k Partida / $100 Taxa Troca)</option>
                    <option value="hardcore">Desafio Escassez ($15k iniciais / -$3k Partida / $500 Taxa Troca)</option>
                    <option value="custom">Personalizado (Editar abaixo)</option>
                </select>
            </div>

            <!-- Campos de Edição Customizada -->
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
            // Atualiza o objeto de configurações globais com as opções do preset/editadas
            GAME_CONFIG.startingMoney = parseInt(moneyInput.value) || 25000;
            GAME_CONFIG.goBonus = parseInt(goTaxInput.value) || 2000;
            GAME_CONFIG.taxaTroca = parseInt(tradeTaxInput.value) || 200;

            document.body.removeChild(overlay);
            initializePlayers(selectedPlayerCount);
        });
    }

    overlay.appendChild(setupBox);
    document.body.appendChild(overlay);

    // Injeta os estilos CSS necessários para os botões do setup
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
    const purchaseableTypes = ["property", "station", "utility", "grandeza"];

    if (purchaseableTypes.includes(currentSpace.type)) {
        if (currentSpace.owner === null) {
            awaitingDecision = true;
            updateUI();
            showPurchaseModal(player, currentSpace);
            return; 
        } 
        else if (currentSpace.owner !== player.id) {
            if (currentSpace.type === "grandeza") {
                handleGrandezaLandingOtherPlayer(player, currentSpace);
            } else {
                payRent(player, currentSpace);
            }
            return; 
        } 
        else {
            if (currentSpace.type === "grandeza") {
                const kind = currentSpace.grandezaKind;
                if (kind === "discreta") player.fichasDiscreta += 1;
                else player.fichasContinua += 1;

                const statusDiv = document.getElementById("game-status");
                statusDiv.innerHTML = `
                    <div style="margin-bottom: 10px; color: #2ed573;">
                        👑 <strong>Sua propriedade de Grandeza!</strong><br>
                        ${player.name} visitou sua casa de <strong>${currentSpace.name}</strong>. Não paga nada e ganhou <strong>1 Ficha de Grandeza ${kind.toUpperCase()}</strong>!
                    </div>
                    <button id="btn-owner-ok" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Excelente!</button>
                `;
                awaitingDecision = true;
                updateUI();

                document.getElementById("btn-owner-ok").addEventListener("click", () => {
                    awaitingDecision = false;
                    nextTurn();
                });
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
        drawCard(player);
        return; 
    } else if (currentSpace.name === "VÁ PARA A PRISÃO") {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        renderPawns();
        
        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                🚨 <strong>Vá para a Prisão!</strong><br>
                ${player.name} foi enviado diretamente para a Prisão e está preso!
            </div>
            <button id="btn-confirm-jail" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, continuar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-jail").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
        
    } else if (currentSpace.name === "Imposto de Renda") {
        player.money -= GAME_CONFIG.impostoRenda;
        
        if (player.money < 0) {
            checkBankruptcy(player, null);
            return;
        }

        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                💸 <strong>Imposto de Renda!</strong><br>
                ${player.name} pagou <strong>$${GAME_CONFIG.impostoRenda}</strong> de impostos ao Leão!
            </div>
            <button id="btn-confirm-tax" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, pagar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-tax").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
    } else if (currentSpace.name === "Taxa de Luxo") {
        player.money -= GAME_CONFIG.taxaLuxo;
        
        if (player.money < 0) {
            checkBankruptcy(player, null);
            return;
        }

        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                💎 <strong>Taxa de Luxo!</strong><br>
                ${player.name} pagou <strong>$${GAME_CONFIG.taxaLuxo}</strong> de taxa de luxo!
            </div>
            <button id="btn-confirm-luxury" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, pagar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-luxury").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
    } else {
        document.getElementById("game-status").innerText = `${player.name} caiu em ${currentSpace.name}.`;
    }

    nextTurn();
}

function handleGrandezaLandingOtherPlayer(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = calculateCurrentRent(space);
    const kind = space.grandezaKind;

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 12px; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #ffb300;">
            📍 <strong>Você caiu em ${space.name} de ${owner.name}!</strong><br>
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

    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-pay-rent-g").addEventListener("click", () => {
        player.money -= rentAmount;
        owner.money += rentAmount;

        if (player.money < 0) {
            checkBankruptcy(player, owner.id);
            return;
        }

        awaitingDecision = false;
        document.getElementById("game-status").innerText = `${player.name} preferiu pagar o aluguel de $${rentAmount} para ${owner.name}.`;
        nextTurn();
    });

    document.getElementById("btn-give-tokens-g").addEventListener("click", () => {
        players.forEach(p => {
            if (!p.isBankrupt) {
                if (kind === "discreta") p.fichasDiscreta += 1;
                else p.fichasContinua += 1;
            }
        });

        awaitingDecision = false;
        document.getElementById("game-status").innerText = `${player.name} acionou o benefício global! Todos os jogadores ganharam 1 Ficha de Grandeza ${kind.toUpperCase()}!`;
        updateUI();
        nextTurn();
    });
}

function drawCard(player) {
    const randomIndex = Math.floor(Math.random() * CARDS.length);
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
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #fff8e1; color: #333; padding: 10px; border-radius: 5px; border: 2px solid #ffb300;">
            🃏 <strong>Carta Sorte ou Revés</strong><br><br>
            <em>"${card.text}"</em>
        </div>
        <button id="btn-confirm-card" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, continuar</button>
    `;
    
    awaitingDecision = true; 
    updateUI();
    
    document.getElementById("btn-confirm-card").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

function payRent(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = calculateCurrentRent(space);
    
    player.money -= rentAmount;
    owner.money += rentAmount;
    
    if (player.money < 0) {
        checkBankruptcy(player, owner.id);
        return;
    }

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #c62828;">
            💸 <strong>Pedágio!</strong><br>
            ${player.name} caiu em <strong>${space.name}</strong> e pagou <strong>$${rentAmount}</strong> de aluguel para ${owner.name}!
        </div>
        <button id="btn-confirm-rent" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok, continuar</button>
    `;
    
    awaitingDecision = true; 
    updateUI();
    
    document.getElementById("btn-confirm-rent").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    
    let isGrandeza = space.type === "grandeza";
    let extraBonusText = isGrandeza ? `<br><small style="color: #2ed573;">✨ BÔNUS: Comprando esta casa, você ganha 1 Ficha de Grandeza ${space.grandezaKind.toUpperCase()} grátis!</small>` : "";

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            ${player.name} caiu em <strong>${space.name}</strong>!<br>
            Preço de compra: <strong>$${space.price}</strong>.${extraBonusText}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-buy-yes" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Sim, Comprar</button>
            <button id="btn-buy-no" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Não, Passar Vez</button>
        </div>
    `;

    document.getElementById("btn-buy-yes").addEventListener("click", () => buyProperty(player, space));
    document.getElementById("btn-buy-no").addEventListener("click", () => skipProperty(player, space));
}

function buyProperty(player, space) {
    if (player.money >= space.price) {
        player.money -= space.price;
        space.owner = player.id;
        
        if (space.type === "grandeza") {
            if (space.grandezaKind === "discreta") player.fichasDiscreta += 1;
            else if (space.grandezaKind === "continua") player.fichasContinua += 1;
        }

        const spaceDiv = document.getElementById(`space-${space.id}`);
        spaceDiv.style.border = `3px dashed ${player.color}`;
        
        const priceLabel = document.getElementById(`price-label-${space.id}`);
        if (priceLabel) {
            priceLabel.innerText = "COMPRADO";
            priceLabel.style.color = player.color;
        }

        document.getElementById("game-status").innerText = `${player.name} comprou ${space.name} por $${space.price}!`;
    } else {
        alert("Dinheiro insuficiente para realizar a compra!");
        return;
    }

    awaitingDecision = false;
    nextTurn();
}

function skipProperty(player, space) {
    document.getElementById("game-status").innerText = `${player.name} decidiu não comprar ${space.name}.`;
    awaitingDecision = false;
    nextTurn();
}

function nextTurn() {
    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (players[currentPlayerIndex].isBankrupt);

    document.getElementById("game-status").innerHTML = `É a vez de <strong>${players[currentPlayerIndex].name}</strong> jogar!`;
    updateUI();
}

function checkJailTurn(player) {
    const statusDiv = document.getElementById("game-status");
    
    if (player.jailTurns >= 3) {
        player.money -= GAME_CONFIG.fiancaPrisao;
        
        if (player.money < 0) {
            checkBankruptcy(player, null);
            return true;
        }

        player.inJail = false;
        player.jailTurns = 0;
        
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                🚨 <strong>Fim do Prazo!</strong><br>
                ${player.name} completou 3 turnos na prisão e foi obrigado a pagar a fiança de <strong>$${GAME_CONFIG.fiancaPrisao}</strong> para ser liberado!
            </div>
            <button id="btn-forced-jail-free" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Rolar Dados</button>
        `;
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-forced-jail-free").addEventListener("click", () => {
            awaitingDecision = false;
            updateUI();
        });
        return true;
    }

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #ffb300; background: #2e2e2e; padding: 10px; border-radius: 8px; border: 1px solid #ffb300;">
            ⛓️ <strong>${player.name} está na Prisão (Turno ${player.jailTurns + 1}/3)</strong><br>
            O que deseja fazer para sair?
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-jail-roll" style="padding: 6px 15px; font-size: 0.9rem; background: #2e2e2e; color: white; border: 1px solid #555; border-radius: 4px; cursor: pointer;">Tentar Dados Duplos 🎲</button>
            <button id="btn-jail-pay" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Pagar $${GAME_CONFIG.fiancaPrisao} 💸</button>
        </div>
    `;
    
    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-jail-roll").addEventListener("click", () => {
        document.getElementById("btn-jail-roll").disabled = true;
        document.getElementById("btn-jail-pay").disabled = true;
        
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        if (d1 === d2) {
            player.inJail = false;
            player.jailTurns = 0;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Você tirou dados duplos (${d1} e ${d2})! <strong>Você está LIVRE!</strong>`;
            
            setTimeout(() => {
                movePlayer(currentPlayerIndex, d1 + d2);
            }, 1500);
        } else {
            player.jailTurns += 1;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Você tirou ${d1} e ${d2} (Não foi duplo). Continua preso!`;
            
            setTimeout(() => {
                nextTurn();
            }, 2000);
        }
    });

    document.getElementById("btn-jail-pay").addEventListener("click", () => {
        document.getElementById("btn-jail-roll").disabled = true;
        document.getElementById("btn-jail-pay").disabled = true;
        
        if (player.money >= GAME_CONFIG.fiancaPrisao) {
            player.money -= GAME_CONFIG.fiancaPrisao;
            player.inJail = false;
            player.jailTurns = 0;
            awaitingDecision = false;
            updateUI();
            
            statusDiv.innerText = `${player.name} pagou a fiança e está livre para jogar!`;
        } else {
            alert("Você não tem dinheiro suficiente para pagar a fiança!");
            document.getElementById("btn-jail-roll").disabled = false;
            document.getElementById("btn-jail-pay").disabled = false;
        }
    });

    return true;
}

function rollDice() {
    if (isMoving || awaitingDecision) return;

    const player = players[currentPlayerIndex];

    if (player.inJail) {
        checkJailTurn(player);
        return;
    }

    const diceValue1 = Math.floor(Math.random() * 6) + 1;
    const diceValue2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = diceValue1 + diceValue2;

    document.getElementById("game-status").innerText = `🎲 ${player.name} tirou ${diceValue1} + ${diceValue2} = ${totalSteps}!`;

    movePlayer(currentPlayerIndex, totalSteps);
}

function initializePlayers(quantity) {
    players = [];
    for (let i = 0; i < quantity; i++) {
        players.push({
            id: i,
            name: PLAYER_PRESETS[i].name,
            money: GAME_CONFIG.startingMoney,
            position: 0,
            color: PLAYER_PRESETS[i].color,
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
            fichasDiscreta: 0,
            fichasContinua: 0
        });
    }
    
    boardSpaces.forEach(space => {
        if (space.type === "property") {
            space.houses = 0;
        }
    });

    const gameArea = document.getElementById("game-section-area");
    gameArea.classList.remove("hidden");

    renderBoard();
    renderPawns();
    updateUI();

    gameArea.scrollIntoView({ behavior: "smooth" });

    document.getElementById("game-status").innerHTML = `Partida iniciada! É a vez de <strong>${players[currentPlayerIndex].name}</strong> jogar!`;
}

function hasMonopoly(player, colorClass) {
    if (!colorClass) return false;
    const sameColorSpaces = boardSpaces.filter(space => space.color === colorClass);
    return sameColorSpaces.every(space => space.owner === player.id);
}

function calculateCurrentRent(space) {
    if (space.type !== "property" && space.type !== "grandeza") {
        return space.rent;
    }

    const owner = players.find(p => p.id === space.owner);
    let finalRent = space.rent;

    if (space.houses === 1) finalRent = space.rent * 5;
    else if (space.houses === 2) finalRent = space.rent * 15;
    else if (space.houses === 3) finalRent = space.rent * 40;
    else if (space.houses === 4) finalRent = space.rent * 80;
    else if (space.houses === 5) finalRent = space.rent * 120;
    else if (hasMonopoly(owner, space.color)) {
        finalRent = space.rent * 2;
    }

    return Math.round(finalRent * GAME_CONFIG.rentMultiplier);
}

function showBuildModal(player, space) {
    const housePrice = Math.round(space.price / 2);
    const isHotel = space.houses === 4;
    const itemText = isHotel ? "um Hotel" : "uma Casa";
    
    const requiredType = space.grandezaType || (space.id % 2 === 0 ? "continua" : "discreta");
    const requiredTypeLabel = requiredType === "discreta" ? "Grandeza Discreta 🎲" : "Grandeza Contínua 📈";
    const playerHasToken = requiredType === "discreta" ? player.fichasDiscreta > 0 : player.fichasContinua > 0;

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            🏰 <strong>Monopólio!</strong> Você caiu em <strong>${space.name}</strong> (${space.houses} construções).<br>
            Construir ${itemText} exige: <strong>$${housePrice} + 1 Ficha de ${requiredTypeLabel}</strong>.<br>
            <small style="color: #bbb;">Seu saldo de fichas do tipo: ${requiredType === "discreta" ? player.fichasDiscreta : player.fichasContinua}</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-build-yes" ${!playerHasToken ? 'disabled style="opacity:0.5;"' : ''} style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; border: none; color: white; border-radius: 4px; cursor: pointer;">
                ${playerHasToken ? "Construir" : "Falta Ficha de Grandeza"}
            </button>
            <button id="btn-build-no" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828; border: none; color: white; border-radius: 4px; cursor: pointer;">Passar Vez</button>
        </div>
    `;

    const btnYes = document.getElementById("btn-build-yes");
    const btnNo = document.getElementById("btn-build-no");

    if (playerHasToken) {
        btnYes.addEventListener("click", () => {
            btnYes.disabled = true;
            btnNo.disabled = true;
            
            if (player.money >= housePrice) {
                player.money -= housePrice;
                if (requiredType === "discreta") player.fichasDiscreta -= 1;
                else player.fichasContinua -= 1;

                space.houses += 1;
                updateSpaceVisualWithHouses(space);
                
                document.getElementById("game-status").innerText = `${player.name} usou 1 Ficha de ${requiredTypeLabel} e construiu ${itemText} em ${space.name}!`;
                awaitingDecision = false;
                updateUI();
                
                setTimeout(() => { nextTurn(); }, 1500);
            } else {
                alert("Dinheiro insuficiente para construir!");
                btnYes.disabled = false;
                btnNo.disabled = false;
            }
        });
    }

    btnNo.addEventListener("click", () => {
        btnYes.disabled = true;
        btnNo.disabled = true;
        awaitingDecision = false;
        nextTurn();
    });
}

function updateSpaceVisualWithHouses(space) {
    const tag = document.getElementById(`tag-${space.id}`);
    if (!tag) return;

    tag.innerHTML = "";
    tag.style.display = "flex";
    tag.style.justifyContent = "center";
    tag.style.alignItems = "center";
    tag.style.gap = "2px";

    if (space.houses === 5) {
        tag.innerHTML = `<span style="color: #ff4757; font-size: 14px; font-weight: bold; text-shadow: 1px 1px 1px black;">🏨</span>`;
    } else {
        let houseIcons = "";
        for (let i = 0; i < space.houses; i++) {
            houseIcons += `<span style="color: #2ed573; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 1px black;">🏠</span>`;
        }
        tag.innerHTML = houseIcons;
    }
}

function checkBankruptcy(player, creditorId) {
    player.isBankrupt = true;
    player.money = 0;
    player.fichasDiscreta = 0;
    player.fichasContinua = 0;

    const statusDiv = document.getElementById("game-status");
    const creditor = creditorId !== null ? players.find(p => p.id === creditorId) : null;
    
    boardSpaces.forEach(space => {
        if (space.owner === player.id) {
            if (creditor) {
                space.owner = creditor.id;
                space.houses = 0;
                updateSpaceVisualWithHouses(space);
                
                const spaceDiv = document.getElementById(`space-${space.id}`);
                if (spaceDiv) spaceDiv.style.border = `3px dashed ${creditor.color}`;
                
                const priceLabel = document.getElementById(`price-label-${space.id}`);
                if (priceLabel) {
                    priceLabel.innerText = "COMPRADO";
                    priceLabel.style.color = creditor.color;
                }
            } else {
                space.owner = null;
                space.houses = 0;
                updateSpaceVisualWithHouses(space);
                
                const spaceDiv = document.getElementById(`space-${space.id}`);
                if (spaceDiv) spaceDiv.style.border = "1px solid #ccc";
                
                const priceLabel = document.getElementById(`price-label-${space.id}`);
                if (priceLabel) {
                    priceLabel.innerText = `$${space.price}`;
                    priceLabel.style.color = "inherit";
                }
            }
        }
    });

    const pawn = document.getElementById(`pawn-player-${player.id}`);
    if (pawn) pawn.remove();

    const activePlayers = players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1) {
        showWinModal(activePlayers[0]);
        return true;
    }

    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #c62828; color: white; padding: 15px; border-radius: 8px;">
            💥 <strong>FALÊNCIA!</strong><br>
            ${player.name} faliu! ${creditor ? `Suas propriedades foram transferidas para ${creditor.name}.` : "Suas propriedades voltaram para o banco."}
        </div>
        <button id="btn-confirm-bankruptcy" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Continuar jogo</button>
    `;
    
    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-confirm-bankruptcy").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });

    return true;
}

function showWinModal(winner) {
    const overlay = document.createElement("div");
    overlay.id = "win-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
        align-items: center; z-index: 20000; font-family: 'Montserrat', sans-serif;
    `;

    const winBox = document.createElement("div");
    winBox.style = `
        background: #1e1e1e; border: 5px solid #ffa502; border-radius: 15px;
        padding: 40px; text-align: center; color: white; max-width: 450px; width: 90%;
        box-shadow: 0px 10px 30px rgba(250, 165, 2, 0.3);
    `;
    winBox.innerHTML = `
        <h1 style="margin-top: 0; color: #ffa502; font-size: 2.5rem; margin-bottom: 10px;">🏆 VITÓRIA! 🏆</h1>
        <h2 style="color: ${winner.color}; margin-bottom: 20px;">${winner.name} venceu a partida!</h2>
        <p style="font-size: 1.1rem; margin-bottom: 30px;">Parabéns! Todos os concorrentes faliram e você conquistou o monopólio absoluto do tabuleiro!</p>
        <button id="btn-restart-game" style="padding: 12px 25px; font-size: 1.1rem; background: #ffa502; color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Jogar Novamente 🔄</button>
    `;

    overlay.appendChild(winBox);
    document.body.appendChild(overlay);

    document.getElementById("btn-restart-game").addEventListener("click", () => {
        location.reload();
    });
}

function openTradeModal() {
    const proposer = players[currentPlayerIndex];
    const otherPlayers = players.filter(p => p.id !== proposer.id && !p.isBankrupt);
    if (otherPlayers.length === 0) return;

    const overlay = document.createElement("div");
    overlay.id = "trade-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
        align-items: center; z-index: 10000; font-family: 'Montserrat', sans-serif;
    `;

    const tradeBox = document.createElement("div");
    tradeBox.style = `
        background: #1e1e1e; border: 3px solid #2e7d32; border-radius: 12px;
        padding: 25px; color: white; max-width: 650px; width: 95%; max-height: 90vh; overflow-y: auto;
    `;

    tradeBox.innerHTML = `
        <h3 style="margin-top: 0; color: #2e7d32; text-align: center; font-size: 1.6rem; margin-bottom: 5px;">🤝 Proposta de Negócio</h3>
        <p style="text-align: center; color: #ffb300; font-size: 0.85rem; margin-bottom: 15px;">
            ⚠️ Taxa de Corretagem do Banco: <strong>$${GAME_CONFIG.taxaTroca}</strong> (Cobrada do proponente ao concluir a troca).
        </p>

        <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Negociar com:</label>
            <select id="trade-receiver-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 5px; font-size: 1rem;"></select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #2b2b2b; padding: 15px; border-radius: 8px; border: 1px solid #444;">
                <h4 style="margin: 0 0 10px 0; color: #1e90ff;">Você Oferece:</h4>
                <label style="font-size: 0.85rem;">Dinheiro ($):</label>
                <input type="number" id="trade-offer-money" value="0" min="0" max="${proposer.money}" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block;">Fichas Discretas 🎲 (Possui: ${proposer.fichasDiscreta}):</label>
                <input type="number" id="trade-offer-fd" value="0" min="0" max="${proposer.fichasDiscreta}" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block;">Fichas Contínuas 📈 (Possui: ${proposer.fichasContinua}):</label>
                <input type="number" id="trade-offer-fc" value="0" min="0" max="${proposer.fichasContinua}" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block; margin-bottom: 5px;">Propriedade:</label>
                <select id="trade-offer-prop" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></select>
            </div>

            <div style="background: #2b2b2b; padding: 15px; border-radius: 8px; border: 1px solid #444;">
                <h4 style="margin: 0 0 10px 0; color: #ff4757;">Você Pede:</h4>
                <label style="font-size: 0.85rem;">Dinheiro ($):</label>
                <input type="number" id="trade-request-money" value="0" min="0" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block;">Fichas Discretas 🎲:</label>
                <input type="number" id="trade-request-fd" value="0" min="0" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block;">Fichas Contínuas 📈:</label>
                <input type="number" id="trade-request-fc" value="0" min="0" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; display: block; margin-bottom: 5px;">Propriedade:</label>
                <select id="trade-request-prop" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></select>
            </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="btn-trade-cancel" style="padding: 8px 18px; background: #c62828; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancelar</button>
            <button id="btn-trade-send" style="padding: 8px 18px; background: #2e7d32; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Enviar Proposta</button>
        </div>
    `;

    overlay.appendChild(tradeBox);
    document.body.appendChild(overlay);

    const receiverSelect = document.getElementById("trade-receiver-select");
    const offerPropSelect = document.getElementById("trade-offer-prop");
    const requestPropSelect = document.getElementById("trade-request-prop");

    otherPlayers.forEach(p => {
        receiverSelect.innerHTML += `<option value="${p.id}">${p.name} (Saldo: $${p.money})</option>`;
    });

    function updatePropertiesDropdowns() {
        const selectedReceiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === selectedReceiverId);

        offerPropSelect.innerHTML = `<option value="">Nenhuma propriedade</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === proposer.id) {
                if (space.houses && space.houses > 0) return;
                offerPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });

        requestPropSelect.innerHTML = `<option value="">Nenhuma propriedade</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === receiver.id) {
                if (space.houses && space.houses > 0) return;
                requestPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });
    }

    receiverSelect.addEventListener("change", updatePropertiesDropdowns);
    updatePropertiesDropdowns();

    document.getElementById("btn-trade-cancel").addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    document.getElementById("btn-trade-send").addEventListener("click", () => {
        const receiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === receiverId);
        
        const offerMoney = parseInt(document.getElementById("trade-offer-money").value) || 0;
        const requestMoney = parseInt(document.getElementById("trade-request-money").value) || 0;
        
        const offerFd = parseInt(document.getElementById("trade-offer-fd").value) || 0;
        const offerFc = parseInt(document.getElementById("trade-offer-fc").value) || 0;
        
        const requestFd = parseInt(document.getElementById("trade-request-fd").value) || 0;
        const requestFc = parseInt(document.getElementById("trade-request-fc").value) || 0;

        const offerPropId = offerPropSelect.value !== "" ? parseInt(offerPropSelect.value) : null;
        const requestPropId = requestPropSelect.value !== "" ? parseInt(requestPropSelect.value) : null;

        if (proposer.money < offerMoney + GAME_CONFIG.taxaTroca) {
            alert(`Você precisa ter pelo menos $${offerMoney + GAME_CONFIG.taxaTroca} para cobrir sua oferta + a Taxa de Troca ($${GAME_CONFIG.taxaTroca})!`);
            return;
        }
        if (requestMoney > receiver.money) {
            alert("O outro jogador não possui essa quantia em dinheiro!");
            return;
        }
        if (offerFd > proposer.fichasDiscreta || offerFc > proposer.fichasContinua) {
            alert("Você ofereceu mais Fichas de Grandeza do que possui!");
            return;
        }
        if (requestFd > receiver.fichasDiscreta || requestFc > receiver.fichasContinua) {
            alert("O jogador escolhido não tem as Fichas de Grandeza solicitadas!");
            return;
        }

        document.body.removeChild(overlay);
        sendTradeProposalToUI(proposer, receiver, {
            offerMoney, offerFd, offerFc, offerPropId,
            requestMoney, requestFd, requestFc, requestPropId
        });
    });
}

function sendTradeProposalToUI(proposer, receiver, tradeData) {
    const offerProp = tradeData.offerPropId !== null ? boardSpaces.find(s => s.id === tradeData.offerPropId) : null;
    const requestProp = tradeData.requestPropId !== null ? boardSpaces.find(s => s.id === tradeData.requestPropId) : null;

    let offerDetails = [];
    if (tradeData.offerMoney > 0) offerDetails.push(`<strong>$${tradeData.offerMoney}</strong>`);
    if (tradeData.offerFd > 0) offerDetails.push(`<strong>${tradeData.offerFd} Ficha(s) Discreta(s)</strong>`);
    if (tradeData.offerFc > 0) offerDetails.push(`<strong>${tradeData.offerFc} Ficha(s) Contínua(s)</strong>`);
    if (offerProp) offerDetails.push(`<strong>${offerProp.name}</strong>`);
    if (offerDetails.length === 0) offerDetails.push("Nada");

    let requestDetails = [];
    if (tradeData.requestMoney > 0) requestDetails.push(`<strong>$${tradeData.requestMoney}</strong>`);
    if (tradeData.requestFd > 0) requestDetails.push(`<strong>${tradeData.requestFd} Ficha(s) Discreta(s)</strong>`);
    if (tradeData.requestFc > 0) requestDetails.push(`<strong>${tradeData.requestFc} Ficha(s) Contínua(s)</strong>`);
    if (requestProp) requestDetails.push(`<strong>${requestProp.name}</strong>`);
    if (requestDetails.length === 0) requestDetails.push("Nada");

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 15px; background: #1e1e1e; color: white; padding: 15px; border-radius: 8px; border: 2px dashed #2e7d32;">
            🤝 <strong>Proposta de Negócio para ${receiver.name}!</strong><br><br>
            ${proposer.name} oferece:<br>
            👉 ${offerDetails.join(" + ")}<br><br>
            Em troca de:<br>
            👉 ${requestDetails.join(" + ")}<br><br>
            <small style="color: #ffb300;">* Ao aceitar, ${proposer.name} pagará a Taxa de Troca de $${GAME_CONFIG.taxaTroca}.</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-accept-trade" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Aceitar Negócio</button>
            <button id="btn-decline-trade" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Recusar</button>
        </div>
    `;

    awaitingDecision = true;
    updateUI();

    const acceptBtn = document.getElementById("btn-accept-trade");
    const declineBtn = document.getElementById("btn-decline-trade");

    acceptBtn.addEventListener("click", () => {
        acceptBtn.disabled = true;
        declineBtn.disabled = true;

        proposer.money -= GAME_CONFIG.taxaTroca;

        proposer.money -= tradeData.offerMoney;
        proposer.money += tradeData.requestMoney;
        receiver.money += tradeData.offerMoney;
        receiver.money -= tradeData.requestMoney;

        proposer.fichasDiscreta = proposer.fichasDiscreta - tradeData.offerFd + tradeData.requestFd;
        proposer.fichasContinua = proposer.fichasContinua - tradeData.offerFc + tradeData.requestFc;

        receiver.fichasDiscreta = receiver.fichasDiscreta - tradeData.requestFd + tradeData.offerFd;
        receiver.fichasContinua = receiver.fichasContinua - tradeData.requestFc + tradeData.offerFc;

        if (offerProp) {
            offerProp.owner = receiver.id;
            updateTradeVisualProperty(offerProp, receiver);
        }
        if (requestProp) {
            requestProp.owner = proposer.id;
            updateTradeVisualProperty(requestProp, proposer);
        }

        statusDiv.innerHTML = `<div style="color: #2ed573; font-weight: bold;">🤝 Negócio Concluído! Taxa de $${GAME_CONFIG.taxaTroca} recolhida pelo Banco.</div>`;
        awaitingDecision = false;
        updateUI();

        setTimeout(() => {
            statusDiv.innerHTML = `É a vez de <strong>${proposer.name}</strong> jogar!`;
            updateUI();
        }, 2000);
    });

    declineBtn.addEventListener("click", () => {
        acceptBtn.disabled = true;
        declineBtn.disabled = true;

        statusDiv.innerHTML = `<div style="color: #ff4757; font-weight: bold;">❌ ${receiver.name} recusou a proposta de negócio.</div>`;
        awaitingDecision = false;
        updateUI();

        setTimeout(() => {
            statusDiv.innerHTML = `É a vez de <strong>${proposer.name}</strong> jogar!`;
            updateUI();
        }, 2000);
    });
}

function updateTradeVisualProperty(space, newOwner) {
    const spaceDiv = document.getElementById(`space-${space.id}`);
    if (spaceDiv) {
        spaceDiv.style.border = `3px dashed ${newOwner.color}`;
    }
    const priceLabel = document.getElementById(`price-label-${space.id}`);
    if (priceLabel) {
        priceLabel.innerText = "COMPRADO";
        priceLabel.style.color = newOwner.color;
    }
}

window.onload = () => {
    const rollBtn = document.getElementById("rollDice");
    if (rollBtn) {
        rollBtn.addEventListener("click", rollDice);
    }
};

// ==========================================
// MÓDULO MULTIPLAYER PEERJS (v1.1.5 - REALTIME STATE OBSERVER)
// ==========================================
let peer = null;
let connections = [];
let isHost = false;
let myPlayerId = 0; 
let roomCode = "";
let gameStarted = false; 
let lastKnownStateJSON = "";

// Transmite o estado completo do jogo (Host -> Clientes)
function broadcastState() {
    if (!isHost) return;
    
    const gameState = {
        type: 'GAME_STATE',
        players: typeof players !== 'undefined' ? players : [],
        boardSpaces: typeof boardSpaces !== 'undefined' ? boardSpaces : [],
        currentPlayerIndex: typeof currentPlayerIndex !== 'undefined' ? currentPlayerIndex : 0,
        GAME_CONFIG: typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG : {},
        gameStarted: gameStarted
    };

    // Guarda hash do último estado enviado
    lastKnownStateJSON = JSON.stringify({
        p: gameState.players,
        c: gameState.currentPlayerIndex,
        b: gameState.boardSpaces ? gameState.boardSpaces.map(s => ({ o: s.owner, h: s.houses })) : []
    });

    connections.forEach(conn => {
        if (conn && conn.open) {
            conn.send(gameState);
        }
    });

    applyTurnSecurityUI();
}

// LOOP OBSERVADOR DO HOST: Se qualquer dado mudar no Host, sincroniza automaticamente
setInterval(() => {
    if (!isHost || !gameStarted || connections.length === 0) return;

    const currentStateJSON = JSON.stringify({
        p: typeof players !== 'undefined' ? players : [],
        c: typeof currentPlayerIndex !== 'undefined' ? currentPlayerIndex : 0,
        b: typeof boardSpaces !== 'undefined' ? boardSpaces.map(s => ({ o: s.owner, h: s.houses })) : []
    });

    if (currentStateJSON !== lastKnownStateJSON) {
        broadcastState();
    }
}, 250); // Checa mudanças 4 vezes por segundo

// Bloqueia / Libera controles de acordo com o turno do jogador
function applyTurnSecurityUI() {
    const diceBtn = document.getElementById("rollDice");
    if (!diceBtn || typeof currentPlayerIndex === 'undefined') return;

    const isMyTurn = (currentPlayerIndex === myPlayerId);

    if (isMyTurn) {
        diceBtn.disabled = false;
        diceBtn.style.opacity = "1";
        diceBtn.style.cursor = "pointer";
    } else {
        diceBtn.disabled = true;
        diceBtn.style.opacity = "0.4";
        diceBtn.style.cursor = "not-allowed";
    }
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

// Recebe e renderiza os dados enviados pelo Host
function handleIncomingData(data, conn) {
    if (!data) return;

    // 1. Recebimento de Atualização do Estado do Jogo (Enviado do Host)
    if (data.type === 'GAME_STATE') {
        if (typeof players !== 'undefined') players = data.players;
        if (typeof currentPlayerIndex !== 'undefined') currentPlayerIndex = data.currentPlayerIndex;
        gameStarted = data.gameStarted;
        
        // Sincroniza estado das casas/propriedades no tabuleiro
        if (data.boardSpaces && typeof boardSpaces !== 'undefined') {
            data.boardSpaces.forEach((space, idx) => {
                if (boardSpaces[idx]) {
                    boardSpaces[idx].owner = space.owner;
                    boardSpaces[idx].houses = space.houses;
                }
            });
        }

        // Revela mesa para o convidado
        if (gameStarted) {
            const overlay = document.getElementById("online-modal-overlay");
            if (overlay) overlay.remove();

            const gameSection = document.getElementById("game-section-area");
            if (gameSection && gameSection.classList.contains("hidden")) {
                gameSection.classList.remove("hidden");
                gameSection.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Força re-renderização completa da tela no Convidado
        if (typeof renderBoard === "function") renderBoard();
        if (typeof renderPawns === "function") renderPawns();
        if (typeof updateUI === "function") updateUI();
        
        applyTurnSecurityUI();
    } 
    // 2. Registro do Jogador Conectado
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
    // 3. Boas-Vindas ao Convidado
    else if (data.type === 'WELCOME_PLAYER') {
        myPlayerId = data.assignedId;
        const statusText = document.getElementById("guest-wait-status");
        if (statusText) {
            statusText.innerHTML = `<span style="color: #2ed573;">✔ Conectado como Jogador ${myPlayerId + 1}!</span><br><small style="color: #aaa;">Aguardando o Host iniciar a partida...</small>`;
        }
    }
    // 4. Solicitação do Convidado para Rolar o Dado
    else if (data.type === 'ACTION_ROLL_DICE' && isHost) {
        if (currentPlayerIndex === data.senderId) {
            if (typeof rollDice === "function") rollDice();
            broadcastState();
        }
    }
}

function attachNetworkTriggers() {
    const diceBtn = document.getElementById("rollDice");
    if (diceBtn && !diceBtn.dataset.networkHooked) {
        diceBtn.dataset.networkHooked = "true";
        const originalClick = diceBtn.onclick;

        diceBtn.onclick = (e) => {
            if (currentPlayerIndex !== myPlayerId) {
                showToastNotification("Aguarde a sua vez de jogar!");
                return;
            }

            if (isHost) {
                if (originalClick) originalClick(e);
                else if (typeof rollDice === "function") rollDice();
                broadcastState();
            } else {
                sendNetworkAction('ACTION_ROLL_DICE');
            }
        };
    }
}

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

// Modal Principal Online
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
            <span style="font-size: 0.75rem; background: #6c5ce7; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold;">v1.1.5 - P2P MULTIPLAYER</span>
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

            <!-- SUB-VIEW: DIGITAR CÓDIGO -->
            <div id="online-join-view" style="display: none; margin-bottom: 20px;">
                <p style="margin-bottom: 10px; color: #ccc;">Digite o código da sala de 4 dígitos:</p>
                <input type="text" id="join-room-input" maxlength="4" placeholder="EX: X9W2" style="text-transform: uppercase; font-size: 1.5rem; text-align: center; letter-spacing: 4px; width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #6c5ce7; background: #0f0c1b; color: white; margin-bottom: 15px;">
                <div id="join-error-msg" style="color: #ff4757; font-size: 0.85rem; margin-bottom: 10px; display: none;"></div>
                <button id="btn-confirm-join" style="width: 100%; padding: 12px; background: #2ed573; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; font-size: 1rem;">CONECTAR À SALA</button>
            </div>

            <!-- SUB-VIEW: ESPERANDO START DO HOST -->
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

    // --- 1. CRIAR SALA (HOST) ---
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

    // --- 2. ENTRAR EM SALA (CONVIDADO) ---
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
