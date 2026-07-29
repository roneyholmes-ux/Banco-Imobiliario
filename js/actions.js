/**
 * actions.js
 * Central de despacho e roteamento de ações de rede (P2P / Host-Authoritative).
 */

const Actions = {
    handleAction(message) {
        console.log("[Actions] Mensagem de rede recebida:", message);
        if (!message || !message.type) return;

        const { type, payload, senderPeerId } = message;

        switch (type) {
            // ==========================================
            // REQUISIÇÕES DOS CLIENTES ENVIADAS AO HOST
            // ==========================================
            case "REQUEST_ROLL_DICE":
                // Processado APENAS pelo Host
                if (window.Network && window.Network.isHost) {
                    if (typeof window.hostProcessRollDice === "function") {
                        window.hostProcessRollDice(senderPeerId);
                    }
                }
                break;

            case "REQUEST_BUY_PROPERTY":
                // Processado APENAS pelo Host
                if (window.Network && window.Network.isHost) {
                    if (typeof window.hostProcessBuyProperty === "function") {
                        window.hostProcessBuyProperty(senderPeerId);
                    }
                }
                break;

            case "REQUEST_PASS_PROPERTY":
                // Processado APENAS pelo Host
                if (window.Network && window.Network.isHost) {
                    if (typeof window.hostProcessPassProperty === "function") {
                        window.hostProcessPassProperty(senderPeerId);
                    }
                }
                break;

            // ==========================================
            // TRANSMISSÃO DE ESTADO DO HOST PARA TODOS
            // ==========================================
            case "SYNC_GAME_STATE":
                // Recebido por TODOS (principalmente Clientes) para sincronizar o jogo
                if (typeof window.applyGameStateSync === "function") {
                    window.applyGameStateSync(payload);
                }
                break;

            default:
                console.warn("[Actions] Tipo de ação não reconhecido:", type);
                break;
        }
    }
};

window.Actions = Actions;
