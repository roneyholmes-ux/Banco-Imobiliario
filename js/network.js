/**
 * network.js
 * Camada de compatibilidade e atalho para envio de mensagens P2P.
 */

function sendNetworkAction(actionType, payload = {}) {
    if (window.Network && typeof window.Network.sendGameAction === "function") {
        window.Network.sendGameAction(actionType, payload);
    } else {
        console.warn("[Network] Módulo de rede não inicializado ou método sendGameAction ausente.");
    }
}
 
window.sendNetworkAction = sendNetworkAction;
