/**
 * ui.js
 * Desenha e sincroniza os elementos visuais do tabuleiro e painéis.
 */

let expandedPlayerIds = new Set();

function renderBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;
    boardElement.innerHTML = "";

    boardSpaces.forEach((space) => {
        const spaceDiv = document.createElement("div");
        spaceDiv.className = `space ${space.cssClass || ''}`;
        if (space.factorKey) {
            const definition = FACTOR_DEFINITIONS[space.factorKey];
            spaceDiv.classList.add(definition && definition.control ? "factor-controllable" : "factor-result");
        }
        spaceDiv.id = `space-${space.id}`;

        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;

        if (["property", "station", "utility"].includes(space.type)) {
            const tag = document.createElement("div");
            tag.className = "property-tag";
            spaceDiv.appendChild(tag);
        }

        const nameText = document.createElement("div");
        nameText.className = "space-name";
        nameText.innerText = space.name;
        spaceDiv.appendChild(nameText);

        if (space.factorKey && FACTOR_DEFINITIONS[space.factorKey]) {
            const definition = FACTOR_DEFINITIONS[space.factorKey];
            const factorInfo = document.createElement("div");
            factorInfo.className = "factor-info";
            factorInfo.innerHTML = `
                <strong id="factor-value-${space.id}">${formatFactorValue(space.factorKey)}</strong>
                <span>${definition.control ? "Controlável" : "Resultante/externo"}</span>
                <span class="factor-manager" id="factor-manager-${space.id}">Sem gerente</span>
                <span class="intervention-sign" id="intervention-sign-${space.id}">${space.lastIntervention || ""}</span>
            `;
            spaceDiv.appendChild(factorInfo);
        }

        if (space.price) {
            const priceText = document.createElement("div");
            priceText.innerText = space.factorKey ? `Gerência: $${space.price}` : `$${space.price}`;
            priceText.style.marginTop = "auto";
            spaceDiv.appendChild(priceText);
        }

        const tokensContainer = document.createElement("div");
        tokensContainer.className = "tokens-container";
        tokensContainer.id = `tokens-space-${space.id}`;
        spaceDiv.appendChild(tokensContainer);

        boardElement.appendChild(spaceDiv);

        applySpaceOwnership(space, spaceDiv);
    });
}

function applySpaceOwnership(space, spaceDiv) {
    spaceDiv = spaceDiv || document.getElementById(`space-${space.id}`);
    if (!spaceDiv) return;

    const existingBadge = spaceDiv.querySelector(".owner-badge");
    if (existingBadge) existingBadge.remove();
    spaceDiv.style.border = "";
    spaceDiv.style.boxShadow = "";

    if (!["property", "station", "utility"].includes(space.type) || space.owner === null || space.owner === undefined) {
        return;
    }

    const owner = players.find(p => p.id === space.owner);
    if (!owner) return;

    spaceDiv.style.border = `2px solid ${owner.color}`;
    spaceDiv.style.boxShadow = `inset 0 0 8px ${owner.color}99`;

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
            if (valueElement) valueElement.innerText = formatFactorValue(space.factorKey);
            if (managerElement) managerElement.innerText = manager ? `Gerente: ${manager.name}` : "Sem gerente";
            if (signElement) signElement.innerText = space.lastIntervention || "";
        }
    });
}

function renderExternalCard() {
    const nameElement = document.getElementById("restaurant-event-name");
    const effectsElement = document.getElementById("restaurant-event-effects");
    if (!nameElement || !effectsElement) return;

    const yearElement = document.getElementById("year-number");
    const cycleElement = document.getElementById("cycle-number");
    const semesterElement = document.getElementById("semester-name");
    const changesElement = document.getElementById("recent-changes");
    if (yearElement) yearElement.innerText = yearNumber;
    if (cycleElement) cycleElement.innerText = cycleNumber;
    if (semesterElement) semesterElement.innerText = activeExternalCard ? activeExternalCard.semester : "Primeiro semestre";
    if (changesElement) {
        changesElement.innerHTML = recentChanges.length
            ? recentChanges.map(change => `<div>${change.sign} ${change.player}: ${change.factor} (${change.value})</div>`).join("")
            : "Nenhuma intervenção registrada.";
    }

    if (!activeExternalCard) {
        nameElement.innerText = "Nenhum evento ativo";
        effectsElement.innerText = "A primeira Carta de Fator Externo será sorteada ao fim do primeiro ciclo.";
        return;
    }

    nameElement.innerText = `${activeExternalCard.name} · ${activeExternalCard.semester}`;
    effectsElement.innerText = activeExternalCard.effects
        .map(effect => `${FACTOR_DEFINITIONS[effect.factor].name}: ${effect.modifier > 0 ? "+" : ""}${Math.round(effect.modifier * 100)}%`)
        .join(" · ");
}

