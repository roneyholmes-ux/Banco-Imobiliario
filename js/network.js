/**
 * network.js
 * Camada de Ponte e Comunicação entre Transporte (multiplayer.js) e Regras/Ações (actions.js).
 * 
 * Responsabilidades:
 * - Escutar eventos brutos do multiplayer.js.
 * - Encaminhar mensagens recebidas para o Actions.handleAction.
 * - Oferecer métodos simples para envio de ações de rede (sendAction).
 */

class NetworkBridge {
    constructor() {
        this.init();
    }

    /**
     * Conecta a ponte de rede ao módulo de transporte (Multiplayer)
     */
    init() {
        if (!window.Multiplayer) {
            console.warn("[Network] window.Multiplayer ainda não foi carregado.");
            return;
        }

        // Conecta o manipulador de dados brutos
        window.Multiplayer.setDataHandler((data, senderPeerId) => {
            this.handleIncomingData(data, senderPeerId);
        });

        // Conecta o manipulador de início de partida
        window.Multiplayer.setGameStartHandler((players) => {
            this.handleGameStart(players);
        });

        console.log("[Network] Ponte de rede inicializada com sucesso.");
    }

    /**
     * Processa dados recebidos e os envia ao Roteador de Ações (actions.js)
     */
    handleIncomingData(data, senderPeerId) {
        if (!data) return;

        // Garante que o senderPeerId esteja presente no pacote
        const message = {
            ...data,
            senderPeerId: data.senderPeerId || senderPeerId
        };

        // Encaminha para o roteador central (actions.js)
        if (window.Actions && typeof window.Actions.handleAction === "function") {
            window.Actions.handleAction(message);
        } else {
            console.warn("[Network] Actions.handleAction não encontrado para processar a mensagem:", message);
        }
    }

    /**
     * Executado quando a partida é iniciada no lobby por todos
     */
    handleGameStart(players) {
        console.log("[Network] Recebido comando de início de jogo. Inicializando clientes...");
        if (typeof window.startMultiplayerGame === "function") {
            window.startMultiplayerGame(players);
        } else {
            console.error("[Network] Função global window.startMultiplayerGame não encontrada!");
        }
    }

    /**
     * Retorna se a máquina atual é o Host da partida
     */
    get isHost() {
        return window.Multiplayer ? window.Multiplayer.isHost : false;
    }

    /**
     * Retorna o ID único de rede do jogador atual
     */
    get myPeerId() {
        return window.Multiplayer ? window.Multiplayer.myPeerId : null;
    }

    /**
     * Envia uma ação formatada pela rede (ex: REQUEST_ROLL_DICE, SYNC_GAME_STATE)
     */
    sendAction(type, payload = {}) {
        if (!window.Multiplayer) {
            console.error("[Network] Módulo Multiplayer não disponível para envio.");
            return;
        }

        const message = {
            type: type,
            payload: payload,
            senderPeerId: this.myPeerId
        };

        window.Multiplayer.sendRaw(message);
    }
}

// Instância global da ponte de rede
window.Network = new NetworkBridge();

// Tenta re-inicializar caso o script seja carregado em ordem diferente
document.addEventListener("DOMContentLoaded", () => {
    if (window.Network && window.Multiplayer) {
        window.Network.init();
    }
});

/**
 * Função utilitária global para enviar ações diretamente pelo jogo
 */
window.sendNetworkAction = function(actionType, payload = {}) {
    if (window.Network) {
        window.Network.sendAction(actionType, payload);
    } else {
        console.error("[Network] Instância window.Network não encontrada ao chamar sendNetworkAction.");
    }
};
