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
    taxaTroca: 200,
    taxaTrocaPercent: 0.10,
    fichasPorVisita: 2,
    pawnMoveStepDelay: 250,      // 200ms originais / 0.8 = 80% da velocidade
    diceRollAnimationDuration: 750,
    cardFichaPenalty: 500
};

const PRESETS = {
    standard: { name: "Padrão", startingMoney: 25000, goBonus: 2000, taxaTroca: 200 },
    fast: { name: "Jogo Rápido", startingMoney: 40000, goBonus: 1000, taxaTroca: 100 },
    hardcore: { name: "Escassez", startingMoney: 15000, goBonus: 3000, taxaTroca: 500 }
};

// Baralho de "Sorte ou Revés": Cartas Objetivas (múltipla escolha, resposta correta
// conhecida) e Cartas de Investigação (dissertativas, sem resposta oficial — o grupo
// decide informalmente se a argumentação foi aceita). Ver js/cards.js para o fluxo.
const CARDS = [
    { id: 1, type: "objetiva", text: "Quando dizemos que uma grandeza depende de outra, significa que:", options: { A: "As duas sempre possuem o mesmo valor.", B: "A mudança em uma pode influenciar a outra.", C: "Elas nunca mudam.", D: "As duas precisam ser medidas da mesma forma." }, answer: "B" },
    { id: 2, type: "objetiva", text: "Qual das situações representa uma grandeza contínua?", options: { A: "Número de alunos.", B: "Quantidade de carros.", C: "Temperatura ambiente.", D: "Número de livros." }, answer: "C" },
    { id: 3, type: "objetiva", text: "Qual das situações representa uma grandeza discreta?", options: { A: "Massa corporal.", B: "Distância percorrida.", C: "Número de árvores.", D: "Tempo de viagem." }, answer: "C" },
    { id: 4, type: "objetiva", text: "Antes de estudar uma relação entre grandezas, o pesquisador escolhe observar apenas alguns aspectos do fenômeno. Esse processo recebe o nome de:", options: { A: "Campo de variação.", B: "Isolado.", C: "Imagem.", D: "Contradomínio." }, answer: "B" },
    { id: 5, type: "objetiva", text: "Uma variável independente é aquela que:", options: { A: "Sempre possui maior valor.", B: "Não sofre nenhuma alteração.", C: "É escolhida para explicar ou investigar a variação de outra.", D: "Depende da variável dependente." }, answer: "C" },
    { id: 6, type: "objetiva", text: "Qual alternativa melhor representa uma relação funcional?", options: { A: "Cada pessoa possui exatamente uma data de nascimento.", B: "Cada pessoa possui vários amigos.", C: "Cada aluno possui vários professores.", D: "Cada cidade possui vários habitantes." }, answer: "A" },
    { id: 7, type: "objetiva", text: "O domínio de uma função representa:", options: { A: "Apenas os valores realmente obtidos.", B: "Os valores que a variável de entrada pode assumir.", C: "Os maiores valores encontrados.", D: "Apenas os valores positivos." }, answer: "B" },
    { id: 8, type: "objetiva", text: "A imagem corresponde:", options: { A: "A todos os valores possíveis.", B: "Aos valores efetivamente produzidos pela função.", C: "Ao conjunto de entrada.", D: "À lei de formação." }, answer: "B" },
    { id: 9, type: "objetiva", text: "Quando encontramos uma regularidade em uma tabela de valores, normalmente estamos nos aproximando da construção de:", options: { A: "Um contradomínio.", B: "Uma lei de formação.", C: "Um domínio.", D: "Um isolado." }, answer: "B" },
    { id: 10, type: "objetiva", text: "O principal objetivo de identificar variáveis em um fenômeno é:", options: { A: "Tornar os cálculos mais difíceis.", B: "Organizar a investigação das relações existentes.", C: "Aumentar a quantidade de dados.", D: "Eliminar a necessidade de observar o fenômeno." }, answer: "B" },
    { id: 11, type: "dissertativa", text: "Você acredita que toda relação de dependência pode ser representada por uma função? Explique sua posição." },
    { id: 12, type: "dissertativa", text: "Imagine que dois pesquisadores estão estudando exatamente o mesmo fenômeno, mas escolhem variáveis diferentes. Eles estão investigando o mesmo problema? Justifique." },
    { id: 13, type: "dissertativa", text: "Em uma investigação, por que pode ser importante ignorar algumas características do fenômeno e concentrar-se apenas em duas grandezas?" },
    { id: 14, type: "dissertativa", text: "Pense em uma situação do cotidiano em que uma grandeza depende claramente de outra. Explique como você identificou essa dependência." },
    { id: 15, type: "dissertativa", text: "Você considera que um mesmo fenômeno pode gerar diferentes funções? Explique seu raciocínio." },
    { id: 16, type: "dissertativa", text: "Às vezes um pesquisador encontra dados que não seguem o padrão esperado. Na sua opinião, isso significa necessariamente que a investigação está errada? Justifique." },
    { id: 17, type: "dissertativa", text: "Dois pesquisadores discordam sobre quais variáveis devem ser investigadas primeiro. Como eles poderiam decidir qual caminho seguir?" },
    { id: 18, type: "dissertativa", text: "Em alguns fenômenos existem dezenas de fatores envolvidos. Como decidir quais são realmente importantes para uma investigação?" },
    { id: 19, type: "dissertativa", text: "Uma tabela pode mostrar que duas grandezas variam juntas. Isso é suficiente para afirmar que uma depende da outra? Explique." },
    { id: 20, type: "dissertativa", text: "Durante uma investigação científica, é comum que pesquisadores mudem suas hipóteses conforme novos dados aparecem. Na sua opinião, por que isso faz parte do trabalho científico?" }
];

