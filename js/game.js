/**
 * game.js
 * Fluxo da partida (Host-Authoritative): turnos, movimentação, casas,
 * intervenções, Cartas de Fluência, fechamento anual e sincronização.
 *
 * Responsabilidades:
 * - O Host executa regras, movimenta peças, altera dinheiro/propriedades e transmite o estado.
 * - O Cliente envia intenções/pedidos e apenas aplica o estado recebido do Host.
 *
 * Configurações e regras puras (fatores, custos, taxas, cartas, fórmulas) ficam em js/rules.js.
 */

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

const boardSpaces = createBoardSpaces();

const PLAYER_PRESETS = [
    { name: "Jogador 1 (Azul)", color: "#1e90ff" },
    { name: "Jogador 2 (Vermelho)", color: "#ff4757" },
    { name: "Jogador 3 (Verde)", color: "#2ed573" },
    { name: "Jogador 4 (Amarelo)", color: "#ffa502" }
];

let players = [];
let currentPlayerIndex = 0;
let isMoving = false;
let awaitingDecision = false;
let isMultiplayer = false;
let gameOver = false;

// Estado único e compartilhado do restaurante (níveis internos + mercado externo).
let marketState = getInitialMarketState();
let recentChanges = [];
let yearNumber = 1;
let cycleNumber = 0;

function updateStatus(msg) {
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
}

function getRulesContext() {
    const currentPlayer = players[currentPlayerIndex];
    return {
        market: marketState,
        players,
        boardSpaces,
        currentPlayerId: currentPlayer ? currentPlayer.id : null,
        turnLocked: isMoving || awaitingDecision || !!pendingTrade || !!pendingCard || gameOver
    };
}

function getGridPosition(index) {
    const ring = {
        0: { row: 1, col: 1 },
        1: { row: 1, col: 2 },
        2: { row: 1, col: 3 },
        3: { row: 1, col: 4 },
        4: { row: 1, col: 5 },
        5: { row: 1, col: 6 },
        6: { row: 1, col: 7 },
        7: { row: 2, col: 7 },
        8: { row: 3, col: 7 },
        9: { row: 4, col: 7 },
        10: { row: 5, col: 7 },
        11: { row: 6, col: 7 },
        12: { row: 7, col: 7 },
        13: { row: 7, col: 6 },
        14: { row: 7, col: 5 },
        15: { row: 7, col: 4 },
        16: { row: 7, col: 3 },
        17: { row: 7, col: 2 },
        18: { row: 7, col: 1 },
        19: { row: 6, col: 1 },
        20: { row: 5, col: 1 },
        21: { row: 4, col: 1 },
        22: { row: 3, col: 1 },
        23: { row: 2, col: 1 }
    };
    return ring[index] || { row: 4, col: 4 };
}

function initializePlayers(count = 2) {
    isMultiplayer = false;
    players = [];
    for (let i = 0; i < count; i++) {
        const preset = PLAYER_PRESETS[i % PLAYER_PRESETS.length];
        players.push(createPlayerState({ id: i, name: preset.name, color: preset.color }));
    }
    assignObjectiveCards(players);
    resetBoardState();
}

function resetBoardState() {
    boardSpaces.forEach(space => {
        if (PURCHASABLE_TYPES.includes(space.type)) {
            space.owner = null;
            space.houses = 0;
        }
        space.lastIntervention = "";
    });
    currentPlayerIndex = 0;
    isMoving = false;
    awaitingDecision = false;
    gameOver = false;
    yearNumber = 1;
    cycleNumber = 0;
    marketState = getInitialMarketState();
    recentChanges = [];
    players.forEach(player => {
        player.passedFestaJunina = false;
        player.finishedYear = false;
        player.playedThisCycle = false;
    });
    pendingTrade = null;
    closeTradeModal();
    pendingCard = null;
    closeCardModal();
    renderBoard();
    renderPawns();
    if (players.length > 0) beginYearTurns();
}

