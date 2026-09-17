/**
 * rules.js
 * Configurações e regras puras do restaurante compartilhado (sem acesso ao DOM).
 *
 * Princípios:
 * - Existe UM único estado de mercado: os níveis dos 11 fatores internos e os valores dos 4 fatores
 *   externos. Todos os jogadores e todas as Cartas de Objetivo usam esse mesmo estado.
 * - A gerência dá direito a intervir no fator, receber a taxa de visita e negociar a gerência.
 *   Ela nunca é exigida para calcular ou cumprir uma Carta de Objetivo.
 *
 * No navegador este arquivo é carregado antes de actions.js/game.js (declarações globais).
 * Em Node ele é importado pelos testes automatizados (module.exports no final).
 */

const GAME_CONFIG = {
    maxJogadores: 4,               // limite de jogadores, no modo local e no online
    startingMoney: 25000,
    fichasIniciaisContinua: 0,     // fichas contínuas de cada jogador no início da partida
    fichasIniciaisDiscreta: 0,     // fichas discretas de cada jogador no início da partida
    impostoRenda: 2000,            // cobrança do Fechamento anual, somente quando ninguém cumpre o objetivo
    multaVigilanciaSanitaria: 1000,
    fiancaPrisao: 500,
    taxaTroca: 200,
    taxaTrocaPercent: 0.10,
    fichasPorVisita: 1,
    custoReducaoNivel: 400,        // reduzir um nível: R$ 400 + 1 ficha do tipo do fator (sem devolução)
    fichasReducaoNivel: 1,
    acrescimoTaxaPorNivel: 0.5,    // cada nível acima do inicial soma 50% da taxa inicial
    pisoTaxaVisita: 0.5,           // abaixo do nível inicial a taxa cai para 50% da inicial (piso)
    pawnMoveStepDelay: 250,        // 200ms originais / 0.8 = 80% da velocidade
    diceRollAnimationDuration: 750,
    cardFichaPenalty: 500
};

const PRESETS = {
    standard: { name: "Padrão", startingMoney: 25000, taxaTroca: 200 },
    fast: { name: "Jogo Rápido", startingMoney: 40000, taxaTroca: 100 },
    hardcore: { name: "Escassez", startingMoney: 15000, taxaTroca: 500 }
};

const MIN_FACTOR_LEVEL = 0;
const MAX_FACTOR_LEVEL = 3;
const PURCHASABLE_TYPES = ["property", "station", "utility"];
const EXTERNAL_KEYS = ["b", "a", "t", "j"];

