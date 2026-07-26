// ==========================================
// CONFIGURAÇÕES GERAIS DO JOGO
// ==========================================
const GAME_CONFIG = {
    startingMoney: 25000,       // Dinheiro inicial de cada jogador
    goBonus: 2000,              // Bônus ao passar pela PARTIDA
    rentMultiplier: 1.0,        // Multiplicador global de aluguéis
    impostoRenda: 2000,         // Imposto de Renda
    taxaLuxo: 1000,             // Taxa de Luxo
    fiancaPrisao: 500,          // Valor da fiança
    tradeFeePercent: 0.10       // Taxa de troca (10% de taxa cobrada pelo Banco)
};

// Cartas de Sorte ou Revés
const CARDS = [
    { text: "Sorte! Você tirou o 1º lugar no torneio. Receba $100", type: "earn", value: 100 },
    { text: "Revés! Pague taxas de manutenção. Pague $50", type: "pay", value: 50 },
    { text: "Sorte! Receba os dividendos de suas ações. Receba $200", type: "earn", value: 200 },
    { text: "Revés! Multa de trânsito. Pague $30", type: "pay", value: 30 }
];

// Lista oficial das 40 casas
const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, name: "Raio", type: "property", color: "cor-roxo", price: 100, rent: 10, owner: null, tokenType: "continua" },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Área do círculo", type: "property", color: "cor-roxo", price: 100, rent: 10, owner: null, tokenType: "continua" },
    { id: 4, name: "Imposto de Renda", type: "special" },
    
    // Casa Especial de Grandeza Contínua
    { id: 5, name: "Grandeza Contínua", type: "grandeza_station", price: 200, rent: 20, owner: null, tokenType: "continua" },
    
    { id: 6, name: "Número de indivíduos", type: "property", color: "cor-azul-claro", price: 120, rent: 12, owner: null, tokenType: "discreta" },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Taxa de natalidade", type: "property", color: "cor-azul-claro", price: 140, rent: 14, owner: null, tokenType: "discreta" },
    { id: 9, name: "Taxa de mortalidade", type: "property", color: "cor-azul-claro", price: 140, rent: 14, owner: null, tokenType: "discreta" },
    
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Desempenho", type: "property", color: "cor-rosa", price: 160, rent: 16, owner: null, tokenType: "discreta" },
    { id: 12, name: "Cia. Telecom", type: "utility", price: 150, rent: 15, owner: null, tokenType: "continua" },
    { id: 13, name: "Número de exercícios", type: "property", color: "cor-rosa", price: 160, rent: 16, owner: null, tokenType: "discreta" },
    { id: 14, name: "Horas de estudo", type: "property", color: "cor-rosa", price: 180, rent: 18, owner: null, tokenType: "continua" },
    { id: 15, name: "Trem de Alta Velocidade", type: "station", price: 200, rent: 20, owner: null, tokenType: "continua" },
    { id: 16, name: "Tempo de uso", type: "property", color: "cor-laranja", price: 200, rent: 20, owner: null, tokenType: "continua" },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Potência", type: "property", color: "cor-laranja", price: 200, rent: 20, owner: null, tokenType: "continua" },
    { id: 19, name: "Consumo elétrico", type: "property", color: "cor-laranja", price: 220, rent: 22, owner: null, tokenType: "continua" },
    
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Preço", type: "property", color: "cor-vermelho", price: 240, rent: 24, owner: null, tokenType: "discreta" },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Demanda", type: "property", color: "cor-vermelho", price: 240, rent: 24, owner: null, tokenType: "discreta" },
    { id: 24, name: "Produção", type: "property", color: "cor-vermelho", price: 260, rent: 26, owner: null, tokenType: "discreta" },
    
    // Casa Especial de Grandeza Discreta
    { id: 25, name: "Grandeza Discreta", type: "grandeza_station", price: 200, rent: 20, owner: null, tokenType: "discreta" },
    
    { id: 26, name: "Pressão atmosférica", type: "property", color: "cor-amarelo", price: 280, rent: 28, owner: null, tokenType: "continua" },
    { id: 27, name: "Cia. Energia Solar", type: "utility", price: 150, rent: 15, owner: null, tokenType: "continua" },
    { id: 28, name: "Umidade do ar", type: "property", color: "cor-amarelo", price: 280, rent: 28, owner: null, tokenType: "continua" },
    { id: 29, name: "Temperatura", type: "property", color: "cor-amarelo", price: 300, rent: 30, owner: null, tokenType: "continua" },
    
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Vazão de Água", type: "property", color: "cor-verde", price: 320, rent: 32, owner: null, tokenType: "continua" },
    { id: 32, name: "Volume de Reservatório", type: "property", color: "cor-verde", price: 320, rent: 32, owner: null, tokenType: "continua" },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Massa Total", type: "property", color: "cor-verde", price: 350, rent: 35, owner: null, tokenType: "continua" },
    { id: 35, name: "Companhia Aérea", type: "station", price: 200, rent: 20, owner: null, tokenType: "continua" },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    { id: 37, name: "Área", type: "property", color: "cor-azul-escuro", price: 400, rent: 40, owner: null, tokenType: "continua" },
    { id: 38, name: "Taxa de Luxo", type: "special" },
    { id: 39, name: "Lado do quadrado", type: "property", color: "cor-azul-escuro", price: 400, rent: 40, owner: null, tokenType: "continua" }
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
    if (index >= 0 && index <= 10) return { row: 11, col: 11 - index };
    if (index > 10 && index <= 20) return { row: 11 - (index - 10), col: 1 };
    if (index > 20 && index <= 30) return { row: 1, col: index - 19 };
    if (index > 30 && index <= 39) return { row: index - 29, col: 11 };
}

function renderBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;
    boardElement.innerHTML = "";
    
    let boardCenter = document.createElement("div");
    boardCenter.className = "board-center";
    boardCenter.innerText = "MUNDO";
    boardElement.appendChild(boardCenter);

    boardSpaces.forEach((space) => {
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space space-${space.id} ${space.cssClass || ''}`;
        spaceDiv.id = `space-${space.id}`;
        
        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;
        
        if (space.type === "property" || space.type === "station" || space.type === "utility" || space.type === "grandeza_station") {
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
            priceText.className = "space-price";
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
        row.className = "player-card";
        
        if (p.isBankrupt) {
            row.style.opacity = "0.4";
            row.style.textDecoration = "line-through";
            row.style.borderLeft = `5px solid #555`;
            row.innerHTML = `<span>${p.name} (💥 Faliu)</span> <span>$0</span>`;
        } else {
            if (idx === currentPlayerIndex) {
                row.classList.add("active-turn");
            }
            row.style.borderLeft = `5px solid ${p.color}`;
            
            row.innerHTML = `
                <div class="player-header">
                    <span class="player-name">
                        <span class="player-dot" style="background-color: ${p.color}"></span>
                        ${p.name} ${idx === currentPlayerIndex ? "👉" : ""}
                    </span>
                    <span class="player-money">$${p.money}</span>
                </div>
                <div style="font-size: 0.8rem; color: #ddd; margin-top: 5px;">
                    Fichas: 🔵 Discreta: <strong>${p.tokens.discreta}</strong> | 🔴 Contínua: <strong>${p.tokens.continua}</strong>
                </div>
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
        tradeButton.style.padding = "14px";
        tradeButton.style.fontSize = "1.1rem";
        tradeButton.style.fontWeight = "bold";
        tradeButton.style.backgroundColor = "#2e7d32";
        tradeButton.style.color = "white";
        tradeButton.style.border = "none";
        tradeButton.style.borderRadius = "8px";
        tradeButton.style.cursor = "pointer";
        tradeButton.style.transition = "all 0.2s ease";
        tradeButton.addEventListener("click", openTradeModal);
        rollButton.parentNode.appendChild(tradeButton);
    }

    const isCurrentInJail = players[currentPlayerIndex]?.inJail;
    const isCurrentBankrupt = players[currentPlayerIndex]?.isBankrupt;

    if (isMoving || awaitingDecision || isCurrentBankrupt) {
        if (rollButton) { rollButton.disabled = true; }
        if (tradeButton) { tradeButton.disabled = true; tradeButton.style.opacity = "0.5"; tradeButton.style.cursor = "not-allowed"; }
    } else {
        if (rollButton) { rollButton.disabled = false; }
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
            player.money += GAME_CONFIG.goBonus;
            // Bônus adicional ao passar na PARTIDA: ganha 1 ficha de cada tipo
            player.tokens.discreta += 1;
            player.tokens.continua += 1;
            document.getElementById("game-status").innerText = `${player.name} passou pela PARTIDA, ganhou $${GAME_CONFIG.goBonus} e +1 Ficha de cada tipo!`;
            updateUI();
        }

        renderPawns();
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    isMoving = false;
    handleLanding(player);
}

// ==========================================
// AVALIAÇÃO E PROCESSAMENTO DA PARADA
// ==========================================

function handleLanding(player) {
    const currentSpace = boardSpaces[player.position];

    // 1. CASAS ESPECIAIS DE GRANDEZA (Discreta ou Contínua)
    if (currentSpace.type === "grandeza_station") {
        handleGrandezaSpaceLanding(player, currentSpace);
        return;
    }

    // 2. PROPRIEDADES NORMAIS, ESTAÇÕES E UTILIDADES
    const purchaseableTypes = ["property", "station", "utility"];
    if (purchaseableTypes.includes(currentSpace.type)) {
        if (currentSpace.owner === null) {
            showPurchaseModal(player, currentSpace);
            return; 
        } else if (currentSpace.owner !== player.id) {
            payRent(player, currentSpace);
            return; 
        } else {
            if (currentSpace.type === "property" && hasMonopoly(player, currentSpace.color)) {
                if (currentSpace.houses < 5) {
                    showBuildModal(player, currentSpace);
                    return;
                } else {
                    document.getElementById("game-status").innerText = `${player.name} caiu em ${currentSpace.name} (Melhorias máximas completadas!).`;
                }
            } else {
                document.getElementById("game-status").innerText = `${player.name} caiu na sua própria propriedade: ${currentSpace.name}.`;
            }
        }
    } else if (currentSpace.name === "Sorte ou Revés") {
        drawCard(player);
        return; 
    } else if (currentSpace.name === "VÁ PARA A PRISÃO") {
        sendToJail(player);
        return;
    } else if (currentSpace.name === "Imposto de Renda") {
        payFlatTax(player, GAME_CONFIG.impostoRenda, "Imposto de Renda");
        return;
    } else if (currentSpace.name === "Taxa de Luxo") {
        payFlatTax(player, GAME_CONFIG.taxaLuxo, "Taxa de Luxo");
        return;
    } else {
        document.getElementById("game-status").innerText = `${player.name} caiu em ${currentSpace.name}.`;
    }

    nextTurn();
}

// ==========================================
// REGRAS DAS CASAS "GRANDEZA DISCRETA / CONTÍNUA"
// ==========================================

function handleGrandezaSpaceLanding(player, space) {
    const tokenType = space.tokenType; // 'discreta' ou 'continua'
    const tokenName = tokenType === 'discreta' ? 'Ficha Discreta' : 'Ficha Contínua';

    // CASO 1: Sem dono -> Jogador pode comprar e ganha 1 ficha de graça
    if (space.owner === null) {
        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                ⭐ ${player.name} caiu na casa <strong>${space.name}</strong>!<br>
                Compre por <strong>$${space.price}</strong> e receba <strong>1 ${tokenName} de graça</strong>!
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="btn-buy-g-yes" style="padding: 6px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Comprar</button>
                <button id="btn-buy-g-no" style="padding: 6px 15px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Passar</button>
            </div>
        `;

        awaitingDecision = true;
        updateUI();

        document.getElementById("btn-buy-g-yes").addEventListener("click", () => {
            if (player.money >= space.price) {
                player.money -= space.price;
                space.owner = player.id;
                player.tokens[tokenType] += 1; // Ganha 1 ficha de graça!

                const spaceDiv = document.getElementById(`space-${space.id}`);
                if (spaceDiv) spaceDiv.style.border = `3px dashed ${player.color}`;
                
                const priceLabel = document.getElementById(`price-label-${space.id}`);
                if (priceLabel) {
                    priceLabel.innerText = "COMPRADO";
                    priceLabel.style.color = player.color;
                }

                document.getElementById("game-status").innerText = `${player.name} comprou ${space.name} por $${space.price} e ganhou 1 ${tokenName}!`;
            } else {
                alert("Dinheiro insuficiente!");
                return;
            }

            awaitingDecision = false;
            nextTurn();
        });

        document.getElementById("btn-buy-g-no").addEventListener("click", () => {
            document.getElementById("game-status").innerText = `${player.name} não comprou ${space.name}.`;
            awaitingDecision = false;
            nextTurn();
        });
    } 
    // CASO 2: O dono caiu na própria casa -> Ganha 1 ficha sozinho
    else if (space.owner === player.id) {
        player.tokens[tokenType] += 1;
        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #2ed573;">
                🎁 <strong>Sua própria Casa de Grandeza!</strong><br>
                ${player.name} não paga nada e recebeu <strong>+1 ${tokenName}</strong>!
            </div>
            <button id="btn-confirm-own-g" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok</button>
        `;
        awaitingDecision = true;
        updateUI();

        document.getElementById("btn-confirm-own-g").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
    } 
    // CASO 3: Outro jogador caiu na casa -> Pode pagar o aluguel OU dar 1 Ficha para TODOS
    else {
        const owner = players.find(p => p.id === space.owner);
        const rentAmount = space.rent;

        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #ffa502;">
                ⚠️ ${player.name} caiu em <strong>${space.name}</strong> (Dono: ${owner ? owner.name : 'Banco'}).<br>
                Escolha a sua ação:
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="btn-g-pay-rent" style="padding: 6px 15px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    💸 Pagar Aluguel ($${rentAmount})
                </button>
                <button id="btn-g-give-tokens" style="padding: 6px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🎁 Todos recebem 1 ${tokenName}
                </button>
            </div>
        `;

        awaitingDecision = true;
        updateUI();

        document.getElementById("btn-g-pay-rent").addEventListener("click", () => {
            player.money -= rentAmount;
            if (owner) owner.money += rentAmount;

            if (player.money < 0) {
                checkBankruptcy(player, owner ? owner.id : null);
                return;
            }

            document.getElementById("game-status").innerText = `${player.name} pagou $${rentAmount} de taxa para ${owner ? owner.name : 'o Banco'}.`;
            awaitingDecision = false;
            nextTurn();
        });

        document.getElementById("btn-g-give-tokens").addEventListener("click", () => {
            players.forEach(p => {
                if (!p.isBankrupt) {
                    p.tokens[tokenType] += 1;
                }
            });

            document.getElementById("game-status").innerText = `🎉 ${player.name} escolheu distribuir 1 ${tokenName} para TODOS os jogadores!`;
            awaitingDecision = false;
            nextTurn();
        });
    }
}

