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
    rentMultiplier: 1.0,
    impostoRenda: 2000,
    taxaLuxo: 1000,
    fiancaPrisao: 500,
    taxaTroca: 200,
    taxaTrocaPercent: 0.10,
    fichasPorVisita: 1,
    pawnMoveStepDelay: 250,      // 200ms originais / 0.8 = 80% da velocidade
    diceRollAnimationDuration: 750,
    cardFichaPenalty: 500
};

const PRESETS = {
    standard: { name: "Padrão", startingMoney: 25000, taxaTroca: 200 },
    fast: { name: "Jogo Rápido", startingMoney: 40000, taxaTroca: 100 },
    hardcore: { name: "Escassez", startingMoney: 15000, taxaTroca: 500 }
};

const FACTOR_DEFINITIONS = {
    numeroCozinheiros: { name: "Número de Cozinheiros", value: 6, unit: "cozinheiros", control: true, discrete: true, cost: 1500, ficha: "discreta", step: 1 },
    equipamentosCozinha: { name: "Equipamentos de Cozinha", value: 8, unit: "equipamentos", control: true, discrete: true, cost: 3000, ficha: "discreta", step: 1 },
    precoMedioPratos: { name: "Preço Médio dos Pratos", value: 80, unit: "$", control: true, cost: 500, ficha: "continua", step: 1 },
    orcamentoMarketing: { name: "Orçamento de Marketing", value: 1000, unit: "$", control: true, cost: 1000, ficha: "continua", step: 1000 },
    estoqueDisponivel: { name: "Estoque Disponível", value: 500, unit: "kg", control: true, cost: 1000, ficha: "continua", step: 10 },
    variedadeCardapio: { name: "Variedade do Cardápio", value: 12, unit: "pratos", control: true, discrete: true, cost: 1000, ficha: "discreta", step: 1 },
    qualidadeIngredientes: { name: "Qualidade dos Ingredientes", value: 4, unit: "pontos", control: true, cost: 2000, ficha: "continua", step: 0.5 },
    numeroMesas: { name: "Número de Mesas", value: 20, unit: "mesas", control: true, discrete: true, cost: 2500, ficha: "discreta", step: 1 },
    tempoBasePrato: { name: "Tempo Base do Prato", value: 12, unit: "min", control: false },
    complexidadePedidos: { name: "Complexidade Média dos Pedidos", value: 4, unit: "min", control: false },
    tempoAdicionalAlteracoes: { name: "Tempo Adicional por Alterações", value: 3, unit: "min", control: false },
    pedidosFila: { name: "Pedidos na Fila", value: 0, unit: "pedidos", control: false },
    tempoMedioDespacho: { name: "Tempo Médio de Despacho", value: 5, unit: "min", control: false },
    tempoTotalEspera: { name: "Tempo Total de Espera", value: 0, unit: "min", control: false, result: true },
    demandaClientes: { name: "Demanda de Clientes", value: 0, unit: "pedidos", control: false, result: true },
    avaliacaoClientes: { name: "Avaliação dos Clientes", value: 0, unit: "pontos", control: false, result: true },
    custoCombustivel: { name: "Custo do Combustível", value: 100, unit: "$", control: false },
    valorFrete: { name: "Valor do Frete", value: 0, unit: "$", control: false, result: true },
    custoAlimentos: { name: "Custo dos Alimentos", value: 0, unit: "$", control: false },
    desperdicioAlimentos: { name: "Desperdício de Alimentos", value: 0, unit: "kg", control: false, result: true },
    faturamento: { name: "Faturamento", value: 0, unit: "$", control: false, result: true },
    lucroOperacional: { name: "Lucro Operacional", value: 0, unit: "$", control: false, result: true }
};