const RESTAURANT_RULESET = {
    // raiseTo2 também vale para subir do nível 0 ao 1 (a transição não tinha tarifa própria).
    internal: {
        C: { symbol: "C", name: "Número de Cozinheiros", boardName: "Número de Cozinheiros", values: [2, 3, 4, 5], initialLevel: 1, unit: "cozinheiros", unitSingular: "cozinheiro", ficha: "discreta", price: 3500, baseFee: 350, raiseTo2: { money: 800, fichas: 1 }, raiseTo3: { money: 1400, fichas: 2 } },
        Ec: { symbol: "Ec", name: "Equipamentos de Cozinha", boardName: "Equipamentos de Cozinha", values: [1, 2, 3, 4], initialLevel: 1, unit: "equipamentos", unitSingular: "equipamento", ficha: "discreta", price: 4000, baseFee: 400, raiseTo2: { money: 1200, fichas: 1 }, raiseTo3: { money: 2000, fichas: 2 } },
        Es: { symbol: "Es", name: "Equipamentos do Salão", boardName: "Equipamentos do Salão", values: [3, 4, 5, 6], initialLevel: 1, unit: "equipamentos", unitSingular: "equipamento", ficha: "discreta", price: 3200, baseFee: 320, raiseTo2: { money: 900, fichas: 1 }, raiseTo3: { money: 1500, fichas: 2 } },
        M: { symbol: "M", name: "Orçamento de Marketing", boardName: "Orçamento de Marketing", values: [1000, 2000, 3000, 4000], initialLevel: 2, format: "money", ficha: "continua", price: 3500, baseFee: 350, raiseTo2: { money: 1000, fichas: 1 }, raiseTo3: { money: 1700, fichas: 2 } },
        P: { symbol: "P", name: "Preço Médio dos Pratos", boardName: "Preço Médio dos Pratos", values: [37, 40, 43, 46], initialLevel: 1, format: "money", ficha: "continua", price: 4000, baseFee: 400, raiseTo2: { money: 700, fichas: 1 }, raiseTo3: { money: 1100, fichas: 2 } },
        V: { symbol: "V", name: "Variedade do Cardápio", boardName: "Variedade do Cardápio", values: [4, 5, 6, 7], initialLevel: 2, unit: "pratos", unitSingular: "prato", ficha: "discreta", price: 2800, baseFee: 280, raiseTo2: { money: 650, fichas: 1 }, raiseTo3: { money: 1100, fichas: 2 } },
        S: { symbol: "S", name: "Capacidade do Estoque", boardName: "Capacidade do Estoque", values: [80, 100, 120, 140], initialLevel: 1, unit: "kg", unitSingular: "kg", ficha: "continua", price: 3800, baseFee: 380, raiseTo2: { money: 900, fichas: 1 }, raiseTo3: { money: 1500, fichas: 2 } },
        Q: { symbol: "Q", name: "Qualidade dos Ingredientes", boardName: "Qualidade dos Ingredientes", values: [1, 2, 3, 4], initialLevel: 2, unit: "pontos de qualidade", unitSingular: "ponto de qualidade", ficha: "discreta", fichaNote: "ficha discreta por convenção; a qualidade é uma escala ordinal", price: 3000, baseFee: 300, raiseTo2: { money: 800, fichas: 1 }, raiseTo3: { money: 1300, fichas: 2 } },
        N: { symbol: "N", name: "Número de Funcionários do Salão", boardName: "Funcionários do Salão", values: [2, 3, 4, 5], initialLevel: 1, unit: "funcionários", unitSingular: "funcionário", ficha: "discreta", price: 3300, baseFee: 330, raiseTo2: { money: 850, fichas: 1 }, raiseTo3: { money: 1400, fichas: 2 } },
        H: { symbol: "H", name: "Tempo Diário de Operação", boardName: "Tempo Diário de Operação", values: [6, 8, 10, 12], initialLevel: 1, unit: "h", unitSingular: "h", ficha: "continua", price: 3300, baseFee: 330, raiseTo2: { money: 800, fichas: 1 }, raiseTo3: { money: 1300, fichas: 2 } },
        I: { symbol: "I", name: "Quantidade de Ingredientes Comprados", boardName: "Ingredientes Comprados", values: [40, 60, 70, 80], initialLevel: 1, unit: "kg", unitSingular: "kg", ficha: "continua", price: 3000, baseFee: 300, raiseTo2: { money: 750, fichas: 1 }, raiseTo3: { money: 1250, fichas: 2 } }
    },
    // t e j são guardados como fração (0,10 e 0,12) e exibidos como porcentagem.
    external: {
        b: { symbol: "b", name: "Combustível", unit: "por litro", base: 6, format: "money" },
        a: { symbol: "a", name: "Alimentos", unit: "por kg", base: 20, format: "money" },
        t: { symbol: "t", name: "Imposto", unit: "alíquota", base: 0.10, format: "percent" },
        j: { symbol: "j", name: "Taxa Básica de Juros", unit: "ao ano", base: 0.12, format: "percent" }
    },
    objectiveCards: [
        { id: 1, name: "Cozinha de alto rendimento", symbol: "CR", factors: ["C", "Ec"], formula: "CR = 12 × C × Ec", target: 180, operator: ">=", format: "number", unit: "pratos por dia", evaluate: (internal) => 12 * internal.C * internal.Ec },
        { id: 2, name: "Salão preparado", symbol: "SP", factors: ["H", "N", "Es"], formula: "SP = H × (2 × N + Es)", target: 125, operator: ">=", format: "number", unit: "clientes por dia", evaluate: (internal) => internal.H * (2 * internal.N + internal.Es) },
        { id: 3, name: "Marca fortalecida", symbol: "MF", factors: ["M", "V", "Q"], formula: "MF = M / 1000 + V + 2 × Q", target: 18, operator: ">=", format: "number", unit: "pontos", note: "Índice fictício, expresso em pontos.", evaluate: (internal) => internal.M / 1000 + internal.V + 2 * internal.Q },
        { id: 4, name: "Frete inteligente", symbol: "FI", factors: ["b", "I", "S"], formula: "FI = 100 + 5 × b + 2 × I − S", target: 90, operator: "<=", format: "money", unit: "", note: "Os coeficientes são parâmetros econômicos do modelo, em unidades monetárias.", evaluate: (internal, external) => 100 + 5 * external.b + 2 * internal.I - internal.S },
        { id: 5, name: "Margem bruta do lote-padrão", symbol: "MB", factors: ["P", "I", "a"], formula: "MB = 50 × P − I × a", target: 1300, operator: ">=", format: "money", unit: "", note: "Lote-padrão de 50 refeições com 0,8 kg de ingredientes por refeição; a quantidade mínima (40 kg) comporta o lote.", evaluate: (internal, external) => 50 * internal.P - internal.I * external.a },
        { id: 6, name: "Capital enxuto", symbol: "CE", factors: ["j", "Ec", "Es"], formula: "CE = j × (2000 × Ec + 1000 × Es)", target: 650, operator: "<=", format: "money", unit: "por ano", note: "Custo anual de oportunidade do capital imobilizado nos equipamentos. Não é descontado do caixa.", evaluate: (internal, external) => external.j * (2000 * internal.Ec + 1000 * internal.Es) },
        { id: 7, name: "Receita potencial líquida", symbol: "RP", factors: ["P", "H", "t"], formula: "RP = 6 × P × H × (1 − t)", target: 2700, operator: ">=", format: "money", unit: "por dia", note: "Cenário-padrão de seis refeições por hora. Receita potencial, não faturamento acumulado.", evaluate: (internal, external) => 6 * internal.P * internal.H * (1 - external.t) },
        { id: 8, name: "Atratividade comercial", symbol: "AC", factors: ["M", "V", "Q", "P"], formula: "AC = M / 1000 + V + Q + (50 − P) / 5", target: 16, operator: ">=", format: "number", unit: "pontos", note: "Índice fictício, expresso em pontos.", evaluate: (internal) => internal.M / 1000 + internal.V + internal.Q + (50 - internal.P) / 5 }
    ],
    // percent: variação sobre o valor-base (b e a). set: novo valor absoluto (t e j).
    // Textos e percentuais são situações fictícias criadas para o jogo.
    fluencyCards: [
        { id: "combustiveis", name: "Combustíveis",
            first: { text: "Uma restrição temporária no abastecimento pressiona os preços.", percent: { b: 0.10 } },
            second: { text: "As viagens de fim de ano ampliam a procura por combustível.", percent: { b: 0.15 } } },
        { id: "agricultura", name: "Agricultura",
            first: { text: "Problemas climáticos prejudicam parte da safra.", percent: { a: 0.10 } },
            second: { text: "Uma nova safra amplia a oferta de produtos.", percent: { a: -0.08 } } },
        { id: "movimento-de-cargas", name: "Movimento de cargas",
            first: { text: "Dificuldades na distribuição pressionam transporte e abastecimento.", percent: { b: 0.08, a: 0.05 } },
            second: { text: "O aumento da circulação de veículos pressiona os combustíveis.", percent: { b: 0.12 } } },
        { id: "fornecimento", name: "Fornecimento",
            first: { text: "Problemas na entrega de insumos elevam os preços de compra.", percent: { a: 0.05 } },
            second: { text: "A regularização do fornecimento reduz os preços.", percent: { a: -0.05 } } },
        { id: "turismo", name: "Turismo",
            first: { text: "O aumento temporário da procura por alimentos na região pressiona os preços.", percent: { a: 0.05 } },
            second: { text: "A alta temporada amplia o consumo de alimentos e combustíveis.", percent: { a: 0.05, b: 0.10 } } },
        { id: "clima", name: "Clima",
            first: { text: "Chuvas intensas comprometem o transporte da produção agrícola.", percent: { a: 0.08 } },
            second: { text: "Uma estiagem reduz a oferta de produtos agrícolas.", percent: { a: 0.12 } } },
        { id: "economia", name: "Economia",
            first: { text: "Uma elevação generalizada dos custos pressiona insumos.", percent: { b: 0.05, a: 0.05 } },
            second: { text: "A pressão inflacionária encarece alimentos e há elevação simulada dos juros.", percent: { a: 0.10 }, set: { j: 0.13 } } },
        { id: "politica-economica", name: "Política econômica",
            first: { text: "Um programa fictício de incentivo tributário reduz a alíquota efetiva.", set: { t: 0.09 } },
            second: { text: "Uma mudança tributária no cenário simulado eleva a alíquota.", set: { t: 0.11 } } },
        { id: "politica-monetaria", name: "Política monetária",
            first: { text: "Uma decisão simulada eleva a taxa básica de juros.", set: { j: 0.13 } },
            second: { text: "Uma decisão simulada reduz a taxa básica de juros.", set: { j: 0.11 } } }
    ]
};

