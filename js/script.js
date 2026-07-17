// ==========================================
// CONFIGURAÇÕES GERAIS DO JOGO (Altere aqui facilmente no futuro!)
// ==========================================
const GAME_CONFIG = {
    startingMoney: 25000,       // Dinheiro inicial de cada jogador
    goBonus: 2000,              // Quanto ganha ao passar pela PARTIDA
    rentMultiplier: 1.0,        // Multiplicador global de aluguéis
    impostoRenda: 2000,         // Valor cobrado na casa Imposto de Renda
    taxaLuxo: 1000,             // Valor cobrado na casa Taxa de Luxo
    fiancaPrisao: 500           // Valor para pagar e sair da prisão
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

// Lista oficial de todas as 40 casas do Banco Imobiliário clássico
// Para alterar preços ou aluguéis no futuro, basta mexer aqui!
const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, name: "Av. do Estado", type: "property", color: "cor-rosa", price: 100, rent: 10, owner: null },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Av. Novo Estado", type: "property", color: "cor-rosa", price: 100, rent: 10, owner: null },
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Estação Carioca", type: "station", price: 200, rent: 20, owner: null },
    { id: 6, name: "Av. Brigadeiro", type: "property", color: "cor-azul-claro", price: 120, rent: 12, owner: null },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Av. Rebouças", type: "property", color: "cor-azul-claro", price: 140, rent: 14, owner: null },
    { id: 9, name: "Av. 9 de Julho", type: "property", color: "cor-azul-claro", price: 140, rent: 14, owner: null },
    
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Av. Europa", type: "property", color: "cor-roxo", price: 160, rent: 16, owner: null },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150, rent: 15, owner: null },
    { id: 13, name: "Rua Augusta", type: "property", color: "cor-roxo", price: 160, rent: 16, owner: null },
    { id: 14, name: "Av. Pacaembu", type: "property", color: "cor-roxo", price: 180, rent: 18, owner: null },
    { id: 15, name: "Estação da Luz", type: "station", price: 200, rent: 20, owner: null },
    { id: 16, name: "Av. S. João", type: "property", color: "cor-laranja", price: 200, rent: 20, owner: null },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Av. Ipiranga", type: "property", color: "cor-laranja", price: 200, rent: 20, owner: null },
    { id: 19, name: "Av. Rio Branco", type: "property", color: "cor-laranja", price: 220, rent: 22, owner: null },
    
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Av. Paulista", type: "property", color: "cor-vermelho", price: 240, rent: 24, owner: null },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Av. Brasil", type: "property", color: "cor-vermelho", price: 240, rent: 24, owner: null },
    { id: 24, name: "Av. Brigadeiro", type: "property", color: "cor-vermelho", price: 260, rent: 26, owner: null },
    { id: 25, name: "Estação Barra Funda", type: "station", price: 200, rent: 20, owner: null },
    { id: 26, name: "Copacabana", type: "property", color: "cor-amarelo", price: 280, rent: 28, owner: null },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150, rent: 15, owner: null },
    { id: 28, name: "Av. Vieira Souto", type: "property", color: "cor-amarelo", price: 280, rent: 28, owner: null },
    { id: 29, name: "Ipanema", type: "property", color: "cor-amarelo", price: 300, rent: 30, owner: null },
    
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Jardim Europa", type: "property", color: "cor-verde", price: 320, rent: 32, owner: null },
    { id: 32, name: "Jardim América", type: "property", color: "cor-verde", price: 320, rent: 32, owner: null },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Av. Interlagos", type: "property", color: "cor-verde", price: 350, rent: 35, owner: null },
    { id: 35, name: "Estação Brás", type: "station", price: 200, rent: 20, owner: null },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    { id: 37, name: "Av. Morumbi", type: "property", color: "cor-azul-escuro", price: 400, rent: 40, owner: null },
    { id: 38, name: "Taxa de Luxo", type: "special" },
    { id: 39, name: "Av. Lineu de Paula", type: "property", color: "cor-azul-escuro", price: 400, rent: 40, owner: null }
];

