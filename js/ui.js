// ui.js - Renderização e Controle da Interface

const UI = {
    render(gameState) {
        this.updateBoard(gameState);
        this.updatePlayersInfo(gameState);
        this.updateControls(gameState);
    },

    updateBoard(gameState) {
        // Atualiza a posição visual dos peões e donos das propriedades
        gameState.players.forEach(player => {
            const playerPin = document.getElementById(`pin-${player.id}`);
            if (playerPin) {
                const targetTile = document.getElementById(`tile-${player.position}`);
                if (targetTile) targetTile.appendChild(playerPin);
            }
        });
    },

    updatePlayersInfo(gameState) {
        // Exibe saldo e dados rodados
        const diceDisplay = document.getElementById('dice-result');
        if (diceDisplay) {
            diceDisplay.innerText = `Dados: ${gameState.lastDiceRoll[0]} e ${gameState.lastDiceRoll[1]}`;
        }
    },

    updateControls(gameState) {
        const activePlayer = gameState.players[gameState.currentPlayerIdx];
        const isMyTurn = activePlayer && activePlayer.id === Multiplayer.myPeerId;

        // Desabilita botões caso NÃO seja a vez do jogador local
        const rollBtn = document.getElementById('btn-roll-dice');
        const buyBtn = document.getElementById('btn-buy-property');
        const endBtn = document.getElementById('btn-end-turn');

        if (rollBtn) rollBtn.disabled = !isMyTurn;
        if (buyBtn) buyBtn.disabled = !isMyTurn;
        if (endBtn) endBtn.disabled = !isMyTurn;
    }
};