const OBJECTIVE_CARDS = [
    { id: "wait", name: "Fila tranquila", condition: "Tempo Total de Espera ≤ 20 minutos", formula: "T = base + complexidade + alterações + fila/equipamentos + despacho/cozinheiros", target: 20, factor: "tempoTotalEspera", operator: "≤", dependencies: ["tempoBasePrato", "complexidadePedidos", "tempoAdicionalAlteracoes", "pedidosFila", "equipamentosCozinha", "tempoMedioDespacho", "numeroCozinheiros"] },
    { id: "demand", name: "Casa cheia", condition: "Demanda ≥ 60 pedidos", formula: "D = 50 × (1 + marketing/10000) × qualidade/4 × variedade/12 × 80/preço", target: 60, factor: "demandaClientes", operator: "≥", dependencies: ["orcamentoMarketing", "qualidadeIngredientes", "variedadeCardapio", "precoMedioPratos"] },
    { id: "queue", name: "Fila organizada", condition: "Pedidos na Fila ≤ 10", formula: "F = demanda × 0,35 / (mesas/10 + cozinheiros/6 + equipamentos/8)", target: 10, factor: "pedidosFila", operator: "≤", dependencies: ["demandaClientes", "numeroMesas", "numeroCozinheiros", "equipamentosCozinha"] },
    { id: "freight", name: "Logística eficiente", condition: "Valor do Frete ≤ $150", formula: "Frete = 100 + combustível × 0,5", target: 150, factor: "valorFrete", operator: "≤", dependencies: ["custoCombustivel"] },
    { id: "waste", name: "Desperdício controlado", condition: "Desperdício ≤ 10 kg", formula: "W = estoque/50 + fila/2 - demanda/20 - variedade/10", target: 10, factor: "desperdicioAlimentos", operator: "≤", dependencies: ["estoqueDisponivel", "demandaClientes", "pedidosFila", "variedadeCardapio"] },
    { id: "rating", name: "Boa experiência", condition: "Avaliação dos Clientes ≥ 4,0", formula: "A = 5 + (qualidade - 4)×0,2 - espera/30 - desperdício/100", target: 4, factor: "avaliacaoClientes", operator: "≥", dependencies: ["qualidadeIngredientes", "tempoTotalEspera", "desperdicioAlimentos"] },
    { id: "revenue", name: "Alta receita", condition: "Faturamento ≥ $5.000", formula: "F = preço × demanda × (1 - fila/(demanda + 1))", target: 5000, factor: "faturamento", operator: "≥", dependencies: ["precoMedioPratos", "demandaClientes", "pedidosFila"] },
    { id: "profit", name: "Operação rentável", condition: "Lucro Operacional ≥ $2.500", formula: "L = faturamento - alimentos - pedidos atendidos×frete - marketing - cozinheiros×150", target: 2500, factor: "lucroOperacional", operator: "≥", dependencies: ["faturamento", "custoAlimentos", "demandaClientes", "valorFrete", "orcamentoMarketing", "numeroCozinheiros"] }
];

const EXTERNAL_FACTOR_CARDS = [
    { name: "Alta internacional do petróleo", first: [{ factor: "custoCombustivel", modifier: 0.10 }], second: [{ factor: "custoCombustivel", modifier: 0.15 }] },
    { name: "Problemas na safra", first: [{ factor: "custoAlimentos", modifier: 0.10 }], second: [{ factor: "custoAlimentos", modifier: 0.05 }, { factor: "valorFrete", modifier: 0.05 }] },
    { name: "Movimento sazonal", first: [{ factor: "demandaClientes", modifier: -0.10 }], second: [{ factor: "demandaClientes", modifier: 0.20 }] },
    { name: "Logística de fim de ano", first: [{ factor: "valorFrete", modifier: -0.05 }], second: [{ factor: "valorFrete", modifier: 0.15 }] },
    { name: "Alterações nos hábitos de consumo", first: [{ factor: "complexidadePedidos", modifier: 0.10 }], second: [{ factor: "tempoAdicionalAlteracoes", modifier: 0.15 }] }
];