// Paleta de cores oficial para até 6 jogadores
const PLAYER_PRESETS = [
    { name: "Jogador 1 (Azul)", color: "#1e90ff" },
    { name: "Jogador 2 (Vermelho)", color: "#ff4757" },
    { name: "Jogador 3 (Verde)", color: "#2ed573" },
    { name: "Jogador 4 (Amarelo)", color: "#ffa502" },
    { name: "Jogador 5 (Roxo)", color: "#9b59b6" },
    { name: "Jogador 6 (Laranja)", color: "#e67e22" }
];

let players = []; // Começa vazio e será preenchido no setup

let currentPlayerIndex = 0; 
let isMoving = false; 
let awaitingDecision = false; // Bloqueia o dado enquanto o jogador decide uma compra

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
    
    // Evita duplicar elementos na reinicialização
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
            // Se tiver cor usa a classe de cor, senão usa cinza para estações/serviços
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
        if (idx === currentPlayerIndex) {
            row.style.fontWeight = "bold";
            row.style.backgroundColor = "rgba(255,255,255,0.15)";
            row.style.borderRadius = "5px";
        }
        row.style.borderLeft = `5px solid ${p.color}`;
        row.style.padding = "8px";
        row.innerHTML = `<span>${p.name} ${idx === currentPlayerIndex ? "👉" : ""}</span> <span>$${p.money}</span>`;
        playersList.appendChild(row);
    });

    // --- SISTEMA DE NEGOCIAÇÃO: Criação dinâmica do botão ---
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

    // Controla a ativação dos botões de dado e negociação
    if (isMoving || awaitingDecision || players[currentPlayerIndex]?.inJail) {
        if (rollButton) { rollButton.disabled = true; rollButton.style.opacity = "0.5"; rollButton.style.cursor = "not-allowed"; }
        if (tradeButton) { tradeButton.disabled = true; tradeButton.style.opacity = "0.5"; tradeButton.style.cursor = "not-allowed"; }
    } else {
        if (rollButton) { rollButton.disabled = false; rollButton.style.opacity = "1"; rollButton.style.cursor = "pointer"; }
        if (tradeButton) { tradeButton.disabled = false; tradeButton.style.opacity = "1"; tradeButton.style.cursor = "pointer"; }
    }
}

    // Controla a ativação do botão de dado
    const rollButton = document.getElementById("rollDice");
    if (isMoving || awaitingDecision) {
        rollButton.disabled = true;
        rollButton.style.opacity = "0.5";
        rollButton.style.cursor = "not-allowed";
    } else {
        rollButton.disabled = false;
        rollButton.style.opacity = "1";
        rollButton.style.cursor = "pointer";
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
            document.getElementById("game-status").innerText = `${player.name} passou pelo início e ganhou $${GAME_CONFIG.goBonus}!`;
            updateUI();
        }

        renderPawns();
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    isMoving = false;
    handleLanding(player);
}