const boardSpaces = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, name: "Lado do Quadrado", type: "property", color: "cor-marrom", price: 60, rent: 2, owner: null, grandezaType: "continua" },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Área", type: "property", color: "cor-marrom", price: 60, rent: 4, owner: null, grandezaType: "continua" },
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Observatório Ambiental", type: "station", price: 200, rent: 20, owner: null, fichaType: "continua", color: "cor-observatorio" },
    { id: 6, name: "Distância Percorrida", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Velocidade", type: "property", color: "cor-azul-claro", price: 100, rent: 6, owner: null, grandezaType: "continua" },
    { id: 9, name: "Tempo de Deslocamento", type: "property", color: "cor-azul-claro", price: 120, rent: 8, owner: null, grandezaType: "continua" },
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Temperatura", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150, rent: 15, owner: null },
    { id: 13, name: "Umidade do Ar", type: "property", color: "cor-rosa", price: 140, rent: 10, owner: null, grandezaType: "continua" },
    { id: 14, name: "Pressão Atmosférica", type: "property", color: "cor-rosa", price: 160, rent: 12, owner: null, grandezaType: "continua" },
    { id: 15, name: "Laboratório Experimental", type: "station", price: 200, rent: 20, owner: null, fichaType: "continua", color: "cor-observatorio" },
    { id: 16, name: "Produção", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Demanda", type: "property", color: "cor-laranja", price: 180, rent: 14, owner: null, grandezaType: "discreta" },
    { id: 19, name: "Preço", type: "property", color: "cor-laranja", price: 200, rent: 16, owner: null, grandezaType: "continua" },
    { id: 20, name: "PARADA LIVRE", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Consumo Elétrico", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Potência", type: "property", color: "cor-vermelho", price: 220, rent: 18, owner: null, grandezaType: "continua" },
    { id: 24, name: "Tempo de Uso", type: "property", color: "cor-vermelho", price: 240, rent: 20, owner: null, grandezaType: "continua" },
    { id: 25, name: "Centro Estatístico", type: "station", price: 200, rent: 20, owner: null, fichaType: "discreta", color: "cor-observatorio" },
    { id: 26, name: "Horas de Estudo", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "continua" },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150, rent: 15, owner: null },
    { id: 28, name: "Número de Exercícios", type: "property", color: "cor-amarelo", price: 260, rent: 22, owner: null, grandezaType: "discreta" },
    { id: 29, name: "Desempenho", type: "property", color: "cor-amarelo", price: 280, rent: 24, owner: null, grandezaType: "continua" },
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Número de Indivíduos", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "discreta" },
    { id: 32, name: "Taxa de Natalidade", type: "property", color: "cor-verde", price: 300, rent: 26, owner: null, grandezaType: "continua" },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Taxa de Mortalidade", type: "property", color: "cor-verde", price: 320, rent: 28, owner: null, grandezaType: "continua" },
    { id: 35, name: "Instituto Demográfico", type: "station", price: 200, rent: 20, owner: null, fichaType: "discreta", color: "cor-observatorio" },
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
    pendingTrade = null;
    closeTradeModal();
    pendingCard = null;
    closeCardModal();
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

async function executeRollDice() {
    const player = players[currentPlayerIndex];
    if (!player || player.isBankrupt) return;

    isMoving = true;
    updateUI();

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
            isMoving = false;
            syncGameState(msg);
            nextTurn();
            return;
        }
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const diceText = `🎲 ${d1} + ${d2} = ${total}`;

    animateDiceCubes(d1, d2);
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.diceRollAnimationDuration));

    const diceDisplay = document.getElementById("dice-display");
    if (diceDisplay) diceDisplay.innerText = diceText;
    popDiceDisplay();

    const statusMsg = `${player.name} tirou ${d1} e ${d2} (${total}). Avance ${total} casas!`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = statusMsg;

    syncGameState(statusMsg, diceText, { d1, d2 });
    movePlayer(currentPlayerIndex, total);
}