let factorValues = {};
let externalFactorModifiers = {};
let activeExternalCard = null;
let recentChanges = [];
let yearNumber = 1;
let cycleNumber = 0;

function resetFactors() {
    factorValues = Object.fromEntries(Object.entries(FACTOR_DEFINITIONS).map(([key, definition]) => [key, definition.value]));
    externalFactorModifiers = {};
    recentChanges = [];
    recalculateFactors();
}

function getFactorValue(key) {
    return Number(factorValues[key] || 0);
}

function applyExternalModifier(key, value) {
    return value * (1 + (externalFactorModifiers[key] || 0));
}

function getExternalFactorValue(key) {
    return applyExternalModifier(key, getFactorValue(key));
}

function recalculateFactors() {
    const get = key => getFactorValue(key);
    factorValues.demandaClientes = applyExternalModifier("demandaClientes", 50 * (1 + get("orcamentoMarketing") / 10000) * (get("qualidadeIngredientes") / 4) * (get("variedadeCardapio") / 12) * (80 / Math.max(1, get("precoMedioPratos"))));
    factorValues.pedidosFila = applyExternalModifier("pedidosFila", get("demandaClientes") * 0.35 / (get("numeroMesas") / 10 + get("numeroCozinheiros") / 6 + get("equipamentosCozinha") / 8));
    factorValues.tempoTotalEspera = applyExternalModifier("tempoTotalEspera", get("tempoBasePrato") + getExternalFactorValue("complexidadePedidos") + getExternalFactorValue("tempoAdicionalAlteracoes") + get("pedidosFila") / Math.max(1, get("equipamentosCozinha")) + get("tempoMedioDespacho") / Math.max(1, get("numeroCozinheiros")));
    factorValues.valorFrete = applyExternalModifier("valorFrete", 100 + getExternalFactorValue("custoCombustivel") * 0.5);
    factorValues.custoAlimentos = applyExternalModifier("custoAlimentos", get("demandaClientes") * 20);
    factorValues.desperdicioAlimentos = applyExternalModifier("desperdicioAlimentos", Math.max(0, get("estoqueDisponivel") / 50 + get("pedidosFila") / 2 - get("demandaClientes") / 20 - get("variedadeCardapio") / 10));
    factorValues.avaliacaoClientes = applyExternalModifier("avaliacaoClientes", Math.max(0, Math.min(5, 5 + (get("qualidadeIngredientes") - 4) * 0.2 - get("tempoTotalEspera") / 30 - get("desperdicioAlimentos") / 100)));
    factorValues.faturamento = applyExternalModifier("faturamento", get("precoMedioPratos") * get("demandaClientes") * (1 - get("pedidosFila") / (get("demandaClientes") + 1)));
    const servedOrders = Math.max(0, get("demandaClientes") - get("pedidosFila"));
    factorValues.lucroOperacional = applyExternalModifier("lucroOperacional", get("faturamento") - get("custoAlimentos") - servedOrders * get("valorFrete") - get("orcamentoMarketing") - get("numeroCozinheiros") * 150);
}

function assignObjectives() {
    players.forEach((player, index) => {
        const card = OBJECTIVE_CARDS[index % OBJECTIVE_CARDS.length];
        player.objective = { ...card, fulfilled: false };
    });
}

function updateObjectiveStatus(player) {
    if (!player.objective) return false;
    const value = getFactorValue(player.objective.factor);
    player.objective.currentValue = value;
    player.objective.fulfilled = player.objective.operator === "≤" ? value <= player.objective.target : value >= player.objective.target;
    return player.objective.fulfilled;
}

function applyExternalCard(card) {
    externalFactorModifiers = {};
    const secondSemester = players.length > 0 && players.every(player => player.passedFestaJunina);
    const effects = secondSemester ? card.second : card.first;
    effects.forEach(effect => { externalFactorModifiers[effect.factor] = effect.modifier; });
    activeExternalCard = { ...card, semester: secondSemester ? "Segundo semestre" : "Primeiro semestre", effects };
    recalculateFactors();
}

