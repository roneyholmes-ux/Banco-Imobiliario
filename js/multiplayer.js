// multiplayer.js - Gerenciamento de Rede e Roteamento

const Multiplayer = {
    isHost: false,
    myPeerId: null,
    hostPeerId: null,

    // Inicializa os ouvintes de mensagens da rede
    init() {
        Network.onDataReceived((peerId, data) => {
            this.handleIncomingData(peerId, data);
        });
    },

    // Processa mensagens recebidas
    handleIncomingData(senderPeerId, data) {
        switch (data.type) {
            case 'ACTION_REQUEST':
                if (this.isHost) {
                    // O Host processa a ação recebida do cliente
                    Game.processAction(senderPeerId, data.action, data.payload);
                }
                break;

            case 'STATE_SYNC':
                if (!this.isHost) {
                    // O Cliente sincroniza o seu estado local com o do Host
                    Game.applySyncState(data.gameState);
                }
                break;
        }
    },

    // Envia solicitação de ação para o Host
    sendActionToHost(action, payload = {}) {
        if (this.isHost) {
            // Se eu já sou o Host, processa direto localmente
            Game.processAction(this.myPeerId, action, payload);
        } else {
            // Se sou cliente, manda pro Host
            Network.sendToHost({
                type: 'ACTION_REQUEST',
                action: action,
                payload: payload
            });
        }
    },

    // Envia o estado do jogo para TODOS os clientes conectados (Usado apenas pelo Host)
    broadcastGameState(gameState) {
        if (!this.isHost) return;

        Network.broadcast({
            type: 'STATE_SYNC',
            gameState: gameState
        });
    }
};

// Inicializa ouvinte
Multiplayer.init();