// Lógica de Compra, Aluguel, Cartas e Casas Especiais .......................................................................................................................... Lógica de Compra, Aluguel, Cartas e Casas Especiais
function handleLanding(player) {
    const currentSpace = boardSpaces[player.position];
    const purchaseableTypes = ["property", "station", "utility"];

    if (purchaseableTypes.includes(currentSpace.type)) {
        if (currentSpace.owner === null) {
            awaitingDecision = true;
            updateUI();
            showPurchaseModal(player, currentSpace);
            return; 
        } else if (currentSpace.owner !== player.id) {
            payRent(player, currentSpace);
            return; 
       } else {
            // O dono da casa é o próprio jogador que caiu nela.
            // Se for do tipo 'property' e ele tiver o monopólio da cor, ele pode construir!
            if (currentSpace.type === "property" && hasMonopoly(player, currentSpace.color)) {
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
        // REGRA DA PRISÃO: Teleporta e prende o jogador
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
            <button id="btn-confirm-jail" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d;">Ok, continuar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-jail").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
        
    } else if (currentSpace.name === "Imposto de Renda") {
        // COBRANÇA: Imposto de Renda
        player.money -= GAME_CONFIG.impostoRenda;
        
        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                💸 <strong>Imposto de Renda!</strong><br>
                ${player.name} pagou <strong>$${GAME_CONFIG.impostoRenda}</strong> de impostos ao Leão!
            </div>
            <button id="btn-confirm-tax" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d;">Ok, pagar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-tax").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
    } else if (currentSpace.name === "Taxa de Luxo") {
        // COBRANÇA: Taxa de Luxo
        player.money -= GAME_CONFIG.taxaLuxo;
        
        const statusDiv = document.getElementById("game-status");
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                💎 <strong>Taxa de Luxo!</strong><br>
                ${player.name} pagou <strong>$${GAME_CONFIG.taxaLuxo}</strong> de taxa de luxo!
            </div>
            <button id="btn-confirm-luxury" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d;">Ok, pagar</button>
        `;
        
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-confirm-luxury").addEventListener("click", () => {
            awaitingDecision = false;
            nextTurn();
        });
        return;
    } else {
        // Outras casas sem ações financeiras automáticas (Partida, Prisão apenas visitando, Parada Livre)
        document.getElementById("game-status").innerText = `${player.name} caiu em ${currentSpace.name}.`;
    }

    nextTurn();
}
// Função para puxar e aplicar a carta
function drawCard(player) {
    // Sorteia uma carta aleatória do nosso baralho
    const randomIndex = Math.floor(Math.random() * CARDS.length);
    const card = CARDS[randomIndex];
    
    // Aplica o efeito no dinheiro do jogador
    if (card.type === "earn") {
        player.money += card.value;
    } else if (card.type === "pay") {
        player.money -= card.value;
    }

    // Mostra a carta na tela com um botão de OK
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #fff8e1; color: #333; padding: 10px; border-radius: 5px; border: 2px solid #ffb300;">
            🃏 <strong>Carta Sorte ou Revés</strong><br><br>
            <em>"${card.text}"</em>
        </div>
        <button id="btn-confirm-card" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d;">Ok, continuar</button>
    `;
    
    awaitingDecision = true; 
    updateUI();
    
    document.getElementById("btn-confirm-card").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

// Nova Função para processar o pagamento do aluguel ........................................................................................................................................................ Nova Função para processar o pagamento do aluguel
function payRent(player, space) {
    const owner = players.find(p => p.id === space.owner);
    
    // Calcula o aluguel usando o multiplicador global da nossa configuração de regras
    const rentAmount = calculateCurrentRent(space);
    
    // Transfere o dinheiro
    player.money -= rentAmount;
    owner.money += rentAmount;
    
    // Atualiza a tela de status com o valor pago e o botão para avançar
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #c62828;">
            💸 <strong>Pedágio!</strong><br>
            ${player.name} caiu em <strong>${space.name}</strong> e pagou <strong>$${rentAmount}</strong> de aluguel para ${owner.name}!
        </div>
        <button id="btn-confirm-rent" style="padding: 6px 15px; font-size: 0.9rem; background: #0d0d0d;">Ok, continuar</button>
    `;
    
    awaitingDecision = true; // Trava o dado enquanto o jogador lê o recibo do aluguel
    updateUI();
    
    // Quando clicar no botão "Ok, continuar", destrava o dado e passa a vez
    document.getElementById("btn-confirm-rent").addEventListener("click", () => {
        awaitingDecision = false;
        nextTurn();
    });
}

// Exibe as opções de compra na tela
function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            ${player.name} caiu em <strong>${space.name}</strong>!<br>
            Preço de compra: <strong>$${space.price}</strong>. Deseja comprar?
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-buy-yes" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32;">Sim, Comprar</button>
            <button id="btn-buy-no" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828;">Não, Passar Vez</button>
        </div>
    `;

    document.getElementById("btn-buy-yes").addEventListener("click", () => buyProperty(player, space));
    document.getElementById("btn-buy-no").addEventListener("click", () => skipProperty(player, space));
}

function buyProperty(player, space) {
    if (player.money >= space.price) {
        player.money -= space.price;
        space.owner = player.id;
        
        // Atualiza a cor visual da casa no tabuleiro para mostrar o dono
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
        return; // Não sai do estado de decisão se ele tentou comprar sem dinheiro
    }

    awaitingDecision = false;
    nextTurn();
}

function skipProperty(player, space) {
    document.getElementById("game-status").innerText = `${player.name} decidiu não comprar ${space.name}.`;
    awaitingDecision = false;
    nextTurn();
}

// FUNÇÃO TROCA DE TURNO ................................................................................................................................................................................................... FUNÇÃO TROCA DE TURNO 

function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    // Limpa o botão antigo do HTML para que ninguém possa clicar nele de novo!
    document.getElementById("game-status").innerHTML = `É a vez de <strong>${players[currentPlayerIndex].name}</strong> jogar!`;
    
    updateUI();
}

// Verifica se o jogador está preso e gerencia suas opções ................................................................................................................................................................. Verifica se o jogador está preso e gerencia suas opções
function checkJailTurn(player) {
    const statusDiv = document.getElementById("game-status");
    
    // Se ele já completou 3 turnos preso, é obrigado a pagar
    if (player.jailTurns >= 3) {
        player.money -= GAME_CONFIG.fiancaPrisao;
        player.inJail = false;
        player.jailTurns = 0;
        
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: #c62828;">
                🚨 <strong>Fim do Prazo!</strong><br>
                ${player.name} completou 3 turnos na prisão e foi obrigado a pagar a fiança de <strong>$${GAME_CONFIG.fiancaPrisao}</strong> para ser liberado!
            </div>
            <button id="btn-forced-jail-free" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32;">Rolar Dados</button>
        `;
        awaitingDecision = true;
        updateUI();
        
        document.getElementById("btn-forced-jail-free").addEventListener("click", () => {
            awaitingDecision = false;
            updateUI();
            // Permite rolar os dados normalmente agora que está livre
        });
        return true;
    }

    // Mostra as opções: Tentar dados duplos ou pagar fiança ............................................................................................................................................................... Mostra as opções: Tentar dados duplos ou pagar fiança
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #ffb300; background: #2e2e2e; padding: 10px; border-radius: 8px; border: 1px solid #ffb300;">
            ⛓️ <strong>${player.name} está na Prisão (Turno ${player.jailTurns + 1}/3)</strong><br>
            O que deseja fazer para sair?
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-jail-roll" style="padding: 6px 15px; font-size: 0.9rem; background: #2e2e2e; border: 1px solid #555;">Tentar Dados Duplos 🎲</button>
            <button id="btn-jail-pay" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32;">Pagar $${GAME_CONFIG.fiancaPrisao} 💸</button>
        </div>
    `;
    
    awaitingDecision = true;
    updateUI();

    // Opção 1: Tentar dados duplos
    document.getElementById("btn-jail-roll").addEventListener("click", () => {
        document.getElementById("btn-jail-roll").disabled = true;
        document.getElementById("btn-jail-pay").disabled = true;
        
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        if (d1 === d2) {
            // Sucesso!
            player.inJail = false;
            player.jailTurns = 0;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Você tirou dados duplos (${d1} e ${d2})! <strong>Você está LIVRE!</strong>`;
            
            // Move o jogador imediatamente com o valor tirado
            setTimeout(() => {
                movePlayer(currentPlayerIndex, d1 + d2);
            }, 1500);
        } else {
            // Falhou
            player.jailTurns += 1;
            awaitingDecision = false;
            statusDiv.innerHTML = `🎲 Você tirou ${d1} e ${d2} (Não foi duplo). Continua preso!`;
            
            setTimeout(() => {
                nextTurn();
            }, 2000);
        }
    });

    // Opção 2: Pagar fiança
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
            // Deixa o botão de jogar dados ativo para ele rodar neste turno ainda
        } else {
            alert("Você não tem dinheiro suficiente para pagar a fiança!");
            document.getElementById("btn-jail-roll").disabled = false;
            document.getElementById("btn-jail-pay").disabled = false;
        }
    });

    return true; // Bloqueou a rodada padrão
}

// Ação de rolar o dado ..................................................................................................................................................................................................... Ação de rolar o dado

function rollDice() {
    if (isMoving || awaitingDecision) return;

    const player = players[currentPlayerIndex];

    // Se o jogador está preso, interceptamos a rolagem normal
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

// Cria a tela de seleção de jogadores ao iniciar a página ................................................................................................................................................................. Cria a tela de seleção de jogadores ao iniciar a página
function startPlayerSetup() {
    // Cria um fundo escuro (overlay) para o setup
    const overlay = document.createElement("div");
    overlay.id = "setup-overlay";
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); display: flex; justify-content: center;
        align-items: center; z-index: 9999; font-family: 'Montserrat', sans-serif;
    `;

    // Cria a caixa de seleção de quantidade
    const setupBox = document.createElement("div");
    setupBox.style = `
        background: #1e1e1e; border: 3px solid #ff4757; border-radius: 12px;
        padding: 30px; text-align: center; color: white; max-width: 400px; width: 90%;
        box-shadow: 0px 10px 30px rgba(0,0,0,0.5);
    `;
    setupBox.innerHTML = `
        <h2 style="margin-top: 0; color: #ff4757; font-size: 1.8rem; margin-bottom: 20px;">BANCO IMOBILIÁRIO</h2>
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

    // Adiciona estilo básico para os botões do setup
    const style = document.createElement("style");
    style.innerHTML = `
        .setup-btn {
            background: #2e2e2e; color: white; border: 2px solid #555;
            padding: 12px 20px; font-size: 1.2rem; border-radius: 8px;
            cursor: pointer; transition: all 0.2s ease; font-weight: bold; width: 55px;
        }
        .setup-btn:hover {
            background: #ff4757; border-color: #ff4757; transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    // Escuta o clique nos botões de quantidade
    setupBox.querySelectorAll(".setup-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const qty = parseInt(e.target.getAttribute("data-qty"));
            initializePlayers(qty);
            document.body.removeChild(overlay); // Remove o menu de configuração
        });
    });
}

// Configura os jogadores selecionados e inicia a partida
function initializePlayers(quantity) {
    players = [];
    for (let i = 0; i < quantity; i++) {
        players.push({
            id: i,
            name: PLAYER_PRESETS[i].name,
            money: GAME_CONFIG.startingMoney,
            position: 0,
            color: PLAYER_PRESETS[i].color,
            inJail: false,       // Indica se o jogador está preso
            jailTurns: 0         // Conta há quantos turnos ele está preso
        });
    }
    
    // Adiciona automaticamente o campo 'houses' zerado para todas as propriedades
    boardSpaces.forEach(space => {
        if (space.type === "property") {
            space.houses = 0;
        }
    });
    
    renderBoard();
    renderPawns();
    updateUI();
}

// ==========================================
// SISTEMA DE MONOPÓLIO E CONSTRUÇÃO DE CASAS
// ==========================================

// Verifica se o jogador possui TODAS as propriedades de uma determinada cor ............................................................................................................................Verifica se o jogador possui TODAS as propriedades de uma determinada cor
function hasMonopoly(player, colorClass) {
    if (!colorClass) return false;
    
    // Filtra todas as propriedades do tabuleiro que têm essa cor
    const sameColorSpaces = boardSpaces.filter(space => space.color === colorClass);
    
    // Verifica se todas elas pertencem a este jogador
    return sameColorSpaces.every(space => space.owner === player.id);
}

// Calcula o aluguel final considerando Monopólio e Casas construídas
function calculateCurrentRent(space) {
    if (space.type !== "property") {
        return space.rent; // Estações e utilitários cobram aluguel base normal
    }

    const owner = players.find(p => p.id === space.owner);
    let finalRent = space.rent;

    // Se tem casas construídas, aplica o multiplicador de casas
    if (space.houses === 1) finalRent = space.rent * 5;
    else if (space.houses === 2) finalRent = space.rent * 15;
    else if (space.houses === 3) finalRent = space.rent * 40;
    else if (space.houses === 4) finalRent = space.rent * 80;
    else if (space.houses === 5) finalRent = space.rent * 120; // 5 casas = Hotel
    // Se não tem casas, mas o dono possui o monopólio da cor, o aluguel dobra!
    else if (hasMonopoly(owner, space.color)) {
        finalRent = space.rent * 2;
    }

    return Math.round(finalRent * GAME_CONFIG.rentMultiplier);
}

// Exibe o painel de compra de casas.................................................................................................................................................................Exibe o painel de compra de casas
function showBuildModal(player, space) {
    const housePrice = Math.round(space.price / 2);
    const isHotel = space.houses === 4;
    const itemText = isHotel ? "um Hotel" : "uma Casa";
    
    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            🏰 <strong>Monopólio!</strong> Você caiu em <strong>${space.name}</strong> (${space.houses} casa(s)).<br>
            Deseja construir ${itemText} por <strong>$${housePrice}</strong>?<br>
            <small>Aluguel atual: $${calculateCurrentRent(space)} | Próximo aluguel: $${calculateUpcomingRent(space)}</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-build-yes" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32;">Sim, Construir</button>
            <button id="btn-build-no" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828;">Não, Passar Vez</button>
        </div>
    `;

    const btnYes = document.getElementById("btn-build-yes");
    const btnNo = document.getElementById("btn-build-no");

    btnYes.addEventListener("click", () => {
        btnYes.disabled = true;
        btnNo.disabled = true;
        
        if (player.money >= housePrice) {
            player.money -= housePrice;
            space.houses += 1;
            
            // Atualiza o visual da casa no tabuleiro
            updateSpaceVisualWithHouses(space);
            
            document.getElementById("game-status").innerText = `${player.name} construiu ${itemText} em ${space.name}!`;
            awaitingDecision = false;
            updateUI();
            
            setTimeout(() => { nextTurn(); }, 1500);
        } else {
            alert("Dinheiro insuficiente para construir!");
            btnYes.disabled = false;
            btnNo.disabled = false;
        }
    });

    btnNo.addEventListener("click", () => {
        btnYes.disabled = true;
        btnNo.disabled = true;
        awaitingDecision = false;
        nextTurn();
    });
}

// Calcula o aluguel futuro caso compre mais uma casa (para exibir no painel)
function calculateUpcomingRent(space) {
    const tempSpace = { ...space, houses: space.houses + 1 };
    return calculateCurrentRent(tempSpace);
}

// Adiciona pequenos ícones visuais verdes (casas) ou vermelhos (hotéis) na tag de cor da propriedade!
function updateSpaceVisualWithHouses(space) {
    const tag = document.getElementById(`tag-${space.id}`);
    if (!tag) return;

    // Limpa os ícones anteriores
    tag.innerHTML = "";
    tag.style.display = "flex";
    tag.style.justifyContent = "center";
    tag.style.alignItems = "center";
    tag.style.gap = "2px";

    if (space.houses === 5) {
        // Desenha um Hotel vermelho grande
        tag.innerHTML = `<span style="color: #ff4757; font-size: 14px; font-weight: bold; text-shadow: 1px 1px 1px black;">🏨</span>`;
    } else {
        // Desenha mini casinhas verdes conforme a quantidade
        let houseIcons = "";
        for (let i = 0; i < space.houses; i++) {
            houseIcons += `<span style="color: #2ed573; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 1px black;">🏠</span>`;
        }
        tag.innerHTML = houseIcons;
    }
}

// ==========================================
// SISTEMA COMPLETO DE COMPRA E VENDA (TROCAS)
// ==========================================

function openTradeModal() {
    const proposer = players[currentPlayerIndex];
    
    // Filtra os possíveis parceiros de negócio (outros jogadores)
    const otherPlayers = players.filter(p => p.id !== proposer.id);
    if (otherPlayers.length === 0) return;

    // Cria a tela (overlay) de negociação
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
        padding: 25px; color: white; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto;
    `;

    // Renderiza a estrutura da proposta
    tradeBox.innerHTML = `
        <h3 style="margin-top: 0; color: #2e7d32; text-align: center; font-size: 1.6rem; margin-bottom: 15px;">🤝 Proposta de Negócio</h3>
        
        <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Negociar com:</label>
            <select id="trade-receiver-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 5px; font-size: 1rem;"></select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <!-- O QUE VOCÊ OFERECE -->
            <div style="background: #2b2b2b; padding: 15px; border-radius: 8px; border: 1px solid #444;">
                <h4 style="margin: 0 0 10px 0; color: #1e90ff;">Você Oferece:</h4>
                <label style="font-size: 0.9rem;">Dinheiro ($):</label>
                <input type="number" id="trade-offer-money" value="0" min="0" max="${proposer.money}" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                
                <label style="font-size: 0.9rem; display: block; margin-bottom: 5px;">Propriedade:</label>
                <select id="trade-offer-prop" style="width: 100%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></select>
            </div>

            <!-- O QUE VOCÊ PEDE -->
            <div style="background: #2b2b2b; padding: 15px; border-radius: 8px; border: 1px solid #444;">
                <h4 style="margin: 0 0 10px 0; color: #ff4757;">Você Pede:</h4>
                <label style="font-size: 0.9rem;">Dinheiro ($):</label>
                <input type="number" id="trade-request-money" value="0" min="0" style="width: 90%; padding: 6px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;">
                
                <label style="font-size: 0.9rem; display: block; margin-bottom: 5px;">Propriedade:</label>
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

    // Preenche a lista de parceiros
    otherPlayers.forEach(p => {
        receiverSelect.innerHTML += `<option value="${p.id}">${p.name} (Saldo: $${p.money})</option>`;
    });

    // Função para carregar as propriedades nos selects
    function updatePropertiesDropdowns() {
        const selectedReceiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === selectedReceiverId);

        // Suas propriedades livres de casas para oferecer
        offerPropSelect.innerHTML = `<option value="">Nenhuma propriedade</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === proposer.id) {
                // REGRA: Propriedades com casas não podem ser trocadas diretamente para evitar bugs visuais
                if (space.houses && space.houses > 0) return;
                offerPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });

        // Propriedades do alvo livres de casas para pedir
        requestPropSelect.innerHTML = `<option value="">Nenhuma propriedade</option>`;
        boardSpaces.forEach(space => {
            if (space.owner === receiver.id) {
                if (space.houses && space.houses > 0) return;
                requestPropSelect.innerHTML += `<option value="${space.id}">${space.name}</option>`;
            }
        });
    }

    // Recarrega os dropdowns sempre que mudar o jogador parceiro
    receiverSelect.addEventListener("change", updatePropertiesDropdowns);
    updatePropertiesDropdowns(); // Executa a primeira vez

    // Cancelar a negociação
    document.getElementById("btn-trade-cancel").addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    // Enviar Proposta
    document.getElementById("btn-trade-send").addEventListener("click", () => {
        const receiverId = parseInt(receiverSelect.value);
        const receiver = players.find(p => p.id === receiverId);
        
        const offerMoney = parseInt(document.getElementById("trade-offer-money").value) || 0;
        const requestMoney = parseInt(document.getElementById("trade-request-money").value) || 0;
        
        const offerPropId = offerPropSelect.value !== "" ? parseInt(offerPropSelect.value) : null;
        const requestPropId = requestPropSelect.value !== "" ? parseInt(requestPropSelect.value) : null;

        // VALIDAÇÃO DE SALDO DO PROPONENTE
        if (offerMoney > proposer.money) {
            alert("Você não tem essa quantia de dinheiro para oferecer!");
            return;
        }
        if (requestMoney > receiver.money) {
            alert("O outro jogador não possui essa quantia de dinheiro para lhe dar!");
            return;
        }
        if (offerMoney === 0 && requestMoney === 0 && offerPropId === null && requestPropId === null) {
            alert("Uma proposta precisa conter pelo menos dinheiro ou uma propriedade!");
            return;
        }

        document.body.removeChild(overlay);
        sendTradeProposalToUI(proposer, receiver, offerMoney, offerPropId, requestMoney, requestPropId);
    });
}

