/**
 * actions.js
 * Roteador e Despachante Central de Ações de Rede (Host-Authoritative).
 * 
 * Responsabilidades:
 * - Interpretar o tipo do comando (type).
 * - Rotear requisições de clientes apenas para os manipuladores do Host.
 * - Rotear atualizações do Host para a sincronização da tela nos clientes.
 * - Manter desacopladas a ponte de rede (network.js) e as regras do jogo (game.js).
 */

class ActionRouter {
    /**
     * Processa e despacha a mensagem recebida da rede
     */
    handleAction(message) {
        if (!message || !message.type) return;

        const { type, payload, senderPeerId } = message;
        console.log(`[Actions] Processando ação: ${type} (Enviado por: ${senderPeerId || 'Host/Desconhecido'})`);

        const isHost = window.Network ? window.Network.isHost : false;

        switch (type) {
            // ==========================================
            // REQUISIÇÕES DOS CLIENTES (Apenas o Host executa)
            // ==========================================
            case "REQUEST_ROLL_DICE":
                if (isHost && typeof window.hostProcessRollDice === "function") {
                    window.hostProcessRollDice(senderPeerId);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_ROLL_DICE (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_BUY_PROPERTY":
                if (isHost && typeof window.hostProcessBuyProperty === "function") {
                    window.hostProcessBuyProperty(senderPeerId);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_BUY_PROPERTY (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_PASS_PROPERTY":
                if (isHost && typeof window.hostProcessPassProperty === "function") {
                    window.hostProcessPassProperty(senderPeerId);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_PASS_PROPERTY (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_PROPOSE_TRADE":
                if (isHost && typeof window.hostProcessProposeTrade === "function") {
                    window.hostProcessProposeTrade(senderPeerId, payload);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_PROPOSE_TRADE (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_RESPOND_TRADE":
                if (isHost && typeof window.hostProcessRespondTrade === "function") {
                    window.hostProcessRespondTrade(senderPeerId, payload ? payload.accept : false);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_RESPOND_TRADE (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_CANCEL_TRADE":
                if (isHost && typeof window.hostProcessCancelTrade === "function") {
                    window.hostProcessCancelTrade(senderPeerId);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_CANCEL_TRADE (Apenas o Host pode processar).");
                }
                break;

            case "REQUEST_CARD_ACTION":
                if (isHost && typeof window.hostProcessCardAction === "function") {
                    window.hostProcessCardAction(senderPeerId, payload ? payload.step : null, payload);
                } else if (!isHost) {
                    console.warn("[Actions] Cliente ignorou REQUEST_CARD_ACTION (Apenas o Host pode processar).");
                }
                break;

            // ==========================================
            // SINCRONIZAÇÃO DE ESTADO TRANSMITIDA PELO HOST
            // ==========================================
            case "SYNC_GAME_STATE":
                if (typeof window.applyGameStateSync === "function") {
                    window.applyGameStateSync(payload);
                } else {
                    console.warn("[Actions] Função window.applyGameStateSync não encontrada para aplicar o estado.");
                }
                break;

            default:
                console.warn("[Actions] Tipo de ação não reconhecido:", type);
                break;
        }
    }
}

// Instância global para ser utilizada pela ponte de rede (network.js)
window.Actions = new ActionRouter();
