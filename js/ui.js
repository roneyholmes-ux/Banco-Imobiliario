/**
 * ui.js
 * Desenha e sincroniza os elementos visuais do tabuleiro e painéis.
 * Todos os valores exibidos vêm do estado global do mercado (marketState); nada é copiado por jogador.
 */

let expandedPlayerIds = new Set();
let gameResultDismissed = false;
const GAME_ANIMATION_MULTIPLIERS = {
    fast: 0.56,
    normal: 0.8,
    unit: 1,
    medium: 1.2,
    long: 2.8,
    confirm: 2.48,
    shine: 2.6,
    toast: 0.72,
    toastHold: 6.8,
    setupFallback: 1.28
};

function applyGameAnimationTimingVariables() {
    const style = document.documentElement.style;
    Object.entries(GAME_ANIMATION_MULTIPLIERS).forEach(([name, multiplier]) => {
        const cssName = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        style.setProperty(`--game-animation-${cssName}`, `${getAnimationDuration(multiplier)}ms`);
    });
}

applyGameAnimationTimingVariables();

let diceRollAudio = null;
let managementBellAudio = null;
let managementBellCutoffTimer = null;
let managementBellPlaybackId = 0;

function playDiceRollSound() {
    if (!diceRollAudio) {
        diceRollAudio = new Audio("assets/sounds/dice-roll.mp3?v=20261012-local-build-2");
        diceRollAudio.preload = "auto";
    }

    diceRollAudio.pause();
    diceRollAudio.currentTime = 0;
    const playback = diceRollAudio.play();
    if (playback) playback.catch(() => {});
}

function playManagementBellSound() {
    if (!managementBellAudio) {
        managementBellAudio = new Audio("assets/sounds/management-bell.mp3?v=20261012-bell-chime-2");
        managementBellAudio.preload = "auto";
    }

    managementBellPlaybackId += 1;
    const playbackId = managementBellPlaybackId;
    window.clearTimeout(managementBellCutoffTimer);
    managementBellAudio.pause();
    managementBellAudio.currentTime = 0;

    const playback = managementBellAudio.play();
    if (playback) {
        playback.then(() => {
            if (playbackId !== managementBellPlaybackId) return;
            managementBellCutoffTimer = window.setTimeout(() => {
                if (playbackId === managementBellPlaybackId && !managementBellAudio.paused) {
                    managementBellAudio.pause();
                    managementBellAudio.currentTime = 0;
                }
            }, 4000);
        }).catch(() => {});
    }
}