// Tabuleiro de 24 casas. As casas de fator recebem nome e preço de RESTAURANT_RULESET.internal.
// Cada um dos 4 lados tem uma casa "Sorte ou Revés" e um Centro de Observação.
// Os fatores externos não ocupam casas: ficam no painel central.
const OBSERVATION_CENTER = { name: "Centro de Observação", type: "station", price: 3000, rent: 300 };

const BOARD_LAYOUT = [
    { id: 0, name: "PARTIDA", type: "special", cssClass: "corner-space" },
    { id: 1, type: "property", factorKey: "C" },
    { id: 2, name: "Sorte ou Revés", type: "special" },
    { id: 3, type: "property", factorKey: "Ec" },
    { id: 4, ...OBSERVATION_CENTER, fichaType: "discreta" },
    { id: 5, type: "property", factorKey: "M" },
    { id: 6, name: "FESTA JUNINA", type: "special", cssClass: "corner-space" },
    { id: 7, type: "property", factorKey: "P" },
    { id: 8, ...OBSERVATION_CENTER, fichaType: "continua" },
    { id: 9, type: "property", factorKey: "S" },
    { id: 10, name: "Sorte ou Revés", type: "special" },
    { id: 11, type: "property", factorKey: "V" },
    { id: 12, name: "PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 13, type: "property", factorKey: "Q" },
    { id: 14, type: "property", factorKey: "N" },
    { id: 15, ...OBSERVATION_CENTER, fichaType: "discreta" },
    { id: 16, type: "property", factorKey: "Es" },
    { id: 17, name: "Sorte ou Revés", type: "special" },
    { id: 18, name: "VÁ PARA A PRISÃO", type: "special", cssClass: "corner-space" },
    { id: 19, type: "property", factorKey: "H" },
    { id: 20, ...OBSERVATION_CENTER, fichaType: "continua" },
    { id: 21, type: "property", factorKey: "I" },
    { id: 22, name: "Sorte ou Revés", type: "special" },
    { id: 23, name: "Multa da Vigilância Sanitária", type: "special" }
];

// ==========================================
// FORMATAÇÃO (somente para exibição; comparações usam os valores numéricos brutos)
// ==========================================
function formatNumber(value, maxDecimals = 2) {
    return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals });
}