// ==========================================
// ANIMAÇÃO VISUAL DOS DADOS (CUBOS 3D EM CSS)
// ==========================================
// Ângulos (em múltiplos de 90°, sempre positivos) que trazem cada face para frente,
// respeitando a convenção padrão de dado (faces opostas somam 7).
const DIE_FACE_ANGLES = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 270 },
    3: { x: 270, y: 0 },
    4: { x: 90, y: 0 },
    5: { x: 0, y: 90 },
    6: { x: 0, y: 180 }
};

const diceCubeState = {
    die1: { x: 0, y: 0 },
    die2: { x: 0, y: 0 }
};

// Calcula o próximo ângulo (sempre girando para frente, nunca "desgirando") que termina
// exatamente no ângulo alvo, somando voltas extras completas para dar efeito de rolagem.
function nextDieRotation(currentAngle, targetMod) {
    const currentMod = ((currentAngle % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;
    const extraSpins = (2 + Math.floor(Math.random() * 2)) * 360;
    return currentAngle + delta + extraSpins;
}

function rollDieCube(dieEl, stateObj, value) {
    const target = DIE_FACE_ANGLES[value];
    stateObj.x = nextDieRotation(stateObj.x, target.x);
    stateObj.y = nextDieRotation(stateObj.y, target.y);
    if (dieEl) {
        dieEl.style.transitionDuration = `${GAME_CONFIG.diceRollAnimationDuration}ms`;
        dieEl.style.transform = `rotateX(${stateObj.x}deg) rotateY(${stateObj.y}deg)`;
    }
}

function animateDiceCubes(d1, d2) {
    rollDieCube(document.getElementById("die-1"), diceCubeState.die1, d1);
    rollDieCube(document.getElementById("die-2"), diceCubeState.die2, d2);
}

function popDiceDisplay() {
    const diceDisplay = document.getElementById("dice-display");
    if (!diceDisplay) return;
    diceDisplay.classList.remove("dice-pop");
    void diceDisplay.offsetWidth;
    diceDisplay.classList.add("dice-pop");
}

async function movePlayer(playerIndex, steps) {
    isMoving = true;
    updateUI();
    let player = players[playerIndex];

    for (let i = 0; i < steps; i++) {
        player.position = (player.position + 1) % 40;
        if (player.position === 0) {
            player.money -= GAME_CONFIG.goBonus;
            const statusMsg = `💸 ${player.name} passou pela PARTIDA e pagou $${GAME_CONFIG.goBonus}!`;
            const statusLabel = document.getElementById("game-status");
            if (statusLabel) statusLabel.innerText = statusMsg;
            syncGameState(statusMsg);
            updateUI();
        }
        renderPawns();
        syncGameState();
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.pawnMoveStepDelay));
    }

    isMoving = false;
    handleLanding(player);
}

