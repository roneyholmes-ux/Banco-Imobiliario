// game.js - Estado e Regras de Negócio

const Game = {
    // Estado global do jogo
    state: {
        players: [],       // [{ id, name, position, balance, color }]
        currentPlayerIdx: 0,
        properties: {},    // { 1: { owner: peerId, level: 0 } }
        lastDiceRoll: [0, 0],
        gameStarted: false
    },

    // Aplica a sincronização vinda do Host (Usado nos Clientes)
    applySyncState(newState) {
        this.state = newState;
        UI.render(this.state);
    },

    // Central de Processamento de Ações (Executada SOMENTE pelo Host)
    processAction(playerPeerId, action, payload) {
        if (!Multiplayer.isHost) return;

        const currentPlayer = this.state.players[this.state.currentPlayerIdx];

        // Trava de segurança: Valida se é o jogador do turno
        if (currentPlayer.id !== playerPeerId) {
            console.warn(`Ação negada: Não é a vez do jogador ${playerPeerId}`);
            return;
        }

        let stateChanged = false;

        switch (action) {
            case 'ROLL_DICE':
                stateChanged = this.logicRollDice(currentPlayer);
                break;

            case 'BUY_PROPERTY':
                stateChanged = this.logicBuyProperty(currentPlayer, payload.propertyId);
                break;

            case 'END_TURN':
                stateChanged = this.logicEndTurn();
                break;
        }

        // Se o estado mudou, faz broadcast para todos e atualiza a UI local
        if (stateChanged) {
            Multiplayer.broadcastGameState(this.state);
            UI.render(this.state);
        }
    },

    // --- Lógicas Internas do Host ---

    logicRollDice(player) {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        
        this.state.lastDiceRoll = [die1, die2];
        const totalSteps = die1 + die2;

        // Atualiza posição do jogador
        player.position = (player.position + totalSteps) % 40; // Exemplo: Tabuleiro com 40 casas
        return true;
    },

    logicBuyProperty(player, propertyId) {
        const propPrice = 200; // Valor de exemplo

        if (!this.state.properties[propertyId] && player.balance >= propPrice) {
            player.balance -= propPrice;
            this.state.properties[propertyId] = {
                owner: player.id,
                level: 1
            };
            return true;
        }
        return false;
    },

    logicEndTurn() {
        this.state.currentPlayerIdx = (this.state.currentPlayerIdx + 1) % this.state.players.length;
        return true;
    }
};