function formatMoney(value, options = {}) {
    const digits = options.cents ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 };
    const amount = Number(value);
    return `${amount < 0 ? "−" : ""}R$ ${Math.abs(amount).toLocaleString("pt-BR", digits)}`;
}

function formatPercent(fraction) {
    return `${formatNumber(fraction * 100, 2)}%`;
}

function fichaTypeLabel(fichaType) {
    return fichaType === "continua" ? "Contínua" : "Discreta";
}

function formatFichas(amount, fichaType) {
    const type = fichaTypeLabel(fichaType).toLowerCase();
    return `${amount} ${amount === 1 ? "ficha" : "fichas"} ${amount === 1 ? type : type.replace(/a$/, "as")}`;
}

function formatInternalValue(factorKey, value) {
    const definition = RESTAURANT_RULESET.internal[factorKey];
    if (!definition) return formatNumber(value);
    if (definition.format === "money") return formatMoney(value);
    const unit = value === 1 && definition.unitSingular ? definition.unitSingular : definition.unit;
    return `${formatNumber(value)} ${unit}`;
}

function formatExternalValue(key, value) {
    const definition = RESTAURANT_RULESET.external[key];
    if (!definition) return formatNumber(value);
    return definition.format === "percent" ? formatPercent(value) : formatMoney(value, { cents: true });
}

function formatOperator(operator) {
    return operator === "<=" ? "≤" : "≥";
}

function formatObjectiveValue(card, value) {
    const base = card.format === "money" ? formatMoney(value) : formatNumber(value);
    return card.unit ? `${base} ${card.unit}` : base;
}

// ==========================================
// ESTADO GLOBAL DO MERCADO
// ==========================================
function getFactorDefinition(factorKey) {
    return RESTAURANT_RULESET.internal[factorKey] || null;
}

function getBaseExternal() {
    const base = {};
    EXTERNAL_KEYS.forEach(key => { base[key] = RESTAURANT_RULESET.external[key].base; });
    return base;
}

function getInitialMarketState() {
    const levels = {};
    Object.keys(RESTAURANT_RULESET.internal).forEach(key => { levels[key] = RESTAURANT_RULESET.internal[key].initialLevel; });
    return { levels, external: getBaseExternal(), previousExternal: null, activeCard: null };
}

// Valores dos fatores internos derivados dos níveis globais (não existem cópias por jogador).
function getInternalValues(market) {
    const internal = {};
    Object.keys(RESTAURANT_RULESET.internal).forEach(key => {
        internal[key] = RESTAURANT_RULESET.internal[key].values[market.levels[key]];
    });
    return internal;
}

function getFactorValue(market, key) {
    if (RESTAURANT_RULESET.internal[key]) return RESTAURANT_RULESET.internal[key].values[market.levels[key]];
    return market.external[key];
}

// Ao virar o ano: mercado volta aos valores-base e o evento termina; os níveis internos são mantidos.
function startNewYearMarket(market) {
    return { levels: { ...market.levels }, external: getBaseExternal(), previousExternal: null, activeCard: null };
}

