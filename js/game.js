/**
 * game.js
 * Fluxo da partida (Host-Authoritative): turnos, movimentação, casas,
 * intervenções, fechamento anual e sincronização.
 *
 * Responsabilidades:
 * - O Host executa regras, movimenta peças, altera dinheiro/propriedades e transmite o estado.
 * - O Cliente envia intenções/pedidos e apenas aplica o estado recebido do Host.
 *
 * Configurações e regras puras (fatores, custos, taxas, cartas, fórmulas) ficam em js/rules.js.
 */

// Baralho de "Sorte ou Revés": situações e questões de múltipla escolha. As referências
// pedagógicas são metadados internos e não são exibidas aos jogadores.
const CARDS = [
    { id: 1, type: "objetiva", situation: "O restaurante manteve o cardápio, o marketing e o horário de funcionamento. Quando o preço médio passou de R$ 40 para R$ 46, o número de clientes observado diminuiu.", text: "Qual interpretação é mais adequada?", options: { A: "Aumentar o preço sempre reduz o número de clientes.", B: "Nesse recorte, a mudança do preço esteve acompanhada de uma mudança na quantidade de clientes, mas isso não garante que a relação seja igual em qualquer situação.", C: "As duas grandezas não possuem relação porque são medidas em unidades diferentes.", D: "O número de clientes determina obrigatoriamente o preço." }, answer: "B", pedagogicalReference: "Dependência; isolado; campo de variação" },
    { id: 2, type: "objetiva", situation: "Durante uma reorganização do restaurante, a equipe compara mudanças possíveis.", text: "Qual alteração abaixo poderia assumir naturalmente um valor entre dois números inteiros?", options: { A: "Passar de 3 para 3,5 cozinheiros.", B: "Passar de 2 para 2,4 equipamentos de cozinha.", C: "Passar de 8 para 8,5 horas diárias de operação.", D: "Passar de 6 para 6,3 pratos no cardápio." }, answer: "C", pedagogicalReference: "Variável; grandeza contínua; campo de variação" },
    { id: 3, type: "objetiva", situation: "Depois de algumas intervenções, o sistema registrou diferentes valores para os fatores do restaurante.", text: "Qual deles indica que provavelmente ocorreu um erro no registro?", options: { A: "4 cozinheiros.", B: "3 equipamentos de cozinha.", C: "6,5 opções de pratos no cardápio.", D: "10 horas diárias de operação." }, answer: "C", pedagogicalReference: "Variável; grandeza discreta; campo de variação" },
    { id: 4, type: "objetiva", situation: "Os jogadores querem investigar se alterar o orçamento de marketing interfere em determinado resultado do restaurante.", text: "Qual comparação ajudaria mais nessa investigação?", options: { A: "Alterar marketing, preço e cardápio ao mesmo tempo.", B: "Alterar somente o marketing e manter as demais condições escolhidas para a análise.", C: "Comparar duas situações em que todos os fatores sejam diferentes.", D: "Alterar diretamente o resultado que se pretende observar." }, answer: "B", pedagogicalReference: "Isolado; dependência; investigação" },
    { id: 5, type: "objetiva", situation: "Um grupo quer estudar como a variedade do cardápio interfere em um indicador de atratividade.", text: "Qual procedimento faz mais sentido?", options: { A: "Escolher valores para a variedade e observar o resultado produzido em cada situação.", B: "Escolher primeiro o resultado desejado e ignorar a variedade.", C: "Manter a variedade sempre igual e alterar somente o resultado.", D: "Modificar todas as grandezas em cada tentativa." }, answer: "A", pedagogicalReference: "Variável; dependência; isolado" },
    { id: 6, type: "objetiva", situation: "Em duas jogadas, todos os fatores usados por uma Carta de Objetivo apresentaram exatamente os mesmos valores, mas o sistema calculou resultados diferentes.", text: "O que isso sugere?", options: { A: "Isso é esperado porque o restaurante é imprevisível.", B: "Há algum fator não considerado ou um problema na regra de cálculo.", C: "O segundo resultado deve ser aceito por ser mais recente.", D: "A mesma situação pode produzir qualquer resultado sem alterar a relação." }, answer: "B", pedagogicalReference: "Lei de formação; dependência; relação funcional" },
    { id: 7, type: "objetiva", situation: "No jogo, o Número de Cozinheiros pode assumir 2, 3, 4 ou 5, e os Equipamentos de Cozinha podem assumir 1, 2, 3 ou 4.", text: "Qual situação o sistema deve rejeitar antes mesmo de calcular um objetivo?", options: { A: "4 cozinheiros e 3 equipamentos.", B: "5 cozinheiros e 4 equipamentos.", C: "2 cozinheiros e 1 equipamento.", D: "3,5 cozinheiros e 2 equipamentos." }, answer: "D", pedagogicalReference: "Domínio; campo de variação; variável discreta" },
    { id: 8, type: "objetiva", situation: "Uma carta calcula a capacidade da cozinha pela regra 12 × cozinheiros × equipamentos. Considere os valores permitidos no jogo.", text: "Qual capacidade abaixo pode realmente ocorrer?", options: { A: "72 pratos/dia.", B: "84 pratos/dia.", C: "132 pratos/dia.", D: "168 pratos/dia." }, answer: "A", pedagogicalReference: "Imagem; domínio; lei de formação" },
    { id: 9, type: "objetiva", situation: "Dois jogadores possuem objetivos diferentes: um deseja aumentar a capacidade da cozinha e o outro precisa reduzir o custo associado aos equipamentos.", text: "Qual decisão pode ajudar o primeiro e, ao mesmo tempo, dificultar o objetivo do segundo?", options: { A: "Aumentar os Equipamentos de Cozinha.", B: "Manter todos os fatores inalterados.", C: "Reduzir o preço médio dos pratos.", D: "Aumentar a variedade do cardápio." }, answer: "A", pedagogicalReference: "Interdependência; dependência" },
    { id: 10, type: "objetiva", situation: "O Preço Médio dos Pratos apareceu, em quatro momentos da partida, como R$ 40 → R$ 43 → R$ 46 → R$ 43.", text: "O que essa sequência permite perceber melhor do que observar apenas o último valor?", options: { A: "Que o preço possui um único valor verdadeiro.", B: "Que a grandeza se transforma ao longo da partida e pode assumir diferentes estados.", C: "Que R$ 43 é necessariamente o melhor preço.", D: "Que os valores anteriores deixam de ter qualquer significado." }, answer: "B", pedagogicalReference: "Movimento; fluência; variação" },
    { id: 11, type: "objetiva", situation: "Pelas regras atuais, o Preço Médio dos Pratos pode variar entre R$ 37 e R$ 46. Um jogador tenta definir R$ 52 para alcançar sua meta.", text: "Como o jogo deve tratar essa decisão?", options: { A: "Aceitar, pois qualquer preço é possível.", B: "Rejeitar, pois o valor está fora das condições admitidas para essa grandeza.", C: "Aceitar apenas se o jogador tiver dinheiro suficiente.", D: "Transformar automaticamente R$ 52 em R$ 46 sem avisar." }, answer: "B", pedagogicalReference: "Campo de variação; domínio" },
    { id: 12, type: "objetiva", situation: "Mantendo os demais fatores constantes, foram registrados: Marketing R$ 1.000 → indicador 7; R$ 2.000 → indicador 8; R$ 3.000 → indicador 9.", text: "Qual regra reproduz os três registros?", options: { A: "Indicador = Marketing ÷ 1.000 + 6.", B: "Indicador = Marketing ÷ 100.", C: "Indicador = Marketing + 6.", D: "Indicador = 10 − Marketing ÷ 1.000." }, answer: "A", pedagogicalReference: "Regularidade; lei de formação; dependência" },
    { id: 13, type: "objetiva", situation: "Um indicador do restaurante foi projetado para ser mostrado em uma escala de 0 a 20 pontos. Nas condições atuais do jogo, porém, as combinações disponíveis só estão produzindo valores entre 8 e 16.", text: "Para configurar a escala completa do mostrador, qual informação deve ser considerada?", options: { A: "Somente os valores já obtidos.", B: "A faixa de 0 a 20 para a qual o indicador foi definido.", C: "Apenas o maior valor já alcançado.", D: "Somente o valor da rodada atual." }, answer: "B", pedagogicalReference: "Contradomínio; imagem" },
    { id: 14, type: "objetiva", situation: "Mantendo o tempo de operação e o imposto fixos, o preço médio e a receita potencial apresentaram os pares: (37; 1.598,40), (40; 1.728,00), (43; 1.857,60), (46; 1.987,20).", text: "Qual descrição combina melhor com um gráfico desses dados?", options: { A: "Os pontos seguem uma tendência crescente e alinhada.", B: "O gráfico deve ser horizontal.", C: "A receita diminui quando o preço aumenta.", D: "Não existe relação entre os valores porque as unidades são diferentes." }, answer: "A", pedagogicalReference: "Representação gráfica; dependência; lei de formação" },
    { id: 15, type: "objetiva", situation: "O custo dos alimentos permanece fixo em R$ 20/kg. A quantidade comprada passa de 40 kg para 60 kg e os demais fatores permanecem iguais.", text: "Quanto muda o gasto com alimentos?", options: { A: "Aumenta R$ 20.", B: "Aumenta R$ 200.", C: "Aumenta R$ 400.", D: "Não se altera." }, answer: "C", pedagogicalReference: "Variação; dependência; parâmetro externo" },
    { id: 16, type: "objetiva", situation: "Antes do horário de almoço, o gerente precisa decidir quantos funcionários manter no salão para atender uma quantidade esperada de clientes.", text: "Qual procedimento oferece uma base melhor para essa decisão?", options: { A: "Registrar como a capacidade de atendimento muda quando se alteram funcionários e outras condições relevantes.", B: "Escolher qualquer quantidade de funcionários porque não é possível estabelecer relações.", C: "Esperar o encerramento do dia e escolher retroativamente a quantidade desejada.", D: "Utilizar apenas o nome das grandezas, sem comparar seus valores." }, answer: "A", pedagogicalReference: "Necessidade do conceito; investigação; dependência" }
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
let gameResult = null; // resultado final exibido em destaque (vencedor, empate ou sem vencedor)

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
    gameResult = null;
    refreshGameResultUI();
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
    // Com a partida encerrada, o botão dos dados passa a reabrir o resultado.
    if (gameOver) {
        showGameResultAgain();
        return;
    }
    if (isMoving || awaitingDecision) return;
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
            const msg = `🎉 Todos os jogadores passaram pela FESTA JUNINA: começa o segundo semestre.`;
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
        <div class="purchase-decision-box">
            <div class="purchase-decision-header">
                ${icon} <strong>${space.name}</strong>
            </div>
            <div class="purchase-decision-price">Disponível por <strong>${formatMoney(space.price)}</strong></div>
        </div>
        ${fichaNote}
        ${errorNote}
        <div class="purchase-decision-actions">
            <button id="btn-buy-prop" class="purchase-btn purchase-btn-buy">Assumir gerência</button>
            <button id="btn-pass-prop" class="purchase-btn purchase-btn-pass">Passar</button>
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
        else endGame(`${lead}🏁 Não restaram jogadores ativos. Partida encerrada sem vencedor.`, { type: "noWinner", reason: "não restaram jogadores ativos", context: lead.trim() });
        return;
    }

    if (advance.type === "closeYear") {
        closeAnnualExercise();
        return;
    }

    if (advance.type === "cycleEnd") {
        cycleNumber += 1;
    }

    currentPlayerIndex = advance.nextIndex;
    awaitingDecision = false;
    updateUI();

    const nextPlayer = players[currentPlayerIndex];
    const msg = `${lead}Ciclo ${cycleNumber}, Ano ${yearNumber}: é a vez de ${nextPlayer.name}. Role os dados!`;
    updateStatus(msg);
    syncGameState(msg);
}

