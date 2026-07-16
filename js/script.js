// Lista oficial de todas as 40 casas do Banco Imobiliário clássico
const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, name: "Av. do Estado", type: "property", color: "cor-rosa", price: 100 },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Av. Novo Estado", type: "property", color: "cor-rosa", price: 100 },
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Estação Carioca", type: "station", price: 200 },
    { id: 6, name: "Av. Brigadeiro", type: "property", color: "cor-azul-claro", price: 120 },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Av. Rebouças", type: "property", color: "cor-azul-claro", price: 140 },
    { id: 9, name: "Av. 9 de Julho", type: "property", color: "cor-azul-claro", price: 140 },
    
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Av. Europa", type: "property", color: "cor-roxo", price: 160 },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150 },
    { id: 13, name: "Rua Augusta", type: "property", color: "cor-roxo", price: 160 },
    { id: 14, name: "Av. Pacaembu", type: "property", color: "cor-roxo", price: 180 },
    { id: 15, name: "Estação da Luz", type: "station", price: 200 },
    { id: 16, name: "Av. S. João", type: "property", color: "cor-laranja", price: 200 },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Av. Ipiranga", type: "property", color: "cor-laranja", price: 200 },
    { id: 19, name: "Av. Rio Branco", type: "property", color: "cor-laranja", price: 220 },
    
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Av. Paulista", type: "property", color: "cor-vermelho", price: 240 },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Av. Brasil", type: "property", color: "cor-vermelho", price: 240 },
    { id: 24, name: "Av. Brigadeiro", type: "property", color: "cor-vermelho", price: 260 },
    { id: 25, name: "Estação Barra Funda", type: "station", price: 200 },
    { id: 26, name: "Copacabana", type: "property", color: "cor-amarelo", price: 280 },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150 },
    { id: 28, name: "Av. Vieira Souto", type: "property", color: "cor-amarelo", price: 280 },
    { id: 29, name: "Ipanema", type: "property", color: "cor-amarelo", price: 300 },
    
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Jardim Europa", type: "property", color: "cor-verde", price: 320 },
    { id: 32, name: "Jardim América", type: "property", color: "cor-verde", price: 320 },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Av. Interlagos", type: "property", color: "cor-verde", price: 350 },
    { id: 35, name: "Estação Brás", type: "station", price: 200 },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    { id: 37, name: "Av. Morumbi", type: "property", color: "cor-azul-escuro", price: 400 },
    { id: 38, name: "Taxa de Luxo", type: "special" },
    { id: 39, name: "Av. Lineu de Paula", type: "property", color: "cor-azul-escuro", price: 400 }
];

// Dados dos Jogadores
let players = [
    { id: 0, name: "Jogador 1 (Azul)", money: 25000, position: 0, color: "#1e90ff" },
    { id: 1, name: "Jogador 2 (Vermelho)", money: 25000, position: 0, color: "#ff4757" }
];

let currentPlayerIndex = 0; // Começa com o Jogador 1 (índice 0)
let isMoving = false; // Bloqueia cliques repetidos enquanto o peão anda

// Função para calcular a posição visual de cada casa no Grid do tabuleiro (11x11)
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

// Renderiza o tabuleiro e cria os recipientes para os peões
function renderBoard() {
    const boardElement = document.getElementById("board");
    
    boardSpaces.forEach((space) => {
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space ${space.cssClass || ''}`;
        spaceDiv.id = `space-${space.id}`;
        
        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;
        
        if (space.type === "property") {
            const tag = document.createElement("div");
            tag.className = `property-tag ${space.color}`;
            spaceDiv.appendChild(tag);
        }
        
        const nameText = document.createElement("div");
        nameText.className = "space-name";
        nameText.innerText = space.name;
        spaceDiv.appendChild(nameText);
        
        if (space.price) {
            const priceText = document.createElement("div");
            priceText.innerText = `$${space.price}`;
            priceText.style.marginTop = "auto";
            spaceDiv.appendChild(priceText);
        }

        // Recipiente onde os peões ficarão dentro desta casa
        const tokensContainer = document.createElement("div");
        tokensContainer.className = "tokens-container";
        tokensContainer.id = `tokens-space-${space.id}`;
        spaceDiv.appendChild(tokensContainer);
        
        boardElement.appendChild(spaceDiv);
    });
}

// Coloca os peões na tela nas posições atuais dos jogadores
function renderPawns() {
    // Primeiro limpamos os peões de todas as casas
    document.querySelectorAll(".tokens-container").forEach(container => container.innerHTML = "");

    // Desenhamos o peão de cada jogador na sua respectiva casa
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

// Atualiza as informações do painel lateral (quem joga, saldos)
function updateUI() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";
    
    players.forEach((p, idx) => {
        const row = document.createElement("div");
        row.className = "player-row";
        if (idx === currentPlayerIndex) {
            row.style.fontWeight = "bold";
            row.style.backgroundColor = "rgba(255,255,255,0.1)";
            row.style.borderRadius = "5px";
        }
        row.style.borderLeft = `5px solid ${p.color}`;
        row.style.padding = "8px";
        row.innerHTML = `<span>${p.name} ${idx === currentPlayerIndex ? "👉" : ""}</span> <span>$${p.money}</span>`;
        playersList.appendChild(row);
    });
}

// Função para mover o peão passo a passo de forma animada
async function movePlayer(playerIndex, steps) {
    isMoving = true;
    let player = players[playerIndex];
    
    for (let i = 0; i < steps; i++) {
        // Incrementa a posição (se passar de 39, volta ao 0 e ganha bônus de partida)
        player.position = (player.position + 1) % 40;
        
        if (player.position === 0) {
            player.money += 2000; // Bônus clássico ao passar pela partida
            document.getElementById("game-status").innerText = `${player.name} passou pelo início e ganhou $2000!`;
            updateUI();
        }

        renderPawns();
        
        // Pequena pausa para dar o efeito de caminhada no tabuleiro
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    isMoving = false;
    handleLanding(player);
}

// Função executada quando o jogador cai em uma casa
function handleLanding(player) {
    const currentSpace = boardSpaces[player.position];
    let statusMsg = `${player.name} caiu em ${currentSpace.name}.`;

    if (currentSpace.type === "property") {
        statusMsg += ` Custa $${currentSpace.price}. (Compra automática será adicionada na próxima etapa!)`;
    }

    document.getElementById("game-status").innerText = statusMsg;

    // Passa a vez para o próximo jogador
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateUI();
}

// Ação de rolar o dado
function rollDice() {
    if (isMoving) return; // Evita rolar enquanto o peão se move

    const diceValue1 = Math.floor(Math.random() * 6) + 1;
    const diceValue2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = diceValue1 + diceValue2;

    document.getElementById("game-status").innerText = `🎲 ${players[currentPlayerIndex].name} tirou ${diceValue1} + ${diceValue2} = ${totalSteps}!`;

    movePlayer(currentPlayerIndex, totalSteps);
}

// Inicialização
window.onload = () => {
    renderBoard();
    renderPawns();
    updateUI();
    
    // Configura o evento do botão de rolar dados
    document.getElementById("rollDice").addEventListener("click", rollDice);
};