// Envia a proposta para a tela (painel central) para que o destinatário decida
function sendTradeProposalToUI(proposer, receiver, offerMoney, offerPropId, requestMoney, requestPropId) {
    const offerProp = offerPropId !== null ? boardSpaces.find(s => s.id === offerPropId) : null;
    const requestProp = requestPropId !== null ? boardSpaces.find(s => s.id === requestPropId) : null;

    let offerDetails = [];
    if (offerMoney > 0) offerDetails.push(`<strong>$${offerMoney}</strong>`);
    if (offerProp) offerDetails.push(`<strong>${offerProp.name}</strong>`);
    if (offerDetails.length === 0) offerDetails.push("Nada");

    let requestDetails = [];
    if (requestMoney > 0) requestDetails.push(`<strong>$${requestMoney}</strong>`);
    if (requestProp) requestDetails.push(`<strong>${requestProp.name}</strong>`);
    if (requestDetails.length === 0) requestDetails.push("Nada");

    const statusDiv = document.getElementById("game-status");
    statusDiv.innerHTML = `
        <div style="margin-bottom: 15px; background: #1e1e1e; color: white; padding: 15px; border-radius: 8px; border: 2px dashed #2e7d32;">
            🤝 <strong>Proposta de Negócio para ${receiver.name}!</strong><br><br>
            ${proposer.name} oferece:<br>
            👉 ${offerDetails.join(" + ")}<br><br>
            Em troca de:<br>
            👉 ${requestDetails.join(" + ")}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-accept-trade" style="padding: 6px 15px; font-size: 0.9rem; background: #2e7d32;">Aceitar Negócio</button>
            <button id="btn-decline-trade" style="padding: 6px 15px; font-size: 0.9rem; background: #c62828;">Recusar</button>
        </div>
    `;

    awaitingDecision = true;
    updateUI();

    const acceptBtn = document.getElementById("btn-accept-trade");
    const declineBtn = document.getElementById("btn-decline-trade");

    // Aceitar a troca!
    acceptBtn.addEventListener("click", () => {
        acceptBtn.disabled = true;
        declineBtn.disabled = true;

        // Executa as transações financeiras
        proposer.money -= offerMoney;
        proposer.money += requestMoney;
        receiver.money += offerMoney;
        receiver.money -= requestMoney;

        // Transfere as propriedades
        if (offerProp) {
            offerProp.owner = receiver.id;
            updateTradeVisualProperty(offerProp, receiver);
        }
        if (requestProp) {
            requestProp.owner = proposer.id;
            updateTradeVisualProperty(requestProp, proposer);
        }

        statusDiv.innerHTML = `<div style="color: #2ed573; font-weight: bold;">🤝 Negócio Fechado com Sucesso!</div>`;
        awaitingDecision = false;
        updateUI();

        setTimeout(() => {
            // Mantém a vez com o proponente para ele poder rolar o seu dado após negociar!
            statusDiv.innerHTML = `É a vez de <strong>${proposer.name}</strong> jogar!`;
            updateUI();
        }, 2000);
    });

    // Recusar a troca
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

// Atualiza as cores e bordas das propriedades negociadas no tabuleiro
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

// Inicialização......................................................................................................................................................................................Inicialização
window.onload = () => {
    startPlayerSetup();
    document.getElementById("rollDice").addEventListener("click", rollDice);
};