// Início de cada ano: a vez começa pelo primeiro jogador ativo.
function beginYearTurns(prefix = "") {
    currentPlayerIndex = Math.max(0, players.findIndex(player => !player.isBankrupt));
    awaitingDecision = false;
    updateUI();
    const player = players[currentPlayerIndex];
    const msg = `${prefix ? `${prefix} ` : ""}Ano ${yearNumber}: é a vez de ${player ? player.name : "—"}. Role os dados!`;
    updateStatus(msg);
    syncGameState(msg);
}

// ==========================================
// ROLAGEM DE DADOS E MOVIMENTAÇÃO
// ==========================================
function rollDice() {
    if (isMoving || awaitingDecision || gameOver) return;
    const player = players[currentPlayerIndex];
    if (!player || player.isBankrupt || player.finishedYear) return;

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
    if (!player || player.isBankrupt || player.finishedYear || isMoving || awaitingDecision || gameOver || pendingTrade || pendingCard) return;

    isMoving = true;
    updateUI();

    if (player.inJail) {
        player.jailTurns += 1;
        if (player.money >= GAME_CONFIG.fiancaPrisao) {
            player.money -= GAME_CONFIG.fiancaPrisao;
            player.inJail = false;
            player.jailTurns = 0;
            const msg = `⛓️ ${player.name} pagou ${formatMoney(GAME_CONFIG.fiancaPrisao)} de fiança e saiu da prisão!`;
            updateStatus(msg);
            syncGameState(msg);
        } else {
            const msg = `⛓️ ${player.name} continua na prisão (${player.jailTurns}º turno).`;
            updateStatus(msg);
            isMoving = false;
            syncGameState(msg);
            nextTurn(msg);
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
    updateStatus(statusMsg);

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
    const player = players[playerIndex];

    for (let i = 0; i < steps; i++) {
        const semesterBefore = getCurrentSemester(players);
        const step = stepPlayerForward(player, boardSpaces);
        if (semesterBefore === "primeiro" && getCurrentSemester(players) === "segundo") {
            const msg = `🎉 Todos os jogadores passaram pela FESTA JUNINA: começa o segundo semestre. A próxima Carta de Fluência usará o efeito do segundo semestre.`;
            updateStatus(msg);
            syncGameState(msg);
        }
        if (step.completedLap) {
            const statusMsg = `📘 ${player.name} cruzou a PARTIDA e entrou no Fechamento do Exercício.`;
            updateStatus(statusMsg);
            syncGameState(statusMsg);
            updateUI();
            renderPawns();
            break;
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
    let landingMessage = "";

    if (PURCHASABLE_TYPES.includes(space.type)) {
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
            let msg = `${player.name} caiu no fator sob sua própria gerência: ${space.name}.`;
            if (space.fichaType) {
                msg += ` ${player.name} recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)}.`;
            }
            updateStatus(msg);
            syncGameState(msg);
            landingMessage = msg;
        }
    } else if (space.name === "Sorte ou Revés") {
        drawCard(player);
        return;
    } else if (space.name === "VÁ PARA A PRISÃO") {
        player.position = boardSpaces.findIndex(candidate => candidate.name === "PRISÃO");
        player.inJail = true;
        player.jailTurns = 0;
        renderPawns();
        const msg = `🚨 ${player.name} foi para a Prisão!`;
        updateStatus(msg);
        syncGameState(msg);
        landingMessage = msg;
    } else if (space.name === "Multa da Vigilância Sanitária") {
        const fine = GAME_CONFIG.multaVigilanciaSanitaria;
        const charge = applyMandatoryCharge(player, fine, boardSpaces);
        if (charge.eliminated) {
            announceElimination(player, `ao pagar a Multa da Vigilância Sanitária (${formatMoney(fine)})`);
            return;
        }
        const msg = `🧾 ${player.name} pagou ${formatMoney(fine)} de Multa da Vigilância Sanitária.`;
        updateStatus(msg);
        syncGameState(msg);
        landingMessage = msg;
    }

    nextTurn(landingMessage);
}

// O visitante paga a taxa de visita (que depende do nível atual do fator) ao gerente atual.
function payRent(player, space) {
    const owner = players.find(p => p.id === space.owner);
    const rentAmount = getSpaceVisitFee(space, marketState);

    if (owner) owner.money += rentAmount;
    if (applyMandatoryCharge(player, rentAmount, boardSpaces).eliminated) {
        announceElimination(player, `ao pagar ${formatMoney(rentAmount)} de taxa de visita`);
        return;
    }

    const msg = `💸 ${player.name} pagou ${formatMoney(rentAmount)} de taxa de visita para ${owner ? owner.name : "o Banco"}.`;
    updateStatus(msg);
    syncGameState(msg);
    nextTurn(msg);
}

// ==========================================
// FICHAS DE INVESTIGAÇÃO (CENTROS DE OBSERVAÇÃO)
// ==========================================
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
    const rentAmount = getSpaceVisitFee(space, marketState);

    if (owner) owner.money += rentAmount;
    if (applyMandatoryCharge(player, rentAmount, boardSpaces).eliminated) {
        announceElimination(player, `ao pagar ${formatMoney(rentAmount)} de taxa de utilização`);
        return;
    }

    const msg = `🔬 ${player.name} pagou ${formatMoney(rentAmount)} de taxa de utilização para ${owner ? owner.name : "o Banco"} em ${space.name} e recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)}.`;
    updateStatus(msg);
    syncGameState(msg);
    nextTurn(msg);
}

function showPurchaseModal(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    const fichaNote = space.fichaType ? ` ${player.name} já recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)} por parar aqui.` : "";
    syncGameState(`Aguardando decisão de ${player.name} sobre ${space.name}...${fichaNote}`);
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const icon = space.fichaType ? "🔬" : "🏠";

    if (!isMultiplayer || player.peerId === myPeerId) {
        showPurchaseModalUI(player, space);
    } else {
        statusDiv.innerText = `${icon} ${space.name} (${formatMoney(space.price)}) disponível para gerência! Aguardando ${player.name}...${fichaNote}`;
    }
}

function showPurchaseModalUI(player, space, errorMessage = "") {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    const icon = space.fichaType ? "🔬" : "🏠";
    const fichaNote = space.fichaType
        ? `<div style="margin-bottom: 10px; font-size: 0.8rem; color: #0891b2;">Você recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)} por parar aqui.</div>`
        : "";
    const errorNote = errorMessage ? `<div style="margin-bottom: 10px; font-size: 0.8rem; color: #c62828;">${errorMessage}</div>` : "";
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #1a293d; padding: 10px; border-radius: 6px;">
            ${icon} <strong>${space.name}</strong> disponível por <strong>${formatMoney(space.price)}</strong>.
        </div>
        ${fichaNote}
        ${errorNote}
        <div style="display: flex; gap: 10px;">
            <button id="btn-buy-prop" style="padding: 6px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Assumir gerência</button>
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

// Jogador eliminado por saldo negativo: applyMandatoryCharge já liberou as gerências (os fatores mantêm seus níveis).
function announceElimination(player, reason) {
    refreshBoardOwnership();
    renderPawns();
    const msg = `💥 ${player.name} ficou com saldo negativo ${reason} e foi eliminado. Suas gerências voltaram a ficar disponíveis.`;
    updateStatus(msg);
    syncGameState(msg);
    nextTurn(msg);
}

// previousMessage: resultado da jogada que terminou (cobrança, eliminação etc.), mantido na mensagem
// da próxima vez para não ser apagado imediatamente.
function nextTurn(previousMessage = "") {
    if (players.length === 0 || gameOver) return;
    const lead = previousMessage ? `${previousMessage} ` : "";

    const advance = resolveTurnAdvance(players, currentPlayerIndex);
    if (advance.type === "lastStanding") {
        if (advance.winner) finishGame(advance.winner, "é o único jogador ativo restante", lead);
        else endGame(`${lead}🏁 Não restaram jogadores ativos. Partida encerrada sem vencedor.`);
        return;
    }

    // O fechamento anual acontece antes de qualquer nova Carta de Fluência.
    if (advance.type === "closeYear") {
        closeAnnualExercise();
        return;
    }

    let cycleMessage = "";
    if (advance.type === "cycleEnd") {
        cycleNumber += 1;
        marketState = drawFluencyCard(marketState, players);
        const card = marketState.activeCard;
        cycleMessage = `🃏 Carta de Fluência — ${card.name} (${semesterLabel(card.semester).toLowerCase()}): "${card.text}" ${describeFluencyEffects(card).join("; ")}.`;
    }

    currentPlayerIndex = advance.nextIndex;
    awaitingDecision = false;
    updateUI();

    const nextPlayer = players[currentPlayerIndex];
    const msg = `${lead}${cycleMessage ? `${cycleMessage} ` : ""}Ciclo ${cycleNumber}, Ano ${yearNumber}: é a vez de ${nextPlayer.name}. Role os dados!`;
    updateStatus(msg);
    syncGameState(msg);
}

function finishGame(winner, reason, lead = "") {
    endGame(`${lead}🏆 FIM DE JOGO! ${winner.name} venceu porque ${reason}.`);
}

function endGame(msg) {
    gameOver = true;
    updateStatus(msg);
    updateUI();
    syncGameState(msg);
}

function closeAnnualExercise() {
    const outcome = resolveAnnualClosing(players, marketState, GAME_CONFIG);
    const names = list => list.map(player => player.name).join(" e ");

    if (outcome.type === "winner") {
        const reason = outcome.reason === "objective"
            ? "foi o único a cumprir a Carta de Objetivo no fechamento do ano"
            : "cumpriu a Carta de Objetivo e terminou com mais dinheiro em caixa";
        finishGame(outcome.winners[0], reason);
        return;
    }
    if (outcome.type === "tie") {
        endGame(`🤝 EMPATE! ${names(outcome.winners)} cumpriram a Carta de Objetivo e terminaram com o mesmo dinheiro em caixa.`);
        return;
    }

    // Ninguém cumpriu: a cobrança anual já foi aplicada. Eliminados liberam suas gerências.
    outcome.eliminated.forEach(player => releaseManagements(boardSpaces, player.id));
    refreshBoardOwnership();
    const eliminatedText = outcome.eliminated.length ? ` ${names(outcome.eliminated)} não conseguiu pagar e foi eliminado.` : "";

    if (outcome.type === "survivor") {
        finishGame(outcome.winners[0], `foi o único a pagar o Imposto de Renda anual de ${formatMoney(GAME_CONFIG.impostoRenda)}`);
        return;
    }
    if (outcome.type === "noSurvivors") {
        endGame(`🏁 Ninguém cumpriu a Carta de Objetivo nem conseguiu pagar o Imposto de Renda anual. Partida encerrada sem vencedor.`);
        return;
    }

    const closedYear = yearNumber;
    yearNumber += 1;
    cycleNumber = 0;
    marketState = startNewYearMarket(marketState);
    players.filter(player => !player.isBankrupt).forEach(player => {
        player.position = 0;
        player.passedFestaJunina = false;
        player.finishedYear = false;
        player.playedThisCycle = false;
    });
    assignObjectiveCards(players);
    currentPlayerIndex = Math.max(0, players.findIndex(player => !player.isBankrupt));
    renderBoard();
    renderPawns();
    beginYearTurns(`📅 Fechamento do Ano ${closedYear}: ninguém cumpriu a Carta de Objetivo e cada jogador pagou ${formatMoney(GAME_CONFIG.impostoRenda)}.${eliminatedText} Começou o Ano ${yearNumber}; o mercado voltou aos valores-base e os fatores internos mantêm seus níveis.`);
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
    if (!awaitingDecision) return;
    const player = players[currentPlayerIndex];
    if (!player) return;

    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const space = boardSpaces[player.position];
    const result = purchaseManagement(getRulesContext(), player.id, space.id);
    if (!result.ok) {
        const msg = `⚠️ ${result.error}`;
        syncGameState(msg);
        if (!isMultiplayer || player.peerId === (window.Network ? window.Network.myPeerId : null)) {
            showPurchaseModalUI(player, space, msg);
        }
        return;
    }

    refreshBoardOwnership();
    const msg = `🎉 ${player.name} assumiu a gerência de ${space.name}!`;
    updateStatus(msg);
    awaitingDecision = false;
    syncGameState(msg);
    nextTurn(msg);
}

function hostProcessPassProperty(senderPeerId) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    if (!awaitingDecision) return;
    const player = players[currentPlayerIndex];
    if (!player) return;

    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const space = boardSpaces[player.position];
    const msg = `${player.name} não assumiu a gerência de ${space.name}.`;
    updateStatus(msg);
    awaitingDecision = false;
    syncGameState(msg);
    nextTurn(msg);
}

// delta: +1 sobe um nível, -1 reduz um nível (valores maiores cobram todos os níveis intermediários).
function hostProcessInterveneFactor(senderPeerId, factorKey, delta) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    const player = players[currentPlayerIndex];
    if (!player) return;
    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const result = applyIntervention(getRulesContext(), player.id, factorKey, Number(delta));
    if (!result.ok) {
        const msg = `⚠️ Intervenção recusada: ${result.error}`;
        updateStatus(msg);
        syncGameState(msg);
        return;
    }

    const change = result.change;
    const space = boardSpaces.find(candidate => candidate.factorKey === factorKey);
    if (space) space.lastIntervention = change.direction === "up" ? "+" : "-";
    recentChanges.unshift(change);
    recentChanges = recentChanges.slice(0, 8);

    const verb = change.direction === "up" ? "aumentou" : "reduziu";
    const msg = `🛠️ ${player.name} ${verb} ${change.symbol} (${change.factorName}): ${formatInternalValue(factorKey, change.fromValue)} → ${formatInternalValue(factorKey, change.toValue)}. Custo: ${formatMoney(change.money)} + ${formatFichas(change.fichas, change.fichaType)}. As Cartas de Objetivo foram recalculadas.`;
    updateStatus(msg);
    refreshBoardOwnership();
    updateUI();
    syncGameState(msg);
}

// ==========================================
// SINCRONIZAÇÃO DE REDE (BROADCAST E RECEBIMENTO)
// ==========================================
function syncGameState(statusMessage = null, diceDisplay = null, diceValues = null) {
    if (!isMultiplayer || !window.Network || !window.Network.isHost) return;

    sendNetworkAction("SYNC_GAME_STATE", {
        players: players,
        boardSpaces: boardSpaces.map(s => ({ id: s.id, owner: s.owner, houses: s.houses || 0, lastIntervention: s.lastIntervention || "" })),
        marketState: marketState,
        recentChanges: recentChanges,
        yearNumber: yearNumber,
        cycleNumber: cycleNumber,
        gameOver: gameOver,
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
                localSpace.lastIntervention = syncSpace.lastIntervention || "";
            }
        });
    }

    if (payload.marketState) marketState = payload.marketState;
    if (payload.recentChanges) recentChanges = payload.recentChanges;
    if (payload.yearNumber !== undefined) yearNumber = payload.yearNumber;
    if (payload.cycleNumber !== undefined) cycleNumber = payload.cycleNumber;
    if (payload.gameOver !== undefined) gameOver = payload.gameOver;

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
    let count = 2;
    try {
        if (typeof window !== "undefined" && typeof window.prompt === "function") {
            const answer = window.prompt(`Quantos jogadores locais? (2 a ${GAME_CONFIG.maxJogadores})`, "2");
            count = parseInt(answer, 10);
        }
    } catch (error) {
        count = 2;
    }
    if (isNaN(count) || count < 2 || count > GAME_CONFIG.maxJogadores) count = 2;
    initializePlayers(count);
}

if (typeof window !== "undefined") {
    window.startMultiplayerGame = function(lobbyPlayers) {
        isMultiplayer = true;
        players = lobbyPlayers.map((lp, idx) => createPlayerState({
            id: idx,
            peerId: lp.peerId || lp.id,
            name: lp.name || `Jogador ${idx + 1}`,
            color: PLAYER_PRESETS[idx % PLAYER_PRESETS.length].color
        }));

        assignObjectiveCards(players);

        // resetBoardState inicia o ano e o Host sincroniza o estado inicial.
        resetBoardState();
    };

    window.hostProcessRollDice = hostProcessRollDice;
    window.hostProcessBuyProperty = hostProcessBuyProperty;
    window.hostProcessPassProperty = hostProcessPassProperty;
    window.hostProcessInterveneFactor = hostProcessInterveneFactor;
    window.applyGameStateSync = applyGameStateSync;
}