function handleLanding(player) {
    const space = boardSpaces[player.position];
    const purchaseableTypes = ["property", "station", "utility"];

    if (purchaseableTypes.includes(space.type)) {
        if (space.fichaType) {
            grantFicha(player, space);
        }

        if (space.owner === null) {
            awaitingDecision = true;
            updateUI();
            showPurchaseModal(player, space);
            return;
        } else if (space.owner !== player.id) {
            if (space.fichaType) {
                payRentWithFichaMessage(player, space);
            } else {
                payRent(player, space);
            }
            return;
        } else {
            let msg = `${player.name} caiu na sua própria propriedade: ${space.name}.`;
            if (space.fichaType) {
                msg += ` ${player.name} recebeu ${GAME_CONFIG.fichasPorVisita} Fichas de Grandeza ${fichaTypeLabel(space.fichaType)}.`;
            }
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

// ==========================================
// FICHAS DE INVESTIGAÇÃO (CENTROS DE OBSERVAÇÃO)
// ==========================================
function fichaTypeLabel(fichaType) {
    return fichaType === "continua" ? "Contínua" : "Discreta";
}

function grantFicha(player, space) {
    if (!space.fichaType) return;
    const amount = GAME_CONFIG.fichasPorVisita;
    if (space.fichaType === "continua") {
        player.fichasContinua = (player.fichasContinua || 0) + amount;
    } else {
        player.fichasDiscreta = (player.fichasDiscreta || 0) + amount;
    }
}

function payRentWithFichaMessage(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = space.rent || 10;

    player.money -= rentAmount;
    if (owner) owner.money += rentAmount;

    if (player.money < 0) {
        checkBankruptcy(player, owner ? owner.id : null);
        return;
    }

    const msg = `🔬 ${player.name} pagou $${rentAmount} de taxa de utilização para ${owner ? owner.name : "o Banco"} em ${space.name} e recebeu ${GAME_CONFIG.fichasPorVisita} Fichas de Grandeza ${fichaTypeLabel(space.fichaType)}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    nextTurn();
}

function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    const fichaNote = space.fichaType ? ` ${player.name} já recebeu ${GAME_CONFIG.fichasPorVisita} Fichas de Grandeza ${fichaTypeLabel(space.fichaType)} por parar aqui.` : "";
    syncGameState(`Aguardando decisão de ${player.name} sobre ${space.name}...${fichaNote}`);
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const icon = space.fichaType ? "🔬" : "🏠";

    if (!isMultiplayer || player.peerId === myPeerId) {
        showPurchaseModalUI(player, space);
    } else {
        statusDiv.innerText = `${icon} ${space.name} ($${space.price}) disponível! Aguardando ${player.name}...${fichaNote}`;
    }
}

function showPurchaseModalUI(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    const icon = space.fichaType ? "🔬" : "🏠";
    const fichaNote = space.fichaType
        ? `<div style="margin-bottom: 10px; font-size: 0.8rem; color: #0891b2;">Você recebeu ${GAME_CONFIG.fichasPorVisita} Fichas de Grandeza ${fichaTypeLabel(space.fichaType)} por parar aqui.</div>`
        : "";
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #1a293d; padding: 10px; border-radius: 6px;">
            ${icon} <strong>${space.name}</strong> disponível por <strong>$${space.price}</strong>.
        </div>
        ${fichaNote}
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

// drawCard(player) e todo o fluxo das Cartas Objetivas/de Investigação estão em js/cards.js

function checkBankruptcy(player, creditorId) {
    if (player.money < 0) {
        player.isBankrupt = true;
        boardSpaces.forEach(s => { if (s.owner === player.id) s.owner = creditorId; });
        refreshBoardOwnership();
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
        refreshBoardOwnership();
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
function syncGameState(statusMessage = null, diceDisplay = null, diceValues = null) {
    if (!isMultiplayer || !window.Network || !window.Network.isHost) return;

    sendNetworkAction("SYNC_GAME_STATE", {
        players: players,
        boardSpaces: boardSpaces.map(s => ({ id: s.id, owner: s.owner, houses: s.houses || 0 })),
        currentPlayerIndex: currentPlayerIndex,
        isMoving: isMoving,
        awaitingDecision: awaitingDecision,
        pendingTrade: pendingTrade,
        pendingCard: pendingCard,
        statusMessage: statusMessage || (document.getElementById("game-status") ? document.getElementById("game-status").innerText : ""),
        diceDisplay: diceDisplay || (document.getElementById("dice-display") ? document.getElementById("dice-display").innerText : ""),
        diceValues: diceValues
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
    if (payload.pendingTrade !== undefined) pendingTrade = payload.pendingTrade;
    if (payload.pendingCard !== undefined) pendingCard = payload.pendingCard;

    refreshBoardOwnership();

    if (payload.diceValues) {
        animateDiceCubes(payload.diceValues.d1, payload.diceValues.d2);
    }

    if (payload.diceDisplay) {
        const diceDisplayEl = document.getElementById("dice-display");
        if (diceDisplayEl && diceDisplayEl.innerText !== payload.diceDisplay) {
            diceDisplayEl.innerText = payload.diceDisplay;
            popDiceDisplay();
        }
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

    refreshTradeUI();
    refreshCardUI();
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
        isBankrupt: false,
        fichasDiscreta: 0,
        fichasContinua: 0
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