function finishGame(winner, reason, lead = "") {
    endGame(`${lead}🏆 FIM DE JOGO! ${winner.name} venceu porque ${reason}.`, { type: "winner", winnerIds: [winner.id], reason, context: lead.trim() });
}

// Encerra a partida e mostra o resultado em destaque para todos os jogadores.
function endGame(msg, result = {}) {
    gameOver = true;
    const winnerIds = result.winnerIds || [];
    gameResult = {
        type: result.type || "noWinner",
        winnerIds,
        reason: result.reason || "",
        context: result.context || "",
        standings: buildFinalStandings(players, marketState, winnerIds)
    };
    updateStatus(msg);
    updateUI();
    syncGameState(msg);
    refreshGameResultUI();
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
        endGame(`🤝 EMPATE! ${names(outcome.winners)} cumpriram a Carta de Objetivo e terminaram com o mesmo dinheiro em caixa.`, { type: "tie", winnerIds: outcome.winners.map(player => player.id), reason: "cumpriram a Carta de Objetivo e terminaram com o mesmo dinheiro em caixa" });
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
        endGame(`🏁 Ninguém cumpriu a Carta de Objetivo nem conseguiu pagar o Imposto de Renda anual. Partida encerrada sem vencedor.`, { type: "noWinner", reason: "ninguém cumpriu a Carta de Objetivo nem conseguiu pagar o Imposto de Renda anual" });
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
        diceValues: diceValues,
        gameResult: gameResult
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

    if (payload.marketState) marketState = { ...payload.marketState, external: getBaseExternal() };
    if (payload.recentChanges) recentChanges = payload.recentChanges;
    if (payload.yearNumber !== undefined) yearNumber = payload.yearNumber;
    if (payload.cycleNumber !== undefined) cycleNumber = payload.cycleNumber;
    if (payload.gameOver !== undefined) gameOver = payload.gameOver;
    if (payload.gameResult !== undefined) gameResult = payload.gameResult;

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
    refreshGameResultUI();
}

// ==========================================
// INICIAIS E BINDINGS GLOBAIS
// ==========================================
// Modo local: a quantidade é escolhida em uma janela que só oferece de 2 a GAME_CONFIG.maxJogadores.
function startPlayerSetup() {
    openPlayerSetupModalUI(count => {
        if (Number.isInteger(count) && count >= 2 && count <= GAME_CONFIG.maxJogadores) initializePlayers(count);
    });
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
