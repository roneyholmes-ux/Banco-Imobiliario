/**
 * ui.js
 * Desenha e sincroniza os elementos visuais do tabuleiro e painéis.
 */

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
    });
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

function updateUI() {
    const playersList = document.getElementById("players-list");
    if (!playersList) return;
    playersList.innerHTML = "";

    players.forEach((p, idx) => {
        const row = document.createElement("div");
        row.className = "player-row";
        if (idx === currentPlayerIndex) row.style.fontWeight = "bold";
        row.style.borderLeft = `5px solid ${p.color}`;
        row.innerHTML = `<span>${p.name}</span> <span>$${p.money}</span>`;
        playersList.appendChild(row);
    });

    const rollBtn = document.getElementById("rollDice");
    if (rollBtn) {
        rollBtn.disabled = isMoving || awaitingDecision || players[currentPlayerIndex]?.isBankrupt;
    }
}