function initGameNavbarAutoHide() {
    const navbar = document.querySelector(".game-page .navbar");
    if (!navbar || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let hideTimeout = null;
    const reveal = () => {
        window.clearTimeout(hideTimeout);
        navbar.classList.add("is-revealed");
    };
    const hide = () => {
        window.clearTimeout(hideTimeout);
        if (!navbar.matches(":hover") && !navbar.contains(document.activeElement)) {
            navbar.classList.remove("is-revealed");
        }
    };
    const scheduleHide = () => {
        window.clearTimeout(hideTimeout);
        hideTimeout = window.setTimeout(hide, getAnimationDuration(1.6));
    };

    document.addEventListener("mousemove", event => {
        if (event.clientY <= 16) reveal();
        else if (!navbar.matches(":hover") && !navbar.contains(document.activeElement)) scheduleHide();
    });
    navbar.addEventListener("mouseenter", reveal);
    navbar.addEventListener("mouseleave", scheduleHide);
    navbar.addEventListener("focusin", reveal);
    navbar.addEventListener("focusout", event => {
        if (!navbar.contains(event.relatedTarget)) scheduleHide();
    });
}

initGameNavbarAutoHide();

const SPECIAL_SPACE_DESCRIPTIONS = {
    "PARTIDA": "Cruzar a PARTIDA conclui a volta do ano e leva ao Fechamento do Exercício.",
    "Sorte ou Revés": "Carta com situação do restaurante e uma questão de múltipla escolha.",
    "FESTA JUNINA": "Divide o ano: quando todos os jogadores ativos passarem por aqui, começa o segundo semestre.",
    "PRISÃO": "Quem estiver preso paga a fiança na próxima vez para voltar a jogar.",
    "VÁ PARA A PRISÃO": "Vai direto para a PRISÃO.",
    "Multa da Vigilância Sanitária": `Quem parar aqui paga ${formatMoney(GAME_CONFIG.multaVigilanciaSanitaria)} de multa ao banco. Se o saldo ficar negativo, é eliminado.`
};

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;
    boardElement.innerHTML = "";

    boardSpaces.forEach((space) => {
        const definition = space.factorKey ? getFactorDefinition(space.factorKey) : null;
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space space-${space.type} ${space.cssClass || ''}`;
        if (definition) spaceDiv.classList.add(`ficha-${definition.ficha}`);
        spaceDiv.id = `space-${space.id}`;

        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;

        if (PURCHASABLE_TYPES.includes(space.type)) {
            const tag = document.createElement("div");
            tag.className = "property-tag";
            spaceDiv.appendChild(tag);
        }

        const nameText = document.createElement("div");
        nameText.className = "space-name";

        if (definition) {
            const code = document.createElement("span");
            code.className = "space-factor-code";
            code.textContent = definition.symbol;
            nameText.appendChild(code);

            const label = document.createElement("span");
            label.className = "space-factor-label";
            label.textContent = space.name;
            nameText.appendChild(label);
        } else {
            nameText.textContent = space.name;
        }

        spaceDiv.appendChild(nameText);

        if (definition) {
            const factorInfo = document.createElement("div");
            factorInfo.className = "factor-info";
            factorInfo.innerHTML = `
                <div class="factor-value-row">
                    <strong id="factor-value-${space.id}"></strong>
                    <span class="intervention-sign" id="intervention-sign-${space.id}"></span>
                </div>
                <span class="factor-manager" id="factor-manager-${space.id}"></span>
            `;
            spaceDiv.appendChild(factorInfo);
        }

        const tokensContainer = document.createElement("div");
        tokensContainer.className = "tokens-container";
        tokensContainer.id = `tokens-space-${space.id}`;
        spaceDiv.appendChild(tokensContainer);

        boardElement.appendChild(spaceDiv);
    });

    refreshBoardOwnership();
}

// Detalhes da casa exibidos somente ao passar o mouse (atributo title).
function getSpaceTooltip(space) {
    const manager = players.find(player => player.id === space.owner);
    const definition = space.factorKey ? getFactorDefinition(space.factorKey) : null;

    if (definition) {
        const key = space.factorKey;
        const level = marketState.levels[key];
        const lines = [
            `${definition.name} (${definition.symbol})`,
            `Valor atual: ${formatInternalValue(key, definition.values[level])} · nível ${level} de ${MAX_FACTOR_LEVEL} (inicial: ${definition.initialLevel})`,
            `Níveis 0–${MAX_FACTOR_LEVEL}: ${definition.values.map(value => formatInternalValue(key, value)).join(" · ")}`,
            `Ficha: ${fichaTypeLabel(definition.ficha).toLowerCase()}${definition.fichaNote ? ` (${definition.fichaNote})` : ""}`,
            manager ? `Gerente: ${manager.name}` : `Sem gerente · aquisição: ${formatMoney(space.price)}`,
            `Taxa de visita atual: ${formatMoney(getSpaceVisitFee(space, marketState))}`
        ];
        const up = getInterventionCost(key, level, level + 1);
        const down = getInterventionCost(key, level, level - 1);
        lines.push(up.ok
            ? `Subir para ${formatInternalValue(key, definition.values[level + 1])}: ${formatMoney(up.money)} + ${formatFichas(up.fichas, up.fichaType)}`
            : "Subir: já está no nível máximo");
        lines.push(down.ok
            ? `Reduzir para ${formatInternalValue(key, definition.values[level - 1])}: ${formatMoney(down.money)} + ${formatFichas(down.fichas, down.fichaType)} (sem devolução)`
            : "Reduzir: já está no nível mínimo");
        lines.push("Somente o gerente intervém, durante a própria vez.");
        return lines.join("\n");
    }

    if (space.type === "station") {
        return [
            space.name,
            `Quem parar aqui recebe ${GAME_CONFIG.fichasPorVisita} ficha ${fichaTypeLabel(space.fichaType).toLowerCase()}.`,
            manager ? `Gerente: ${manager.name}` : `Sem gerente · aquisição: ${formatMoney(space.price)}`,
            `Taxa de utilização: ${formatMoney(getSpaceVisitFee(space, marketState))}`
        ].join("\n");
    }

    const description = SPECIAL_SPACE_DESCRIPTIONS[space.name];
    return description ? `${space.name}\n${description}` : space.name;
}

function applySpaceOwnership(space, spaceDiv) {
    spaceDiv = spaceDiv || document.getElementById(`space-${space.id}`);
    if (!spaceDiv) return;
    spaceDiv.title = getSpaceTooltip(space);

    const existingBadge = spaceDiv.querySelector(".owner-badge");
    if (existingBadge) existingBadge.remove();
    spaceDiv.style.borderColor = "";
    spaceDiv.style.boxShadow = "";

    if (!PURCHASABLE_TYPES.includes(space.type) || space.owner === null || space.owner === undefined) {
        return;
    }

    const owner = players.find(p => p.id === space.owner);
    if (!owner) return;

    // A moldura de 2px da gerência é desenhada com a borda de 1px + uma sombra interna de 1px,
    // para não roubar largura do conteúdo (em casas de ~48px isso quebrava palavras no meio).
    spaceDiv.style.borderColor = owner.color;
    spaceDiv.style.boxShadow = `inset 0 0 0 1px ${owner.color}, inset 0 0 8px ${owner.color}99`;

    const badge = document.createElement("div");
    badge.className = "owner-badge";
    badge.style.backgroundColor = owner.color;
    badge.title = `Gerência de ${owner.name}`;
    spaceDiv.appendChild(badge);
}

function refreshBoardOwnership() {
    boardSpaces.forEach(space => {
        applySpaceOwnership(space);
        if (space.factorKey) {
            const valueElement = document.getElementById(`factor-value-${space.id}`);
            const managerElement = document.getElementById(`factor-manager-${space.id}`);
            const signElement = document.getElementById(`intervention-sign-${space.id}`);
            const manager = players.find(player => player.id === space.owner);
            if (valueElement) valueElement.innerText = formatInternalValue(space.factorKey, getFactorValue(marketState, space.factorKey));
            if (managerElement) managerElement.innerText = manager ? `Gerente: ${manager.name}` : "Sem gerente";
            if (signElement) signElement.innerText = space.lastIntervention || "";
        }
    });
}

// ==========================================
// PAINEL CENTRAL: CONDIÇÕES EXTERNAS FIXAS
// ==========================================
function renderMarketPanel() {
    const cardsElement = document.getElementById("market-cards");
    if (cardsElement) {
        cardsElement.innerHTML = EXTERNAL_KEYS.map(key => {
            const definition = RESTAURANT_RULESET.external[key];
            const value = definition.base;
            const title = `${definition.name} (${definition.symbol}): ${formatExternalValue(key, value)} ${definition.unit}. Condição externa fixa.`;
            return `
                <div class="market-card" title="${escapeHtml(title)}">
                    <div class="market-card-head"><span class="market-card-name">${definition.name}</span><span class="market-card-symbol">${definition.symbol}</span></div>
                    <strong class="market-card-value">${formatExternalValue(key, value)}</strong>
                    <span class="market-card-unit">${definition.unit}</span>
                </div>
            `;
        }).join("");
    }

    const yearElement = document.getElementById("year-number");
    const cycleElement = document.getElementById("cycle-number");
    const semesterElement = document.getElementById("semester-name");
    if (yearElement) yearElement.innerText = yearNumber;
    if (cycleElement) cycleElement.innerText = cycleNumber;
    if (semesterElement) semesterElement.innerText = semesterLabel(getCurrentSemester(players));

    const changesElement = document.getElementById("recent-changes");
    if (changesElement) {
        changesElement.innerHTML = recentChanges.length
            ? recentChanges.map(change => `<div>${change.direction === "up" ? "▲" : "▼"} ${change.playerName}: ${change.symbol} (${change.factorName}) ${formatInternalValue(change.factorKey, change.fromValue)} → ${formatInternalValue(change.factorKey, change.toValue)}</div>`).join("")
            : "Nenhuma intervenção registrada.";
    }
}

function requestFactorIntervention(factorKey, delta) {
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_INTERVENE_FACTOR", { factorKey, delta });
    } else {
        hostProcessInterveneFactor(window.Network ? window.Network.myPeerId : null, factorKey, delta);
    }
}

let privateInvestigationLogs = new Map();
let localPendingFactorTest = null;
let factorActionFeedbackTimeout = null;

function clearPrivateInvestigationLog() {
    privateInvestigationLogs = new Map();
    localPendingFactorTest = null;
}

function showFactorActionFeedback(message) {
    const boardColumn = document.querySelector(".board-column");
    if (!boardColumn) return;

    let feedback = document.getElementById("factor-action-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.id = "factor-action-feedback";
        feedback.className = "factor-action-feedback";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");
        boardColumn.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.classList.remove("is-visible");
    void feedback.offsetWidth;
    feedback.classList.add("is-visible");
    window.clearTimeout(factorActionFeedbackTimeout);
    factorActionFeedbackTimeout = window.setTimeout(() => feedback.classList.remove("is-visible"), getAnimationDuration(GAME_ANIMATION_MULTIPLIERS.toastHold));
}

function objectiveTargetText(objective) {
    const comparison = objective.operator === "<=" ? "no máximo" : "pelo menos";
    return `${comparison} ${formatObjectiveValue(objective, objective.target)}`;
}

// Objetivos são recalculados do estado global; detalhes de sua composição permanecem internos.
function renderObjectiveCard(player) {
    if (!player.objective) return "🎯 Carta de Objetivo: a definir";
    const objective = calculateObjective(player.objective.id, marketState);
    if (!objective) return "🎯 Carta de Objetivo: a definir";
    const status = objective.fulfilled ? "✅ Alcançada" : "⏳ Não alcançada";
    return `<strong>🎯 ${escapeHtml(objective.name)}</strong><br><small>Atual: ${formatObjectiveValue(objective, objective.result)}<br>Meta: ${objectiveTargetText(objective)}<br>${status}</small>`;
}

function renderCurrentPlayerObjectiveFocus() {
    const focus = document.getElementById("current-player-objective");
    if (!focus) return;

    const player = players[currentPlayerIndex];
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    if (!player || (isMultiplayer && player.peerId !== myPeerId)) {
        focus.innerHTML = "";
        focus.classList.remove("is-visible");
        return;
    }

    if (!player || !player.objective) {
        focus.innerHTML = "";
        focus.classList.remove("is-visible");
        return;
    }

    const objective = calculateObjective(player.objective.id, marketState);
    if (!objective) {
        focus.innerHTML = "";
        focus.classList.remove("is-visible");
        return;
    }

    const status = objective.fulfilled ? "✅ Alcançada" : "⏳ Não alcançada";
    const pending = pendingFactorTest && pendingFactorTest.playerId === player.id ? pendingFactorTest : null;
    const space = pending ? boardSpaces[pending.spaceId] : null;
    const factorKey = space && space.factorKey;
    const definition = factorKey && RESTAURANT_RULESET.internal[factorKey];
    const logKey = `${yearNumber}:${player.id}:${objective.id}`;
    const records = privateInvestigationLogs.get(logKey) || [];
    const currentTestRecorded = Boolean(pending && records.some(record => record.id === pending.testId));
    const localDelta = pending && localPendingFactorTest && localPendingFactorTest.testId === pending.testId
        ? localPendingFactorTest.delta
        : null;
    const testResult = pending && pending.tested && localDelta
        ? simulateObjectiveFactorChange(objective.id, marketState, factorKey, localDelta)
        : null;
    const formattedResult = value => formatObjectiveValue(objective, value);
    const testPanel = pending && definition ? (pending.tested && testResult ? `
        <section class="factor-test-panel" aria-live="polite">
            <div class="factor-test-heading">Teste realizado</div>
            <div class="factor-test-observation">
                <strong>${escapeHtml(definition.name)}</strong>
                <span>${formatInternalValue(factorKey, testResult.fromValue)} → ${formatInternalValue(factorKey, testResult.toValue)}</span>
            </div>
            <div class="factor-test-result">
                <span>Resultado do seu objetivo</span>
                <strong>${formattedResult(testResult.beforeResult)} → ${formattedResult(testResult.afterResult)}</strong>
            </div>
            <div class="factor-test-actions">
                <button id="btn-record-factor-test" class="factor-test-button${currentTestRecorded ? " is-confirmed" : ""}" ${currentTestRecorded ? "disabled aria-label=\"Teste anotado no registro\"" : ""}>${currentTestRecorded ? "Teste anotado" : "Anotar este teste"}</button>
                <button id="btn-continue-factor-landing" class="factor-test-button is-secondary">Continuar para a casa</button>
            </div>
            ${currentTestRecorded ? `<p class="investigation-log-feedback" role="status">Observação adicionada ao Registro de investigação.</p>` : ""}
        </section>
    ` : `
        <section class="factor-test-panel">
            <div class="factor-test-heading">Testar fator · ${escapeHtml(definition.name)}</div>
            <div class="factor-test-current">Valor atual: <strong>${formatInternalValue(factorKey, getFactorValue(marketState, factorKey))}</strong></div>
            <div class="factor-test-actions">
                ${[1, -1].map(delta => {
                    const currentLevel = marketState.levels[factorKey];
                    const nextLevel = currentLevel + delta;
                    if (nextLevel < MIN_FACTOR_LEVEL || nextLevel > MAX_FACTOR_LEVEL) return "";
                    const currentValue = definition.values[currentLevel];
                    const nextValue = definition.values[nextLevel];
                    return `<button class="factor-test-button" data-factor-test-delta="${delta}">Testar ${formatInternalValue(factorKey, currentValue)} → ${formatInternalValue(factorKey, nextValue)}</button>`;
                }).join("")}
                <button id="btn-continue-factor-landing" class="factor-test-button is-secondary">Continuar sem testar</button>
            </div>
        </section>
    `) : "";

    const recordTable = records.length ? `
        <section class="investigation-log">
            <h4>Registro de investigação</h4>
            <div class="investigation-log-scroll">
                <table>
                    <thead><tr><th>Fator testado</th><th>Valor antes</th><th>Valor testado</th><th>Resultado antes</th><th>Resultado depois</th></tr></thead>
                    <tbody>${records.map(record => `<tr><td>${escapeHtml(record.factorName)}</td><td>${escapeHtml(record.beforeFactor)}</td><td>${escapeHtml(record.testedFactor)}</td><td>${escapeHtml(record.beforeResult)}</td><td>${escapeHtml(record.afterResult)}</td></tr>`).join("")}</tbody>
                </table>
            </div>
        </section>
    ` : `<section class="investigation-log"><h4>Registro de investigação</h4><p>Nenhum teste anotado.</p></section>`;

    focus.innerHTML = `
        <div class="player-objective-card">
            <div class="player-objective-label">Carta do jogador da vez</div>
            <div class="player-objective-header">
                <span class="player-objective-dot" style="background:${player.color};"></span>
                <strong>${escapeHtml(player.name)}</strong>
            </div>
            <div class="player-objective-name">🎯 ${escapeHtml(objective.name)}</div>
            <div class="player-objective-meta">
                <span><strong>Atual:</strong> ${formattedResult(objective.result)}</span>
                <span><strong>Meta:</strong> ${objectiveTargetText(objective)}</span>
                <span>${status}</span>
            </div>
            ${testPanel}
            ${recordTable}
        </div>
    `;

    focus.querySelectorAll("[data-factor-test-delta]").forEach(button => {
        button.onclick = () => {
            if (button.disabled) return;
            button.disabled = true;
            button.classList.add("is-testing");

            let testRequested = false;
            const finishTest = event => {
                if (event && event.animationName !== "factor-button-shine") return;
                if (testRequested) return;
                testRequested = true;
                window.clearTimeout(animationFallback);
                button.removeEventListener("animationend", finishTest);
                localPendingFactorTest = { testId: pending.testId, delta: Number(button.dataset.factorTestDelta) };
                requestFactorTest(localPendingFactorTest.delta);
            };

            button.addEventListener("animationend", finishTest);
            const animationFallback = window.setTimeout(
                finishTest,
                getAnimationDuration(GAME_ANIMATION_MULTIPLIERS.shine) + 80
            );
        };
    });
    const recordButton = focus.querySelector("#btn-record-factor-test");
    if (recordButton && testResult && !records.some(record => record.id === pending.testId)) {
        recordButton.onclick = () => {
            const log = privateInvestigationLogs.get(logKey) || [];
            log.push({
                id: pending.testId,
                factorName: definition.name,
                beforeFactor: formatInternalValue(factorKey, testResult.fromValue),
                testedFactor: formatInternalValue(factorKey, testResult.toValue),
                beforeResult: formattedResult(testResult.beforeResult),
                afterResult: formattedResult(testResult.afterResult)
            });
            privateInvestigationLogs.set(logKey, log);
            updateUI();
            showFactorActionFeedback("Observação adicionada ao registro.");
        };
    }
    const continueButton = focus.querySelector("#btn-continue-factor-landing");
    if (continueButton) continueButton.onclick = () => {
        showFactorActionFeedback("Seguindo para a ação normal da casa.");
        continueFactorLanding();
    };

    focus.classList.add("is-visible");
}

function renderPawns() {
    document.querySelectorAll(".tokens-container").forEach(c => c.innerHTML = "");

    players.forEach(player => {
        if (player.isBankrupt) return;
        const container = document.getElementById(`tokens-space-${player.position}`);
        if (container) {
            const pawn = document.createElement("div");
            pawn.className = "pawn";
            pawn.style.backgroundColor = player.color;
            pawn.title = player.name;
            container.appendChild(pawn);
        }
    });
}

function getOwnedSpaces(playerId) {
    return boardSpaces.filter(s => PURCHASABLE_TYPES.includes(s.type) && s.owner === playerId);
}

function getPropertyChipClass(space) {
    if (space.type === "station") return "chip-observatorio";
    if (space.type === "utility") return "chip-utility";
    return "chip-restaurant";
}

function updateUI() {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;
    renderMarketPanel();
    refreshBoardOwnership();
    renderCurrentPlayerObjectiveFocus();
    playersList.innerHTML = "";

    const currentPlayer = players[currentPlayerIndex];
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const canProposeTradeNow = !isMoving && !awaitingDecision && !pendingFactorTest && !pendingTrade && !pendingCard && !gameOver;
    const rulesContext = getRulesContext();

    players.forEach((p, idx) => {
        const ownedSpaces = getOwnedSpaces(p.id);
        const patrimonio = p.money + ownedSpaces.reduce((sum, s) => sum + (s.price || 0), 0);
        const isExpanded = expandedPlayerIds.has(p.id);

        const row = document.createElement("div");
        row.className = `player-row${ownedSpaces.length ? " has-properties" : ""}${!isMultiplayer && idx === currentPlayerIndex ? " is-current-player" : ""}`;
        if (idx === currentPlayerIndex) row.style.fontWeight = "bold";
        row.style.borderLeft = `5px solid ${p.color}`;

        row.innerHTML = `
            <div class="player-row-header">
                <span>${p.name}${p.isBankrupt ? " 💥" : ""}${p.finishedYear && !p.isBankrupt ? " 📘" : ""}</span>
                <span>${formatMoney(p.money)}</span>
            </div>
            <div class="player-patrimonio">
                <span>Patrimônio: ${formatMoney(patrimonio)} (${ownedSpaces.length} ${ownedSpaces.length === 1 ? "gerência" : "gerências"})</span>
                ${ownedSpaces.length ? `<span class="expand-indicator">${isExpanded ? "▲" : "▼"}</span>` : ""}
            </div>
            <div class="player-fichas">
                🔬 Fichas: <strong>${p.fichasContinua || 0}</strong> Contínua · <strong>${p.fichasDiscreta || 0}</strong> Discreta
            </div>
            <div class="player-objective">${renderObjectiveCard(p)}</div>
            ${isExpanded && ownedSpaces.length ? `
                <div class="property-chip-list">
                    ${ownedSpaces.map(s => `<span class="property-chip ${getPropertyChipClass(s)}">${s.name}</span>`).join("")}
                </div>
            ` : ""}
        `;

        if (ownedSpaces.length) {
            row.onclick = () => {
                if (expandedPlayerIds.has(p.id)) expandedPlayerIds.delete(p.id);
                else expandedPlayerIds.add(p.id);
                updateUI();
            };
        }

        // Controles de intervenção: só para o gerente, na própria vez; habilitados quando a regra permite.
        const isLocalCurrentPlayer = currentPlayer && p.id === currentPlayer.id && (!isMultiplayer || p.peerId === myPeerId);
        const factorSpaces = ownedSpaces.filter(space => space.factorKey);
        if (isLocalCurrentPlayer && !p.isBankrupt && !p.finishedYear && !gameOver && factorSpaces.length) {
            const interventionBox = document.createElement("div");
            interventionBox.className = "intervention-actions";
            factorSpaces.forEach(space => {
                const key = space.factorKey;
                const definition = getFactorDefinition(key);
                const level = marketState.levels[key];
                [1, -1].forEach(delta => {
                    const target = level + delta;
                    const button = document.createElement("button");
                    const targetText = target >= MIN_FACTOR_LEVEL && target <= MAX_FACTOR_LEVEL ? formatInternalValue(key, definition.values[target]) : "—";
                    button.innerText = `${delta > 0 ? "▲" : "▼"} ${definition.symbol}: ${formatInternalValue(key, definition.values[level])} → ${targetText}`;
                    const validation = validateIntervention(rulesContext, p.id, key, delta);
                    const cost = getInterventionCost(key, level, target);
                    button.disabled = !validation.ok;
                    button.title = validation.ok
                        ? `${delta > 0 ? "Subir" : "Reduzir"} ${definition.name}: ${formatMoney(cost.money)} + ${formatFichas(cost.fichas, cost.fichaType)}${delta < 0 ? " (sem devolução)" : ""}`
                        : validation.error;
                    button.onclick = event => { event.stopPropagation(); requestFactorIntervention(key, delta); };
                    interventionBox.appendChild(button);
                });
            });
            row.appendChild(interventionBox);
        }

        const canCurrentPlayerTrade = canProposeTradeNow && currentPlayer && p.id !== currentPlayer.id && !currentPlayer.isBankrupt && !p.isBankrupt &&
            (!isMultiplayer || currentPlayer.peerId === myPeerId);
        if (canCurrentPlayerTrade) {
            const tradeBtn = document.createElement("button");
            tradeBtn.className = "trade-btn";
            tradeBtn.title = `Negociar com ${p.name}`;
            tradeBtn.innerText = "🤝";
            tradeBtn.onclick = (e) => {
                e.stopPropagation();
                openTradeProposalModalUI(currentPlayer, p);
            };
            const header = row.querySelector(".player-row-header");
            if (header) header.appendChild(tradeBtn);
        }

        // Jogadores no Fechamento do Exercício continuam podendo negociar.
        if (canProposeTradeNow && p.finishedYear && !p.isBankrupt && (!isMultiplayer || p.peerId === myPeerId)) {
            const finishedTradeBtn = document.createElement("button");
            finishedTradeBtn.className = "trade-btn";
            finishedTradeBtn.title = "Escolher jogador para negociar";
            finishedTradeBtn.innerText = "🤝";
            finishedTradeBtn.onclick = event => {
                event.stopPropagation();
                openTradeTargetModalUI(p);
            };
            const header = row.querySelector(".player-row-header");
            if (header) header.appendChild(finishedTradeBtn);
        }

        playersList.appendChild(row);
    });

    const rollBtn = document.getElementById("rollDice");
    if (rollBtn) {
        const activePlayer = players[currentPlayerIndex];
        if (gameOver && gameResult) {
            rollBtn.disabled = false;
            rollBtn.innerText = "🏆 Ver resultado";
            rollBtn.title = "Mostrar o resultado da partida";
        } else {
            rollBtn.innerText = "🎲 Jogar Dado";
            rollBtn.disabled = isMoving || awaitingDecision || !!pendingFactorTest || !!pendingTrade || !!pendingCard || gameOver || (activePlayer ? activePlayer.isBankrupt || activePlayer.finishedYear : false);
            rollBtn.title = activePlayer && activePlayer.finishedYear ? "Este jogador já está no Fechamento do Exercício." : "Rolar dados";
        }
    }
}

function openTradeTargetModalUI(proposer) {
    const targets = players.filter(player => player.id !== proposer.id && !player.isBankrupt);
    if (targets.length === 0) return;
    if (targets.length === 1) {
        openTradeProposalModalUI(proposer, targets[0]);
        return;
    }

    closeTradeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "trade-modal-overlay";
    overlay.innerHTML = `
        <div class="rules-box text-center" style="max-width: 420px;">
            <h2 style="color:#1e90ff; margin-bottom: 15px;">🤝 Negociar com quem?</h2>
            <div class="card-btn-row" style="flex-direction: column;">
                ${targets.map(target => `<button class="card-btn trade-target-btn" data-player-id="${target.id}">${target.name}</button>`).join("")}
            </div>
            <button id="btn-cancel-trade-target" class="card-btn card-btn-danger" style="margin-top: 15px;">Cancelar</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelectorAll(".trade-target-btn").forEach(button => {
        button.onclick = () => {
            const target = players.find(player => String(player.id) === button.dataset.playerId);
            if (target) openTradeProposalModalUI(proposer, target);
        };
    });
    document.getElementById("btn-cancel-trade-target").onclick = () => closeTradeModal();
}

// ==========================================
// ESCOLHA DO NÚMERO DE JOGADORES (MODO LOCAL)
// ==========================================
function openPlayerSetupModalUI(onChoose) {
    const max = GAME_CONFIG.maxJogadores;
    const existing = document.getElementById("player-setup-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "player-setup-overlay";
    const counts = [];
    for (let count = 2; count <= max; count++) counts.push(count);
    overlay.innerHTML = `
        <div class="rules-box text-center player-setup-box" role="dialog" aria-modal="true" aria-labelledby="player-setup-title">
            <h2 id="player-setup-title">👥 Quantos jogadores?</h2>
            <p class="player-setup-note">A partida no mesmo dispositivo aceita de <strong>2 a ${max} jogadores</strong>. Não é possível jogar com mais de ${max}.</p>
            <div class="card-btn-row">
                ${counts.map(count => `<button class="card-btn card-btn-primary player-count-btn" data-count="${count}">${count} jogadores</button>`).join("")}
            </div>
            <button id="btn-player-setup-back" class="card-btn player-setup-back">Voltar ao início</button>
        </div>
    `;
    document.body.appendChild(overlay);

    let isClosing = false;
    overlay.querySelectorAll(".player-count-btn").forEach(button => {
        button.onclick = () => {
            if (isClosing) return;
            isClosing = true;
            const selectedCount = Number(button.dataset.count);
            const finish = () => {
                if (!overlay.isConnected) return;
                window.clearTimeout(exitFallback);
                overlay.removeEventListener("transitionend", handleExitTransition);
                overlay.remove();
                onChoose(selectedCount);
            };
            const handleExitTransition = event => {
                if (event.target === overlay && event.propertyName === "opacity") finish();
            };
            const exitFallback = window.setTimeout(finish, getAnimationDuration(GAME_ANIMATION_MULTIPLIERS.setupFallback));
            overlay.addEventListener("transitionend", handleExitTransition);
            overlay.classList.add("is-leaving");
        };
    });
    document.getElementById("btn-player-setup-back").onclick = () => { window.location.href = "index.html"; };
}

// ==========================================
// RESULTADO DA PARTIDA (DESTAQUE NA TELA)
// ==========================================
function closeGameResultModal() {
    const el = document.getElementById("game-result-overlay");
    if (el) el.remove();
}

function refreshGameResultUI() {
    if (!gameOver || !gameResult) {
        closeGameResultModal();
        gameResultDismissed = false;
        return;
    }
    if (gameResultDismissed || document.getElementById("game-result-overlay")) return;
    openGameResultModalUI();
}

function showGameResultAgain() {
    gameResultDismissed = false;
    refreshGameResultUI();
}

function openGameResultModalUI() {
    const result = gameResult;
    const winners = result.standings.filter(row => row.winner);
    const names = winners.map(row => row.name).join(" e ");
    const capitalize = text => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
    const view = {
        winner: { badge: "Fim de jogo", icon: "🏆", title: `${names} venceu!`, reason: `Venceu porque ${result.reason}.` },
        tie: { badge: "Fim de jogo · empate", icon: "🤝", title: `Empate entre ${names}`, reason: `${capitalize(result.reason)}.` },
        noWinner: { badge: "Fim de jogo", icon: "🏁", title: "Partida encerrada sem vencedor", reason: `${capitalize(result.reason)}.` }
    }[result.type] || { badge: "Fim de jogo", icon: "🏁", title: "Partida encerrada", reason: "" };

    const rows = result.standings.map(row => {
        const objective = row.objective
            ? `${row.objective.name} · ${row.objective.resultText} (${row.objective.targetText}) ${row.objective.fulfilled ? "✅" : "❌"}`
            : "Sem Carta de Objetivo";
        const classes = [row.winner ? "is-winner" : "", row.eliminated ? "is-eliminated" : ""].join(" ").trim();
        return `
            <li class="${classes}">
                <span class="result-dot" style="background:${row.color || "#94a3b8"}"></span>
                <div class="result-player"><strong>${row.winner ? "🏆 " : ""}${escapeHtml(row.name)}${row.eliminated ? " · eliminado" : ""}</strong><small>${escapeHtml(objective)}</small></div>
                <span class="result-money">${formatMoney(row.money)}</span>
            </li>
        `;
    }).join("");

    closeGameResultModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "game-result-overlay";
    overlay.innerHTML = `
        <div class="rules-box result-modal-box" role="dialog" aria-modal="true" aria-labelledby="game-result-title">
            <div class="result-card result-${result.type}">
                <span class="card-type-badge result-badge">${view.badge}</span>
                <div class="result-icon" aria-hidden="true">${view.icon}</div>
                <h2 id="game-result-title" class="result-title">${escapeHtml(view.title)}</h2>
                <p class="result-reason">${escapeHtml(view.reason)}</p>
                ${result.context ? `<p class="result-context">${escapeHtml(result.context)}</p>` : ""}
                <ol class="result-standings">${rows}</ol>
            </div>
            <div class="card-btn-row">
                <button id="btn-result-close" class="card-btn">Ver tabuleiro</button>
                ${isMultiplayer ? "" : `<button id="btn-result-new" class="card-btn card-btn-primary">Nova partida</button>`}
                <button id="btn-result-home" class="card-btn">Voltar ao início</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("btn-result-close").onclick = () => {
        gameResultDismissed = true;
        closeGameResultModal();
    };
    const newGameButton = document.getElementById("btn-result-new");
    if (newGameButton) newGameButton.onclick = () => { window.location.reload(); };
    document.getElementById("btn-result-home").onclick = () => { window.location.href = "index.html"; };
}