// ==========================================
// CARTAS DE OBJETIVO
// ==========================================
function findObjectiveCard(idOrName) {
    return RESTAURANT_RULESET.objectiveCards.find(card => card.id === idOrName || card.name === idOrName) || null;
}

function createObjectiveDeck() {
    return RESTAURANT_RULESET.objectiveCards.map(card => ({ ...card }));
}

// Distribuição do sistema existente: o jogador de índice i recebe a carta i (circular).
// O jogador guarda apenas a identificação da carta; o resultado é sempre recalculado do estado global.
function assignObjectiveCards(players) {
    const cards = RESTAURANT_RULESET.objectiveCards;
    players.forEach((player, index) => { player.objective = { id: cards[index % cards.length].id }; });
}

function calculateObjective(cardIdOrName, market) {
    const card = findObjectiveCard(cardIdOrName);
    if (!card) return null;
    const internal = getInternalValues(market);
    const result = card.evaluate(internal, market.external);
    const fulfilled = card.operator === "<=" ? result <= card.target : result >= card.target;
    const factorValues = card.factors.map(symbol => {
        const isInternal = Boolean(RESTAURANT_RULESET.internal[symbol]);
        const value = isInternal ? internal[symbol] : market.external[symbol];
        return {
            symbol,
            name: isInternal ? RESTAURANT_RULESET.internal[symbol].name : RESTAURANT_RULESET.external[symbol].name,
            value,
            formatted: isInternal ? formatInternalValue(symbol, value) : formatExternalValue(symbol, value)
        };
    });
    return { id: card.id, name: card.name, symbol: card.symbol, formula: card.formula, factors: [...card.factors], target: card.target, operator: card.operator, format: card.format, unit: card.unit, note: card.note || "", result, fulfilled, factorValues };
}

function evaluateAllObjectives(market) {
    return RESTAURANT_RULESET.objectiveCards.map(card => calculateObjective(card.id, market));
}