function drawExternalFactorCard() {
    const card = EXTERNAL_FACTOR_CARDS[Math.floor(Math.random() * EXTERNAL_FACTOR_CARDS.length)];
    applyExternalCard(card);
    const effects = activeExternalCard.effects.map(effect => `${FACTOR_DEFINITIONS[effect.factor].name}: ${effect.modifier > 0 ? "+" : ""}${Math.round(effect.modifier * 100)}%`).join("; ");
    return `🌐 ${card.name} (${activeExternalCard.semester}): ${effects}`;
}

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
    { id: 1, name: "Número de Cozinheiros", type: "property", factorKey: "numeroCozinheiros", price: 60, rent: 2, owner: null },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, name: "Equipamentos de Cozinha", type: "property", factorKey: "equipamentosCozinha", price: 60, rent: 4, owner: null },
    { id: 4, name: "Imposto de Renda", type: "special" },
    { id: 5, name: "Laboratório de Alimentos", type: "station", price: 200, rent: 20, owner: null, fichaType: "continua" },
    { id: 6, name: "Preço Médio dos Pratos", type: "property", factorKey: "precoMedioPratos", price: 100, rent: 6, owner: null },
    { id: 7, name: "Sorte ou Revés", type: "special" },
    { id: 8, name: "Orçamento de Marketing", type: "property", factorKey: "orcamentoMarketing", price: 100, rent: 6, owner: null },
    { id: 9, name: "Estoque Disponível", type: "property", factorKey: "estoqueDisponivel", price: 120, rent: 8, owner: null },
    { id: 10, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 11, name: "Variedade do Cardápio", type: "property", factorKey: "variedadeCardapio", price: 140, rent: 10, owner: null },
    { id: 12, name: "Cia. de Saneamento", type: "utility", price: 150, rent: 15, owner: null },
    { id: 13, name: "Qualidade dos Ingredientes", type: "property", factorKey: "qualidadeIngredientes", price: 140, rent: 10, owner: null },
    { id: 14, name: "Número de Mesas", type: "property", factorKey: "numeroMesas", price: 160, rent: 12, owner: null },
    { id: 15, name: "Centro de Controle Financeiro", type: "station", price: 200, rent: 20, owner: null, fichaType: "continua" },
    { id: 16, name: "Tempo Base do Prato", type: "property", factorKey: "tempoBasePrato", price: 180, rent: 14, owner: null },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "Complexidade Média dos Pedidos", type: "property", factorKey: "complexidadePedidos", price: 180, rent: 14, owner: null },
    { id: 19, name: "Tempo Adicional por Alterações", type: "property", factorKey: "tempoAdicionalAlteracoes", price: 200, rent: 16, owner: null },
    { id: 20, name: "FESTA JUNINA", type: "special", cssClass: "corner-space" },
    { id: 21, name: "Pedidos na Fila", type: "property", factorKey: "pedidosFila", price: 220, rent: 18, owner: null },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Tempo Médio de Despacho", type: "property", factorKey: "tempoMedioDespacho", price: 220, rent: 18, owner: null },
    { id: 24, name: "Tempo Total de Espera", type: "property", factorKey: "tempoTotalEspera", price: 240, rent: 20, owner: null },
    { id: 25, name: "Centro de Gestão de Pessoas", type: "station", price: 200, rent: 20, owner: null, fichaType: "discreta" },
    { id: 26, name: "Demanda de Clientes", type: "property", factorKey: "demandaClientes", price: 260, rent: 22, owner: null },
    { id: 27, name: "Cia. de Força e Luz", type: "utility", price: 150, rent: 15, owner: null },
    { id: 28, name: "Avaliação dos Clientes", type: "property", factorKey: "avaliacaoClientes", price: 260, rent: 22, owner: null },
    { id: 29, name: "Custo do Combustível", type: "property", factorKey: "custoCombustivel", price: 280, rent: 24, owner: null },
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 31, name: "Valor do Frete", type: "property", factorKey: "valorFrete", price: 300, rent: 26, owner: null },
    { id: 32, name: "Custo dos Alimentos", type: "property", factorKey: "custoAlimentos", price: 300, rent: 26, owner: null },
    { id: 33, name: "Sorte ou Revés", type: "special" },
    { id: 34, name: "Desperdício de Alimentos", type: "property", factorKey: "desperdicioAlimentos", price: 320, rent: 28, owner: null },
    { id: 35, name: "Centro de Dados e Atendimento", type: "station", price: 200, rent: 20, owner: null, fichaType: "discreta" },
    { id: 36, name: "Sorte ou Revés", type: "special" },
    { id: 37, name: "Faturamento", type: "property", factorKey: "faturamento", price: 350, rent: 35, owner: null },
    { id: 38, name: "Taxa de Luxo", type: "special" },
    { id: 39, name: "Lucro Operacional", type: "property", factorKey: "lucroOperacional", price: 400, rent: 50, owner: null }
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
let gameOver = false;

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
            fichasContinua: 0,
            objective: null,
            passedFestaJunina: false,
            finishedYear: false,
            playedThisCycle: false
        });
    }
    assignObjectives();
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
    gameOver = false;
    yearNumber = 1;
    cycleNumber = 0;
    activeExternalCard = null;
    resetFactors();
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
    updateUI();
    const statusDiv = document.getElementById("game-status");
    if (statusDiv && players.length > 0) {
        statusDiv.innerText = `Ano ${yearNumber} iniciado! É a vez de ${players[0].name}. Role os dados!`;
    }
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
        if (player.position === 20) {
            player.passedFestaJunina = true;
        }
        if (player.position === 0) {
            player.finishedYear = true;
            const statusMsg = `📘 ${player.name} cruzou a PARTIDA e entrou no Fechamento do Exercício.`;
            const statusLabel = document.getElementById("game-status");
            if (statusLabel) statusLabel.innerText = statusMsg;
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
            let msg = `${player.name} caiu no fator sob sua própria gerência: ${space.name}.`;
            if (space.fichaType) {
                msg += ` ${player.name} recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)}.`;
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
        const msg = `${player.name} passou pelo ponto de Imposto de Renda. A cobrança ocorrerá no Fechamento Anual.`;
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
    const rentAmount = getEffectiveRent(space);

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

function getEffectiveRent(space) {
    const baseRent = space.rent || 10;
    return Math.max(0, Math.round(baseRent * (1 + (space.eventModifier || 0))));
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
    const rentAmount = getEffectiveRent(space);

    player.money -= rentAmount;
    if (owner) owner.money += rentAmount;

    if (player.money < 0) {
        checkBankruptcy(player, owner ? owner.id : null);
        return;
    }

    const msg = `🔬 ${player.name} pagou $${rentAmount} de taxa de utilização para ${owner ? owner.name : "o Banco"} em ${space.name} e recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    nextTurn();
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
        statusDiv.innerText = `${icon} ${space.name} ($${space.price}) disponível para gerência! Aguardando ${player.name}...${fichaNote}`;
    }
}

function showPurchaseModalUI(player, space) {
    const statusDiv = document.getElementById("game-status");
    if (!statusDiv) return;

    const icon = space.fichaType ? "🔬" : "🏠";
    const fichaNote = space.fichaType
        ? `<div style="margin-bottom: 10px; font-size: 0.8rem; color: #0891b2;">Você recebeu ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType)} por parar aqui.</div>`
        : "";
    statusDiv.innerHTML = `
        <div style="margin-bottom: 10px; background: #1a293d; padding: 10px; border-radius: 6px;">
            ${icon} <strong>${space.name}</strong> disponível por <strong>$${space.price}</strong>.
        </div>
        ${fichaNote}
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
    if (players.length === 0 || gameOver) return;

    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer && !currentPlayer.isBankrupt) currentPlayer.playedThisCycle = true;

    const activePlayers = players.filter(player => !player.isBankrupt);
    if (activePlayers.length <= 1 && players.length > 1) {
        finishGame(activePlayers[0] || players[0], "restaram jogadores ativos");
        return;
    }

    if (activePlayers.length > 0 && activePlayers.every(player => player.finishedYear)) {
        closeAnnualExercise();
        return;
    }

    let cycleMessage = "";
    if (activePlayers.length > 0 && activePlayers.every(player => player.playedThisCycle || player.finishedYear)) {
        cycleNumber += 1;
        activePlayers.forEach(player => { player.playedThisCycle = false; });
        cycleMessage = drawExternalFactorCard();
    }

    let nextIndex = currentPlayerIndex;
    do {
        nextIndex = (nextIndex + 1) % players.length;
    } while (players[nextIndex].isBankrupt || players[nextIndex].finishedYear || players[nextIndex].playedThisCycle);
    currentPlayerIndex = nextIndex;
    awaitingDecision = false;
    updateUI();

    const nextPlayer = players[currentPlayerIndex];
    const msg = `${cycleMessage ? `${cycleMessage} ` : ""}Ciclo ${cycleNumber}, Ano ${yearNumber}: é a vez de ${nextPlayer.name}. Role os dados!`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
}