function requestFactorIntervention(factorKey, direction) {
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_INTERVENE_FACTOR", { factorKey, direction });
    } else {
        hostProcessInterveneFactor(window.Network ? window.Network.myPeerId : null, factorKey, direction);
    }
}

function renderObjectiveCard(player) {
    if (!player.objective) return "🎯 Carta de Objetivo: A definir";
    const value = player.objective.currentValue === undefined ? getFactorValue(player.objective.factor) : player.objective.currentValue;
    const formatted = Number.isInteger(value) ? value : value.toFixed(1);
    const status = player.objective.fulfilled ? "✅ cumprido" : "⏳ não cumprido";
    return `🎯 <strong>${player.objective.name}</strong><br><small>${player.objective.condition}<br>Fórmula: ${player.objective.formula}<br>Atual: ${formatted} · ${status}</small>`;
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
            container.appendChild(pawn);
        }
    });
}

function getOwnedSpaces(playerId) {
    return boardSpaces.filter(s => ["property", "station", "utility"].includes(s.type) && s.owner === playerId);
}

function getPropertyChipClass(space) {
    if (space.type === "station") return "chip-observatorio";
    if (space.type === "utility") return "chip-utility";
    return "chip-restaurant";
}

function updateUI() {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;
    renderExternalCard();
    refreshBoardOwnership();
    playersList.innerHTML = "";

    const currentPlayer = players[currentPlayerIndex];
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const canProposeTradeNow = !isMoving && !awaitingDecision && !pendingTrade && !pendingCard && !gameOver;

    players.forEach((p, idx) => {
        const ownedSpaces = getOwnedSpaces(p.id);
        const patrimonio = p.money + ownedSpaces.reduce((sum, s) => sum + (s.price || 0), 0);
        const isExpanded = expandedPlayerIds.has(p.id);

        const row = document.createElement("div");
        row.className = `player-row${ownedSpaces.length ? " has-properties" : ""}`;
        if (idx === currentPlayerIndex) row.style.fontWeight = "bold";
        row.style.borderLeft = `5px solid ${p.color}`;

        row.innerHTML = `
            <div class="player-row-header">
                <span>${p.name}${p.isBankrupt ? " 💥" : ""}</span>
                <span>$${p.money}</span>
            </div>
            <div class="player-patrimonio">
                <span>Patrimônio: $${patrimonio} (${ownedSpaces.length} ${ownedSpaces.length === 1 ? "gerência" : "gerências"})</span>
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

        const canIntervene = p.id === (currentPlayer ? currentPlayer.id : null) && !p.finishedYear && !p.isBankrupt && !isMoving && !awaitingDecision &&
            (!isMultiplayer || p.peerId === myPeerId);
        const controllableSpaces = ownedSpaces.filter(space => space.factorKey && FACTOR_DEFINITIONS[space.factorKey] && FACTOR_DEFINITIONS[space.factorKey].control);
        if (canIntervene && controllableSpaces.length) {
            const interventionBox = document.createElement("div");
            interventionBox.className = "intervention-actions";
            controllableSpaces.forEach(space => {
                const definition = FACTOR_DEFINITIONS[space.factorKey];
                const downButton = document.createElement("button");
                downButton.innerText = `− ${definition.name}`;
                downButton.title = `Reduzir por ${definition.step} ${definition.unit}`;
                downButton.onclick = event => { event.stopPropagation(); requestFactorIntervention(space.factorKey, "down"); };
                const upButton = document.createElement("button");
                upButton.innerText = `+ ${definition.name}`;
                upButton.title = `Aumentar por ${definition.step} ${definition.unit}`;
                upButton.onclick = event => { event.stopPropagation(); requestFactorIntervention(space.factorKey, "up"); };
                interventionBox.append(downButton, upButton);
            });
            row.appendChild(interventionBox);
        }

        const canCurrentPlayerTrade = canProposeTradeNow && currentPlayer && p.id !== currentPlayer.id && !currentPlayer.isBankrupt &&
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
        rollBtn.disabled = isMoving || awaitingDecision || !!pendingTrade || !!pendingCard || gameOver || (activePlayer ? activePlayer.isBankrupt || activePlayer.finishedYear : false);
        rollBtn.title = activePlayer && activePlayer.finishedYear ? "Este jogador já está no Fechamento do Exercício." : "Rolar dados";
    }
}

function openTradeTargetModalUI(proposer) {
    const targets = players.filter(player => player.id !== proposer.id && !player.isBankrupt);
    const target = targets[0];
    if (target) openTradeProposalModalUI(proposer, target);
}
