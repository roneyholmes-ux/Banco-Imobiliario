// ==========================================
// NETWORK.JS
// CAMADA DE COMPATIBILIDADE
// ==========================================
//
// O verdadeiro gerenciador multiplayer está
// em multiplayer.js.
//
// Este arquivo NÃO cria window.Network.
// ==========================================

console.log(
    "[Network] network.js carregado."
);


// ==========================================
// ENVIO DE AÇÃO
// ==========================================

function sendNetworkAction(
    actionType,
    payload = {}
) {

    if (
        window.Network &&
        typeof window.Network.sendGameAction ===
        "function"
    ) {

        window.Network.sendGameAction(
            actionType,
            payload
        );

        return;
    }

    console.warn(
        "[Network] Multiplayer ainda não disponível:",
        actionType
    );
}


// ==========================================
// DISPONIBILIZA FUNÇÃO GLOBAL
// ==========================================

window.sendNetworkAction =
    sendNetworkAction;


console.log(
    "[Network] Camada de compatibilidade pronta."
);