function finishGame(winner, reason) {
    gameOver = true;
    const msg = `🏆 FIM DE JOGO! ${winner.name} venceu porque ${reason}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
}

function closeAnnualExercise() {
    recalculateFactors();
    const activePlayers = players.filter(player => !player.isBankrupt);
    const fulfilledPlayers = activePlayers.filter(updateObjectiveStatus);

    if (fulfilledPlayers.length === 1) {
        finishGame(fulfilledPlayers[0], "cumpriu integralmente o objetivo");
        return;
    }
    if (fulfilledPlayers.length > 1) {
        const highestMoney = Math.max(...fulfilledPlayers.map(player => player.money));
        const richest = fulfilledPlayers.filter(player => player.money === highestMoney);
        if (richest.length === 1) {
            finishGame(richest[0], "cumpriu o objetivo e terminou com mais dinheiro");
            return;
        }
        const msg = `⚖️ ${richest.map(player => player.name).join(" e ")} empataram no dinheiro após cumprir o objetivo. O desempate ainda não está definido.`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        gameOver = true;
        syncGameState(msg);
        return;
    }

    activePlayers.forEach(player => {
        player.money -= GAME_CONFIG.impostoRenda;
        if (player.money < 0) {
            player.isBankrupt = true;
            boardSpaces.forEach(space => {
                if (space.owner === player.id) space.owner = null;
            });
        }
    });

    const survivors = players.filter(player => !player.isBankrupt);
    if (survivors.length === 1) {
        finishGame(survivors[0], "os demais jogadores não conseguiram pagar o Imposto de Renda");
        return;
    }
    if (survivors.length === 0) {
        gameOver = true;
        const msg = "🏁 O ano terminou sem jogadores sobreviventes.";
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
        return;
    }

    yearNumber += 1;
    cycleNumber = 0;
    activeExternalCard = null;
    externalFactorModifiers = {};
    resetFactors();
    survivors.forEach(player => {
        player.position = 0;
        player.passedFestaJunina = false;
        player.finishedYear = false;
        player.playedThisCycle = false;
    });
    assignObjectives();
    currentPlayerIndex = players.findIndex(player => !player.isBankrupt);
    renderBoard();
    renderPawns();
    updateUI();
    const msg = `📅 Fechamento concluído. Todos pagaram $${GAME_CONFIG.impostoRenda}. Começou o Ano ${yearNumber}.`;
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
        const msg = `🎉 ${player.name} assumiu a gerência de ${space.name}!`;
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
    const msg = `${player.name} não assumiu a gerência de ${space.name}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    awaitingDecision = false;
    syncGameState(msg);
    nextTurn();
}

