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
        spaceDiv.id = `space-${space.id}`;

        const pos = getGridPosition(space.id);
        spaceDiv.style.gridRow = pos.row;
        spaceDiv.style.gridColumn = pos.col;

        if (["property", "station", "utility"].includes(space.type)) {
            const tag = document.createElement("div");
            tag.className = `property-tag ${space.color || 'cor-cinza'}`;
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
    badge.title = `Propriedade de ${owner.name}`;
    spaceDiv.appendChild(badge);
}

function refreshBoardOwnership() {
    boardSpaces.forEach(space => applySpaceOwnership(space));
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
    return space.color || "";
}

function updateUI() {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;
    playersList.innerHTML = "";

    const currentPlayer = players[currentPlayerIndex];
    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const canProposeTradeNow = currentPlayer && !currentPlayer.isBankrupt && !isMoving && !awaitingDecision && !pendingTrade && !pendingCard &&
        (!isMultiplayer || currentPlayer.peerId === myPeerId);

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
                <span>Patrimônio: $${patrimonio} (${ownedSpaces.length} ${ownedSpaces.length === 1 ? "propriedade" : "propriedades"})</span>
                ${ownedSpaces.length ? `<span class="expand-indicator">${isExpanded ? "▲" : "▼"}</span>` : ""}
            </div>
            <div class="player-fichas">
                🔬 Fichas: <strong>${p.fichasContinua || 0}</strong> Contínua · <strong>${p.fichasDiscreta || 0}</strong> Discreta
            </div>
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

        if (canProposeTradeNow && p.id !== currentPlayer.id && !p.isBankrupt) {
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

        playersList.appendChild(row);
    });

    const rollBtn = document.getElementById("rollDice");
    if (rollBtn) {
        const activePlayer = players[currentPlayerIndex];
        rollBtn.disabled = isMoving || awaitingDecision || !!pendingTrade || !!pendingCard || (activePlayer ? activePlayer.isBankrupt : false);
    }
}