// ==========================================
// COMPRAS DE PROPRIEDADES NORMAIS (Exige Ficha)
// ==========================================

function showPurchaseModal(player, space) {
    const tokenType = space.tokenType || "continua";
    const tokenName = tokenType === "discreta" ? "Ficha Discreta" : "Ficha Contínua";
    const playerHasToken = player.tokens[tokenType] >= 1;

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            ${player.name} caiu em <strong>${space.name}</strong>!<br>
            Custo: <strong>$${space.price} + 1 ${tokenName}</strong>.<br>
            <small style="color: ${playerHasToken ? '#2ed573' : '#ff4757'}; font-weight: bold;">
                ${playerHasToken ? `✅ Você possui ${player.tokens[tokenType]} ${tokenName}(s)` : `❌ Você NÃO tem a ${tokenName} necessária!`}
            </small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-buy-yes" ${!playerHasToken ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="padding: 6px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;"'}>Comprar</button>
            <button id="btn-buy-no" style="padding: 6px 15px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Passar Vez</button>
        </div>
    `;

    awaitingDecision = true;
    updateUI();

    if (playerHasToken) {
        document.getElementById("btn-buy-yes").addEventListener("click", () => {
            if (player.money >= space.price) {
                player.money -= space.price;
                player.tokens[tokenType] -= 1; // Consome 1 Ficha
                space.owner = player.id;
                
                const spaceDiv = document.getElementById(`space-${space.id}`);
                if (spaceDiv) spaceDiv.style.border = `3px dashed ${player.color}`;
                
                const priceLabel = document.getElementById(`price-label-${space.id}`);
                if (priceLabel) {
                    priceLabel.innerText = "COMPRADO";
                    priceLabel.style.color = player.color;
                }

                document.getElementById("game-status").innerText = `${player.name} comprou ${space.name} usando $${space.price} e 1 ${tokenName}!`;
            } else {
                alert("Dinheiro insuficiente!");
                return;
            }

            awaitingDecision = false;
            nextTurn();
        });
    }

    document.getElementById("btn-buy-no").addEventListener("click", () => {
        document.getElementById("game-status").innerText = `${player.name} passou a oportunidade de comprar ${space.name}.`;
        awaitingDecision = false;
        nextTurn();
    });
}

// ==========================================
// CONSTRUÇÃO DE MELHORIAS
// ==========================================

function showBuildModal(player, space) {
    const housePrice = Math.round(space.price / 2);
    const tokenType = space.tokenType || "continua";
    const tokenName = tokenType === "discreta" ? "Ficha Discreta" : "Ficha Contínua";
    const playerHasToken = player.tokens[tokenType] >= 1;

    const isHotel = space.houses === 4;
    const itemText = isHotel ? "um Hotel" : "uma Casa";
    
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            🏰 <strong>Monopólio!</strong> Você caiu em <strong>${space.name}</strong> (${space.houses} melhoria(s)).<br>
            Construir ${itemText} por <strong>$${housePrice} + 1 ${tokenName}</strong>?<br>
            <small style="color: ${playerHasToken ? '#2ed573' : '#ff4757'};">
                ${playerHasToken ? `✅ Você tem ${player.tokens[tokenType]} ${tokenName}(s)` : `❌ Falta 1 ${tokenName} para construir!`}
            </small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-build-yes" ${!playerHasToken ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="padding: 6px 15px; background: #2e7d32; border: none; color: white; border-radius: 4px; cursor: pointer;"'}>Construir</button>
            <button id="btn-build-no" style="padding: 6px 15px; background: #c62828; border: none; color: white; border-radius: 4px; cursor: pointer;">Passar Vez</button>
        </div>
    `;

    awaitingDecision = true;
    updateUI();

    if (playerHasToken) {
        document.getElementById("btn-build-yes").addEventListener("click", () => {
            if (player.money >= housePrice) {
                player.money -= housePrice;
                player.tokens[tokenType] -= 1; // Consome 1 Ficha
                space.houses += 1;
                
                updateSpaceVisualWithHouses(space);
                
                document.getElementById("game-status").innerText = `${player.name} construiu ${itemText} em ${space.name}!`;
                awaitingDecision = false;
                nextTurn();
            } else {
                alert("Dinheiro insuficiente!");
            }
        });
    }

    document.getElementById("btn-build-no").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

// ==========================================
// AUXILIARES DE TABULEIRO
// ==========================================

function payFlatTax(player, amount, taxName) {
    player.money -= amount;
    if (player.money < 0) { checkBankruptcy(player, null); return; }

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #c62828;">
            💸 <strong>${taxName}!</strong><br>
            ${player.name} pagou <strong>$${amount}</strong> ao banco.
        </div>
        <button id="btn-confirm-tax" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok</button>
    `;
    
    awaitingDecision = true;
    updateUI();
    
    document.getElementById("btn-confirm-tax").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

function sendToJail(player) {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    renderPawns();
    
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #c62828;">
            🚨 <strong>Vá para a Prisão!</strong><br>
            ${player.name} foi preso!
        </div>
        <button id="btn-confirm-jail" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok</button>
    `;
    
    awaitingDecision = true;
    updateUI();
    
    document.getElementById("btn-confirm-jail").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

function drawCard(player) {
    const randomIndex = Math.floor(Math.random() * CARDS.length);
    const card = CARDS[randomIndex];
    
    if (card.type === "earn") player.money += card.value;
    else if (card.type === "pay") player.money -= card.value;

    if (player.money < 0) { checkBankruptcy(player, null); return; }

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #fff8e1; color: #333; padding: 10px; border-radius: 5px;">
            🃏 <strong>Carta Sorte ou Revés</strong><br><br>
            <em>"${card.text}"</em>
        </div>
        <button id="btn-confirm-card" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok</button>
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
    if (owner) owner.money += rentAmount;
    
    if (player.money < 0) { checkBankruptcy(player, owner ? owner.id : null); return; }

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #c62828;">
            💸 <strong>Aluguel!</strong><br>
            ${player.name} pagou <strong>$${rentAmount}</strong> para ${owner ? owner.name : 'o Banco'}!
        </div>
        <button id="btn-confirm-rent" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; border-radius: 4px; cursor: pointer;">Ok</button>
    `;
    
    awaitingDecision = true; 
    updateUI();
    
    document.getElementById("btn-confirm-rent").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
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
        if (player.money < 0) { checkBankruptcy(player, null); return true; }

        player.inJail = false;
        player.jailTurns = 0;
        
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                🚨 ${player.name} pagou a fiança obrigatória de $${GAME_CONFIG.fiancaPrisao}!
            </div>
            <button id="btn-forced-jail-free" style="padding: 6px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px;">Continuar</button>
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
        <div style="margin-bottom: 10px;">
            ⛓️ <strong>${player.name} está na Prisão</strong>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-jail-roll" style="padding: 6px 15px; background: #333; color: white; border: 1px solid #555; cursor: pointer;">Tentar Dados Duplos 🎲</button>
            <button id="btn-jail-pay" style="padding: 6px 15px; background: #2e7d32; color: white; border: none; cursor: pointer;">Pagar $${GAME_CONFIG.fiancaPrisao} 💸</button>
        </div>
    `;
    
    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-jail-roll").addEventListener("click", () => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        if (d1 === d2) {
            player.inJail = false;
            player.jailTurns = 0;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Dados duplos (${d1} e ${d2})! Você está LIVRE!`;
            setTimeout(() => { movePlayer(currentPlayerIndex, d1 + d2); }, 1500);
        } else {
            player.jailTurns += 1;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Tirou ${d1} e ${d2}. Continua preso!`;
            setTimeout(() => { nextTurn(); }, 1500);
        }
    });

    document.getElementById("btn-jail-pay").addEventListener("click", () => {
        if (player.money >= GAME_CONFIG.fiancaPrisao) {
            player.money -= GAME_CONFIG.fiancaPrisao;
            player.inJail = false;
            player.jailTurns = 0;
            awaitingDecision = false;
            updateUI();
            statusDiv.innerText = `${player.name} pagou a fiança e está livre!`;
        } else {
            alert("Dinheiro insuficiente!");
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

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = d1 + d2;

    document.getElementById("game-status").innerText = `🎲 ${player.name} tirou ${d1} + ${d2} = ${totalSteps}!`;
    movePlayer(currentPlayerIndex, totalSteps);
}

function startPlayerSetup() {
    const overlay = document.createElement("div");
    overlay.id = "setup-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
        align-items: center; z-index: 9999; font-family: 'Montserrat', sans-serif;
    `;

    const setupBox = document.createElement("div");
    setupBox.style = `
        background: #1e1e1e; border: 3px solid #ff4757; border-radius: 12px;
        padding: 30px; text-align: center; color: white; max-width: 400px; width: 90%;
    `;
    setupBox.innerHTML = `
        <h2 style="margin-top: 0; color: #ff4757; font-size: 1.8rem; margin-bottom: 20px;">BANCO IMOBILIÁRIO MUNDO</h2>
        <p style="font-size: 1.1rem; margin-bottom: 25px;">Quantos jogadores vão participar?</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px;">
            <button class="setup-btn" data-qty="2">2</button>
            <button class="setup-btn" data-qty="3">3</button>
            <button class="setup-btn" data-qty="4">4</button>
            <button class="setup-btn" data-qty="5">5</button>
            <button class="setup-btn" data-qty="6">6</button>
        </div>
    `;

    overlay.appendChild(setupBox);
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.innerHTML = `
        .setup-btn {
            background: #2e2e2e; color: white; border: 2px solid #555;
            padding: 12px 20px; font-size: 1.2rem; border-radius: 8px;
            cursor: pointer; transition: all 0.2s ease; font-weight: bold; width: 55px;
        }
        .setup-btn:hover { background: #ff4757; border-color: #ff4757; transform: scale(1.1); }
    `;
    document.head.appendChild(style);

    setupBox.querySelectorAll(".setup-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const qty = parseInt(e.target.getAttribute("data-qty"));
            initializePlayers(qty);
            document.body.removeChild(overlay);
        });
    });
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
            // Cada jogador começa com 2 fichas de cada tipo para dinamizar o jogo
            tokens: { discreta: 2, continua: 2 } 
        });
    }
    
    boardSpaces.forEach(space => {
        if (space.type === "property") space.houses = 0;
        space.owner = null;
    });

    const gameArea = document.getElementById("game-section-area");
    if (gameArea) gameArea.classList.remove("hidden");

    renderBoard();
    renderPawns();
    updateUI();

    document.getElementById("game-status").innerHTML = `Partida iniciada! É a vez de <strong>${players[currentPlayerIndex].name}</strong> jogar!`;
}

function hasMonopoly(player, colorClass) {
    if (!colorClass) return false;
    const sameColorSpaces = boardSpaces.filter(space => space.color === colorClass);
    return sameColorSpaces.every(space => space.owner === player.id);
}

function calculateCurrentRent(space) {
    if (space.type !== "property") return space.rent;
    const owner = players.find(p => p.id === space.owner);
    let finalRent = space.rent;

    if (space.houses === 1) finalRent = space.rent * 5;
    else if (space.houses === 2) finalRent = space.rent * 15;
    else if (space.houses === 3) finalRent = space.rent * 40;
    else if (space.houses === 4) finalRent = space.rent * 80;
    else if (space.houses === 5) finalRent = space.rent * 120;
    else if (owner && hasMonopoly(owner, space.color)) finalRent = space.rent * 2;

    return Math.round(finalRent * GAME_CONFIG.rentMultiplier);
}

function updateSpaceVisualWithHouses(space) {
    const tag = document.getElementById(`tag-${space.id}`);
    if (!tag) return;

    tag.innerHTML = "";
    tag.style.display = "flex";
    tag.style.justifyContent = "center";
    tag.style.alignItems = "center";

    if (space.houses === 5) {
        tag.innerHTML = `<span style="color: #ff4757; font-size: 14px;">🏨</span>`;
    } else {
        let houseIcons = "";
        for (let i = 0; i < space.houses; i++) houseIcons += `<span style="color: #2ed573; font-size: 10px;">🏠</span>`;
        tag.innerHTML = houseIcons;
    }
}

function checkBankruptcy(player, creditorId) {
    player.isBankrupt = true;
    player.money = 0;
    
    const statusDiv = document.getElementById("game-status");
    
    boardSpaces.forEach(space => {
        if (space.owner === player.id) {
            space.owner = null;
            space.houses = 0;
            updateSpaceVisualWithHouses(space);
            const spaceDiv = document.getElementById(`space-${space.id}`);
            if (spaceDiv) spaceDiv.style.border = "1px solid #ccc";
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
        <div style="margin-bottom: 10px; background: #c62828; color: white; padding: 10px; border-radius: 5px;">
            💥 <strong>FALÊNCIA!</strong> ${player.name} faliu!
        </div>
        <button id="btn-confirm-bk" style="padding: 6px 15px; background: #0d0d0d; color: white; border: none; cursor: pointer;">Continuar</button>
    `;
    
    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-confirm-bk").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });

    return true;
}

function showWinModal(winner) {
    alert(`🏆 PARABÉNS! ${winner.name} venceu a partida!`);
    location.reload();
}

// ==========================================
// SISTEMA DE TROCAS (TRADE) COM FICHAS
// ==========================================

function openTradeModal() {
    const proposer = players[currentPlayerIndex];
    const otherPlayers = players.filter(p => p.id !== proposer.id && !p.isBankrupt);
    
    if (otherPlayers.length === 0) {
        alert("Não há outros jogadores ativos para negociar!");
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "trade-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); display: flex; justify-content: center;
        align-items: center; z-index: 10000; font-family: 'Montserrat', sans-serif;
    `;

    const tradeBox = document.createElement("div");
    tradeBox.style = `
        background: #1e1e1e; border: 3px solid #2e7d32; border-radius: 12px;
        padding: 25px; color: white; max-width: 650px; width: 95%; max-height: 90vh; overflow-y: auto;
    `;

    tradeBox.innerHTML = `
        <h3 style="margin-top: 0; color: #2e7d32; text-align: center; font-size: 1.5rem;">🤝 Negociação de Mercado</h3>
        <p style="text-align:center; font-size: 0.85rem; color: #aaa; margin-bottom: 15px;">
            ℹ️ Taxa do Banco de <strong>10%</strong> cobrada apenas sobre quantias em dinheiro negociadas.
        </p>

        <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Negociar com:</label>
            <select id="trade-receiver-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 5px;"></select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <!-- O QUE VOCÊ OFERECE -->
            <div style="background: #2b2b2b; padding: 12px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #1e90ff;">Você Oferece:</h4>
                <label style="font-size: 0.85rem; display: block;">Dinheiro ($):</label>
                <input type="number" id="trade-offer-money" value="0" min="0" max="${proposer.money}" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">
                
                <label style="font-size: 0.85rem; display: block;">Fichas Discretas (Máx: ${proposer.tokens.discreta}):</label>
                <input type="number" id="trade-offer-disc" value="0" min="0" max="${proposer.tokens.discreta}" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">
                
                <label style="font-size: 0.85rem; display: block;">Fichas Contínuas (Máx: ${proposer.tokens.continua}):</label>
                <input type="number" id="trade-offer-cont" value="0" min="0" max="${proposer.tokens.continua}" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">

                <label style="font-size: 0.85rem; display: block;">Propriedade:</label>
                <select id="trade-offer-prop" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></select>
            </div>

            <!-- O QUE VOCÊ PEDE -->
            <div style="background: #2b2b2b; padding: 12px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #ff4757;">Você Pede:</h4>
                <label style="font-size: 0.85rem; display: block;">Dinheiro ($):</label>
                <input type="number" id="trade-request-money" value="0" min="0" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">
                
                <label style="font-size: 0.85rem; display: block;">Fichas Discretas:</label>
                <input type="number" id="trade-request-disc" value="0" min="0" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">
                
                <label style="font-size: 0.85rem; display: block;">Fichas Contínuas:</label>
                <input type="number" id="trade-request-cont" value="0" min="0" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; margin-bottom: 8px; border-radius: 4px;">

                <label style="font-size: 0.85rem; display: block;">Propriedade:</label>
                <select id="trade-request-prop" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></select>
            </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="btn-trade-cancel" style="padding: 8px 18px; background: #c62828; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancelar</button>
            <button id="btn-trade-send" style="padding: 8px 18px; background: #2e7d32; color: white; border: none; border-radius: 5px; cursor: pointer;">Enviar Proposta</button>
        </div>
    `;

    overlay.appendChild(tradeBox);
    document.body.appendChild(overlay);

    const receiverSelect = document.getElementById("trade-receiver-select");
    const offerPropSelect = document.getElementById("trade-offer-prop");
    const requestPropSelect = document.getElementById("trade-request-prop");

    otherPlayers.forEach(p => {
        receiverSelect.innerHTML += `<option value="${p.id}">${p.name} ($${p.money})</option>`;
    });

    function updatePropertiesDropdowns() {
        const receiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === receiverId);
        if (!receiver) return;

        offerPropSelect.innerHTML = `<option value="">Nenhuma</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === proposer.id && (!space.houses || space.houses === 0)) {
                offerPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });

        requestPropSelect.innerHTML = `<option value="">Nenhuma</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === receiver.id && (!space.houses || space.houses === 0)) {
                requestPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });
    }

    receiverSelect.addEventListener("change", updatePropertiesDropdowns);
    updatePropertiesDropdowns();

    document.getElementById("btn-trade-cancel").addEventListener("click", () => document.body.removeChild(overlay));

    document.getElementById("btn-trade-send").addEventListener("click", () => {
        const receiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === receiverId);
        
        const offerMoney = Math.max(0, parseInt(document.getElementById("trade-offer-money").value) || 0);
        const offerDisc = Math.max(0, parseInt(document.getElementById("trade-offer-disc").value) || 0);
        const offerCont = Math.max(0, parseInt(document.getElementById("trade-offer-cont").value) || 0);
        const offerPropId = offerPropSelect.value !== "" ? parseInt(offerPropSelect.value) : null;

        const requestMoney = Math.max(0, parseInt(document.getElementById("trade-request-money").value) || 0);
        const requestDisc = Math.max(0, parseInt(document.getElementById("trade-request-disc").value) || 0);
        const requestCont = Math.max(0, parseInt(document.getElementById("trade-request-cont").value) || 0);
        const requestPropId = requestPropSelect.value !== "" ? parseInt(requestPropSelect.value) : null;

        const offerFee = Math.round(offerMoney * GAME_CONFIG.tradeFeePercent);
        const requestFee = Math.round(requestMoney * GAME_CONFIG.tradeFeePercent);

        // Validações
        if (offerMoney + offerFee > proposer.money) {
            alert(`Você não tem dinheiro suficiente para essa oferta + taxa ($${offerFee})!`);
            return;
        }
        if (offerDisc > proposer.tokens.discreta || offerCont > proposer.tokens.continua) {
            alert("Você não possui o número de fichas ofertado!");
            return;
        }
        if (requestMoney + requestFee > receiver.money) {
            alert("O outro jogador não possui dinheiro suficiente para cobrir o valor solicitado + taxa!");
            return;
        }
        if (requestDisc > receiver.tokens.discreta || requestCont > receiver.tokens.continua) {
            alert("O outro jogador não possui o número de fichas solicitado!");
            return;
        }

        document.body.removeChild(overlay);
        executeTradeProposalUI(proposer, receiver, {
            offerMoney, offerDisc, offerCont, offerPropId, offerFee,
            requestMoney, requestDisc, requestCont, requestPropId, requestFee
        });
    });
}

function executeTradeProposalUI(proposer, receiver, data) {
    const offerProp = data.offerPropId !== null ? boardSpaces.find(s => s.id === data.offerPropId) : null;
    const requestProp = data.requestPropId !== null ? boardSpaces.find(s => s.id === data.requestPropId) : null;

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #1e1e1e; padding: 12px; border-radius: 8px; border: 2px dashed #2e7d32;">
            🤝 <strong>Proposta de Negócio para ${receiver.name}!</strong><br><br>
            <strong>${proposer.name} oferece:</strong> $${data.offerMoney} ${data.offerFee > 0 ? `(Taxa: $${data.offerFee})` : ''}, ${data.offerDisc} F.Discreta, ${data.offerCont} F.Contínua, ${offerProp ? offerProp.name : 'Nenhuma Prop.'}<br>
            <strong>Em troca de:</strong> $${data.requestMoney} ${data.requestFee > 0 ? `(Taxa: $${data.requestFee})` : ''}, ${data.requestDisc} F.Discreta, ${data.requestCont} F.Contínua, ${requestProp ? requestProp.name : 'Nenhuma Prop.'}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-accept-trade" style="padding: 6px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Aceitar</button>
            <button id="btn-decline-trade" style="padding: 6px 15px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Recusar</button>
        </div>
    `;

    awaitingDecision = true;
    updateUI();

    document.getElementById("btn-accept-trade").addEventListener("click", () => {
        // Transfere dinheiro e aplica taxas
        proposer.money -= (data.offerMoney + data.offerFee);
        receiver.money += data.offerMoney;

        receiver.money -= (data.requestMoney + data.requestFee);
        proposer.money += data.requestMoney;

        // Transfere Fichas
        proposer.tokens.discreta = proposer.tokens.discreta - data.offerDisc + data.requestDisc;
        proposer.tokens.continua = proposer.tokens.continua - data.offerCont + data.requestCont;

        receiver.tokens.discreta = receiver.tokens.discreta - data.requestDisc + data.offerDisc;
        receiver.tokens.continua = receiver.tokens.continua - data.requestCont + data.offerCont;

        // Transfere Propriedades
        if (offerProp) {
            offerProp.owner = receiver.id;
            const spaceDiv = document.getElementById(`space-${offerProp.id}`);
            if (spaceDiv) spaceDiv.style.border = `3px dashed ${receiver.color}`;
        }
        if (requestProp) {
            requestProp.owner = proposer.id;
            const spaceDiv = document.getElementById(`space-${requestProp.id}`);
            if (spaceDiv) spaceDiv.style.border = `3px dashed ${proposer.color}`;
        }

        statusDiv.innerHTML = `<div style="color: #2ed573;">🤝 Troca concluída com sucesso! Fichas e recursos transferidos.</div>`;
        awaitingDecision = false;
        updateUI();
        setTimeout(() => { nextTurn(); }, 1500);
    });

    document.getElementById("btn-decline-trade").addEventListener("click", () => {
        statusDiv.innerHTML = `<div style="color: #ff4757;">❌ Troca recusada por ${receiver.name}.</div>`;
        awaitingDecision = false;
        updateUI();
        setTimeout(() => { nextTurn(); }, 1500);
    });
}

// Inicialização automática ao carregar a página
window.onload = () => {
    const rollBtn = document.getElementById("rollDice");
    if (rollBtn) rollBtn.addEventListener("click", rollDice);
    
    // Inicia o setup para criar a partida
    startPlayerSetup();
};
