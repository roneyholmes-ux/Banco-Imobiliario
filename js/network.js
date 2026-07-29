/**
 * network.js
 * Camada de compatibilidade para mensagens P2P.
 */

function sendNetworkAction(actionType, payload = {}) {
    if (window.Network && typeof window.Network.sendGameAction === "function") {
        window.Network.sendGameAction(actionType, payload);
    }
}

window.sendNetworkAction = sendNetworkAction;