// ==========================================
// CARTAS DE FLUÊNCIA E SEMESTRES
// ==========================================
function normalizeText(text) {
    return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findFluencyCard(idOrName) {
    const wanted = normalizeText(idOrName);
    return RESTAURANT_RULESET.fluencyCards.find(card => normalizeText(card.id) === wanted || normalizeText(card.name) === wanted) || null;
}

function normalizeSemester(semester) {
    const value = normalizeText(semester);
    return value === "segundo" || value === "second" || value === "segundosemestre" ? "segundo" : "primeiro";
}

// Segundo semestre só começa quando TODOS os jogadores ativos já passaram pela Festa Junina.
function getCurrentSemester(players) {
    const active = players.filter(player => !player.isBankrupt);
    return active.length > 0 && active.every(player => player.passedFestaJunina) ? "segundo" : "primeiro";
}

// Aplica somente a carta atual sobre os valores-base (sem acumular eventos anteriores).
function applyFluencyCard(market, cardIdOrName, semester) {
    const card = findFluencyCard(cardIdOrName);
    if (!card) throw new Error(`Carta de Fluência inexistente: ${cardIdOrName}`);
    const semesterKey = normalizeSemester(semester);
    const effect = semesterKey === "segundo" ? card.second : card.first;
    const base = getBaseExternal();
    const external = { ...base };
    Object.entries(effect.percent || {}).forEach(([key, percent]) => {
        external[key] = Math.round(base[key] * (1 + percent) * 100) / 100;
    });
    Object.entries(effect.set || {}).forEach(([key, value]) => { external[key] = value; });
    return {
        levels: { ...market.levels },
        external,
        previousExternal: { ...market.external },
        activeCard: { id: card.id, name: card.name, semester: semesterKey, text: effect.text, percent: { ...(effect.percent || {}) }, set: { ...(effect.set || {}) } }
    };
}

function drawFluencyCard(market, players, random = Math.random) {
    const cards = RESTAURANT_RULESET.fluencyCards;
    const card = cards[Math.floor(random() * cards.length) % cards.length];
    return applyFluencyCard(market, card.id, getCurrentSemester(players));
}

function semesterLabel(semester) {
    return normalizeSemester(semester) === "segundo" ? "Segundo semestre" : "Primeiro semestre";
}

function describeFluencyEffects(activeCard) {
    if (!activeCard) return [];
    const parts = [];
    Object.entries(activeCard.percent || {}).forEach(([key, percent]) => {
        parts.push(`${RESTAURANT_RULESET.external[key].name} ${percent > 0 ? "+" : "−"}${formatNumber(Math.abs(percent) * 100)}%`);
    });
    Object.entries(activeCard.set || {}).forEach(([key, value]) => {
        parts.push(`${RESTAURANT_RULESET.external[key].name} passa de ${formatExternalValue(key, RESTAURANT_RULESET.external[key].base)} para ${formatExternalValue(key, value)}`);
    });
    return parts;
}

// ==========================================
// TABULEIRO, TAXAS E GERÊNCIAS
// ==========================================
function createBoardSpaces() {
    return BOARD_LAYOUT.map(entry => {
        const space = { ...entry };
        if (entry.factorKey) {
            const definition = RESTAURANT_RULESET.internal[entry.factorKey];
            space.name = definition.boardName;
            space.price = definition.price;
        }
        if (PURCHASABLE_TYPES.includes(space.type)) space.owner = null;
        return space;
    });
}

function getVisitFee(factorKey, level, config = GAME_CONFIG) {
    const definition = RESTAURANT_RULESET.internal[factorKey];
    const multiplier = Math.max(config.pisoTaxaVisita, 1 + config.acrescimoTaxaPorNivel * (level - definition.initialLevel));
    return Math.round(definition.baseFee * multiplier);
}

function getSpaceVisitFee(space, market, config = GAME_CONFIG) {
    if (space.factorKey) return getVisitFee(space.factorKey, market.levels[space.factorKey], config);
    return space.rent || 0;
}

function validateManagementPurchase(ctx, playerId, spaceId) {
    const player = ctx.players.find(candidate => candidate.id === playerId);
    const space = ctx.boardSpaces.find(candidate => candidate.id === spaceId);
    if (!player || player.isBankrupt) return { ok: false, error: "Jogador inválido." };
    if (!space || !PURCHASABLE_TYPES.includes(space.type)) return { ok: false, error: "Esta casa não possui gerência." };
    if (space.owner !== null && space.owner !== undefined) return { ok: false, error: `${space.name} já possui gerente.` };
    if (player.money < space.price) return { ok: false, error: `Saldo insuficiente para adquirir ${space.name} (${formatMoney(space.price)}).` };
    return { ok: true, player, space };
}

// Compra pelo preço integral. Não concede fichas nem altera o nível do fator.
function purchaseManagement(ctx, playerId, spaceId) {
    const validation = validateManagementPurchase(ctx, playerId, spaceId);
    if (!validation.ok) return validation;
    validation.player.money -= validation.space.price;
    validation.space.owner = validation.player.id;
    return validation;
}

// Jogador eliminado perde as gerências, que voltam a ficar disponíveis. Os níveis dos fatores não mudam.
function releaseManagements(boardSpaces, playerId) {
    const released = [];
    boardSpaces.forEach(space => {
        if (space.owner === playerId) {
            space.owner = null;
            released.push(space);
        }
    });
    return released;
}

// Cobrança obrigatória (taxa de visita, multa, penalidade de carta): se o saldo ficar negativo,
// o jogador é eliminado na hora e suas gerências voltam a ficar disponíveis.
function applyMandatoryCharge(player, amount, boardSpaces) {
    player.money -= amount;
    if (player.money >= 0) return { eliminated: false, released: [] };
    player.isBankrupt = true;
    return { eliminated: true, released: releaseManagements(boardSpaces, player.id) };
}

// ==========================================
// INTERVENÇÕES
// ==========================================
function getInterventionCost(factorKey, fromLevel, toLevel, config = GAME_CONFIG) {
    const definition = RESTAURANT_RULESET.internal[factorKey];
    if (!definition) return { ok: false, error: "Fator interno inexistente." };
    if (!Number.isInteger(toLevel) || toLevel < MIN_FACTOR_LEVEL || toLevel > MAX_FACTOR_LEVEL) {
        return { ok: false, error: `Nível fora do intervalo permitido (${MIN_FACTOR_LEVEL} a ${MAX_FACTOR_LEVEL}).` };
    }
    if (toLevel === fromLevel) return { ok: false, error: "Nenhuma alteração de nível." };

    let money = 0;
    let fichas = 0;
    if (toLevel > fromLevel) {
        for (let level = fromLevel + 1; level <= toLevel; level++) {
            const step = level === MAX_FACTOR_LEVEL ? definition.raiseTo3 : definition.raiseTo2;
            money += step.money;
            fichas += step.fichas;
        }
    } else {
        const levels = fromLevel - toLevel;
        money = levels * config.custoReducaoNivel;
        fichas = levels * config.fichasReducaoNivel;
    }
    return { ok: true, money, fichas, fichaType: definition.ficha, direction: toLevel > fromLevel ? "up" : "down" };
}

// ctx: { market, players, boardSpaces, currentPlayerId, turnLocked }
function validateIntervention(ctx, playerId, factorKey, delta, config = GAME_CONFIG) {
    const definition = RESTAURANT_RULESET.internal[factorKey];
    if (!definition) return { ok: false, error: "Fator interno inexistente." };
    const step = Number(delta);
    if (!Number.isInteger(step) || step === 0) return { ok: false, error: "Alteração de nível inválida." };
    const player = ctx.players.find(candidate => candidate.id === playerId);
    if (!player || player.isBankrupt) return { ok: false, error: "Jogador inválido." };
    if (ctx.currentPlayerId !== playerId) return { ok: false, error: "A intervenção só pode ser feita durante a própria vez." };
    if (player.finishedYear) return { ok: false, error: `${player.name} já está no Fechamento do Exercício.` };
    if (ctx.turnLocked) return { ok: false, error: "Aguarde a ação em andamento terminar." };
    const space = ctx.boardSpaces.find(candidate => candidate.factorKey === factorKey);
    if (!space || space.owner !== playerId) return { ok: false, error: `Somente o gerente de ${definition.name} pode intervir nesse fator.` };

    const fromLevel = ctx.market.levels[factorKey];
    const toLevel = fromLevel + step;
    const cost = getInterventionCost(factorKey, fromLevel, toLevel, config);
    if (!cost.ok) return cost;
    if (player.money < cost.money) return { ok: false, error: `Saldo insuficiente: a intervenção custa ${formatMoney(cost.money)}.` };
    const fichaField = definition.ficha === "continua" ? "fichasContinua" : "fichasDiscreta";
    if ((player[fichaField] || 0) < cost.fichas) return { ok: false, error: `Fichas insuficientes: são necessárias ${formatFichas(cost.fichas, definition.ficha)}.` };
    return { ok: true, player, space, definition, fromLevel, toLevel, cost, fichaField };
}

function applyIntervention(ctx, playerId, factorKey, delta, config = GAME_CONFIG) {
    const validation = validateIntervention(ctx, playerId, factorKey, delta, config);
    if (!validation.ok) return validation;
    const { player, definition, fromLevel, toLevel, cost, fichaField } = validation;
    player.money -= cost.money;
    player[fichaField] -= cost.fichas;
    ctx.market.levels = { ...ctx.market.levels, [factorKey]: toLevel };
    const change = {
        playerId: player.id,
        playerName: player.name,
        factorKey,
        symbol: definition.symbol,
        factorName: definition.name,
        direction: cost.direction,
        fromLevel,
        toLevel,
        fromValue: definition.values[fromLevel],
        toValue: definition.values[toLevel],
        money: cost.money,
        fichas: cost.fichas,
        fichaType: cost.fichaType
    };
    return { ok: true, change };
}

// ==========================================
// MOVIMENTO, TURNOS E FECHAMENTO ANUAL
// ==========================================
function createPlayerState({ id, name, color = null, peerId = null }, config = GAME_CONFIG) {
    return {
        id,
        peerId,
        name,
        color,
        money: config.startingMoney,
        position: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        fichasDiscreta: config.fichasIniciaisDiscreta,
        fichasContinua: config.fichasIniciaisContinua,
        objective: null,
        passedFestaJunina: false,
        finishedYear: false,
        playedThisCycle: false
    };
}

// Avança uma casa. Passar pela Festa Junina já conta; cruzar a PARTIDA conclui a volta do ano.
function stepPlayerForward(player, boardSpaces) {
    player.position = (player.position + 1) % boardSpaces.length;
    const festaJuninaIndex = boardSpaces.findIndex(space => space.name === "FESTA JUNINA");
    if (player.position === festaJuninaIndex) player.passedFestaJunina = true;
    const completedLap = player.position === 0;
    if (completedLap) player.finishedYear = true;
    return { position: player.position, completedLap };
}

// Decide o que acontece após o fim de um turno. O fechamento anual tem prioridade sobre o fim de
// ciclo, para que nenhuma Carta de Fluência seja aplicada entre a última jogada e a verificação das metas.
function resolveTurnAdvance(players, currentIndex) {
    const current = players[currentIndex];
    if (current && !current.isBankrupt) current.playedThisCycle = true;

    const active = players.filter(player => !player.isBankrupt);
    if (players.length > 1 && active.length <= 1) return { type: "lastStanding", winner: active[0] || null };
    if (active.length > 0 && active.every(player => player.finishedYear)) return { type: "closeYear" };

    let cycleEnded = false;
    if (active.every(player => player.playedThisCycle || player.finishedYear)) {
        cycleEnded = true;
        active.forEach(player => { player.playedThisCycle = false; });
    }

    let nextIndex = currentIndex;
    do {
        nextIndex = (nextIndex + 1) % players.length;
    } while (players[nextIndex].isBankrupt || players[nextIndex].finishedYear || players[nextIndex].playedThisCycle);
    return { type: cycleEnded ? "cycleEnd" : "nextPlayer", nextIndex };
}

function resolveAnnualClosing(players, market, config = GAME_CONFIG) {
    const active = players.filter(player => !player.isBankrupt);
    const results = active.map(player => ({ player, objective: player.objective ? calculateObjective(player.objective.id, market) : null }));
    const fulfilled = results.filter(entry => entry.objective && entry.objective.fulfilled).map(entry => entry.player);

    if (fulfilled.length === 1) return { type: "winner", reason: "objective", winners: fulfilled, results, eliminated: [], charged: false };
    if (fulfilled.length > 1) {
        // Não há desempate por patrimônio definido no jogo: empate absoluto em dinheiro é declarado como empate.
        const highestMoney = Math.max(...fulfilled.map(player => player.money));
        const richest = fulfilled.filter(player => player.money === highestMoney);
        if (richest.length === 1) return { type: "winner", reason: "objective-money", winners: richest, results, eliminated: [], charged: false };
        return { type: "tie", winners: richest, results, eliminated: [], charged: false };
    }

    const eliminated = [];
    active.forEach(player => {
        player.money -= config.impostoRenda;
        if (player.money < 0) {
            player.isBankrupt = true;
            eliminated.push(player);
        }
    });
    const survivors = players.filter(player => !player.isBankrupt);
    if (survivors.length === 1) return { type: "survivor", winners: survivors, results, eliminated, charged: true };
    if (survivors.length === 0) return { type: "noSurvivors", winners: [], results, eliminated, charged: true };
    return { type: "newYear", winners: [], results, eliminated, charged: true };
}

// Resumo final da partida: vencedores primeiro, depois jogadores ativos por dinheiro, eliminados por último.
function buildFinalStandings(players, market, winnerIds = []) {
    const rows = players.map(player => {
        const objective = player.objective ? calculateObjective(player.objective.id, market) : null;
        return {
            id: player.id,
            name: player.name,
            color: player.color,
            money: player.money,
            eliminated: player.isBankrupt,
            winner: winnerIds.includes(player.id),
            objective: objective ? {
                name: objective.name,
                symbol: objective.symbol,
                fulfilled: objective.fulfilled,
                resultText: `${objective.symbol} = ${formatObjectiveValue(objective, objective.result)}`,
                targetText: `meta ${formatOperator(objective.operator)} ${formatObjectiveValue(objective, objective.target)}`
            } : null
        };
    });
    const rank = row => (row.winner ? 0 : row.eliminated ? 2 : 1);
    return rows.sort((a, b) => rank(a) - rank(b) || b.money - a.money);
}

// ==========================================
// MULTIPLAYER: DESCARTE DE REQUISIÇÕES REPETIDAS
// ==========================================
function createRequestDeduper(limit = 500) {
    const seen = new Set();
    const order = [];
    return function isDuplicate(requestId) {
        if (!requestId) return false;
        if (seen.has(requestId)) return true;
        seen.add(requestId);
        order.push(requestId);
        if (order.length > limit) seen.delete(order.shift());
        return false;
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        GAME_CONFIG,
        PRESETS,
        MIN_FACTOR_LEVEL,
        MAX_FACTOR_LEVEL,
        PURCHASABLE_TYPES,
        EXTERNAL_KEYS,
        RESTAURANT_RULESET,
        BOARD_LAYOUT,
        formatNumber,
        formatMoney,
        formatPercent,
        fichaTypeLabel,
        formatFichas,
        formatInternalValue,
        formatExternalValue,
        formatOperator,
        formatObjectiveValue,
        getFactorDefinition,
        getBaseExternal,
        getInitialMarketState,
        getInternalValues,
        getFactorValue,
        startNewYearMarket,
        findObjectiveCard,
        createObjectiveDeck,
        assignObjectiveCards,
        calculateObjective,
        evaluateAllObjectives,
        findFluencyCard,
        getCurrentSemester,
        applyFluencyCard,
        drawFluencyCard,
        semesterLabel,
        describeFluencyEffects,
        createBoardSpaces,
        getVisitFee,
        getSpaceVisitFee,
        validateManagementPurchase,
        purchaseManagement,
        releaseManagements,
        applyMandatoryCharge,
        getInterventionCost,
        validateIntervention,
        applyIntervention,
        createPlayerState,
        stepPlayerForward,
        resolveTurnAdvance,
        resolveAnnualClosing,
        buildFinalStandings,
        createRequestDeduper
    };
}