function hostProcessInterveneFactor(senderPeerId, factorKey, direction) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    const player = players[currentPlayerIndex];
    const definition = FACTOR_DEFINITIONS[factorKey];
    const space = boardSpaces.find(candidate => candidate.factorKey === factorKey);
    if (!player || player.isBankrupt || player.finishedYear || !definition || !definition.control || !space || space.owner !== player.id) return;
    if (isMultiplayer && senderPeerId && player.peerId !== senderPeerId) return;

    const multiplier = direction === "down" ? -1 : 1;
    const nextValue = getFactorValue(factorKey) + multiplier * definition.step;
    if (nextValue < 0 || player.money < definition.cost) return;
    const fichaKey = definition.ficha === "continua" ? "fichasContinua" : "fichasDiscreta";
    if ((player[fichaKey] || 0) < (factorKey === "equipamentosCozinha" || factorKey === "qualidadeIngredientes" || factorKey === "numeroMesas" ? 2 : 1)) return;

    const fichaCost = factorKey === "equipamentosCozinha" || factorKey === "qualidadeIngredientes" || factorKey === "numeroMesas" ? 2 : 1;
    player[fichaKey] -= fichaCost;
    player.money -= definition.cost;
    factorValues[factorKey] = nextValue;
    recalculateFactors();
    space.lastIntervention = multiplier > 0 ? "+" : "-";
    recentChanges.unshift({ player: player.name, factor: definition.name, sign: space.lastIntervention, value: nextValue });
    recentChanges = recentChanges.slice(0, 8);
    const msg = `🛠️ ${player.name} ${multiplier > 0 ? "aumentou" : "reduziu"} ${definition.name} para ${formatFactorValue(factorKey)}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    updateUI();
    syncGameState(msg);
}

function formatFactorValue(factorKey) {
    const value = getFactorValue(factorKey);
    return `${Number.isInteger(value) ? value : value.toFixed(1)} ${FACTOR_DEFINITIONS[factorKey].unit}`;
}

// ==========================================
// SINCRONIZAÇÃO DE REDE (BROADCAST E RECEBIMENTO)
// ==========================================
function syncGameState(statusMessage = null, diceDisplay = null, diceValues = null) {
    if (!isMultiplayer || !window.Network || !window.Network.isHost) return;

    sendNetworkAction("SYNC_GAME_STATE", {
        players: players,
        boardSpaces: boardSpaces.map(s => ({ id: s.id, owner: s.owner, houses: s.houses || 0, lastIntervention: s.lastIntervention || "" })),
        factorValues: factorValues,
        recentChanges: recentChanges,
        yearNumber: yearNumber,
        cycleNumber: cycleNumber,
        activeExternalCard: activeExternalCard,
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

    if (payload.factorValues) factorValues = payload.factorValues;
    if (payload.recentChanges) recentChanges = payload.recentChanges;
    if (payload.yearNumber !== undefined) yearNumber = payload.yearNumber;
    if (payload.cycleNumber !== undefined) cycleNumber = payload.cycleNumber;
    if (payload.activeExternalCard !== undefined) activeExternalCard = payload.activeExternalCard;
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
        fichasContinua: 0,
        objective: null,
        passedFestaJunina: false,
        finishedYear: false,
        playedThisCycle: false
    }));

    assignObjectives();

    resetBoardState();

    if (window.Network && window.Network.isHost) {
        syncGameState("A partida começou! Role os dados.");
    }
};

window.hostProcessRollDice = hostProcessRollDice;
window.hostProcessBuyProperty = hostProcessBuyProperty;
window.hostProcessPassProperty = hostProcessPassProperty;
window.hostProcessInterveneFactor = hostProcessInterveneFactor;
window.applyGameStateSync = applyGameStateSync;
