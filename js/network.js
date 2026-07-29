/**
 * network.js
 * ==========================================
 * CAMADA DE REDE DO JOGO
 * ==========================================
 *
 * IMPORTANTE:
 * Este arquivo NÃO cria mais outro window.Network.
 *
 * O objeto principal de multiplayer será criado por
 * multiplayer.js.
 *
 * O network.js apenas fornece compatibilidade
 * para o sistema de ações do jogo.
 */

// ==========================================
// CAMADA DE COMPATIBILIDADE
// ==========================================

const NetworkLocal = {

    isHost: true,

    isOnline: false,

    peer: null,

    connections: [],


    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    init(isHost, peerInstance) {

        this.isHost = isHost;

        this.peer = peerInstance;

        this.isOnline = true;

        console.log(
            "[Network] Inicializado:",
            {
                isHost: this.isHost,
                peer: this.peer
            }
        );
    },


    // ==========================================
    // ENVIO DE AÇÕES
    // ==========================================

    sendAction(actionType, payload = {}) {

        console.log(
            "[Network] sendAction:",
            actionType,
            payload
        );


        // --------------------------------------
        // SE O MULTIPLAYER ESTIVER ATIVO
        // --------------------------------------

        if (
            window.Network &&
            typeof window.Network.sendGameAction === "function"
        ) {

            window.Network.sendGameAction(
                actionType,
                payload
            );

            return;
        }


        // --------------------------------------
        // MODO LOCAL
        // --------------------------------------

        this.executeLocalAction(
            actionType,
            payload
        );
    },


    // ==========================================
    // EXECUÇÃO LOCAL
    // ==========================================

    executeLocalAction(
        actionType,
        payload
    ) {

        console.log(
            "[Network] Executando ação local:",
            actionType
        );


        switch (actionType) {

            case "ROLL_DICE":

                if (
                    typeof window.rollDice ===
                    "function"
                ) {

                    window.rollDice();

                }

                break;


            case "BUY_PROPERTY":

                if (
                    typeof window.buyProperty ===
                    "function"
                ) {

                    window.buyProperty();

                }

                break;


            case "END_TURN":

                if (
                    typeof window.endTurn ===
                    "function"
                ) {

                    window.endTurn();

                }

                break;


            default:

                console.warn(
                    "[Network] Ação local desconhecida:",
                    actionType
                );

        }
    },


    // ==========================================
    // COMPATIBILIDADE
    // ==========================================

    broadcastGameState(gameState) {

        if (
            window.Network &&
            typeof window.Network.broadcastGameState ===
            "function"
        ) {

            window.Network.broadcastGameState(
                gameState
            );

        }

    }

};


// ==========================================
// NÃO SOBRESCREVER O MULTIPLAYER
// ==========================================
//
// Se multiplayer.js já tiver criado
// window.Network, mantemos aquele objeto.
//
// Caso ainda não exista, deixamos esta camada
// disponível como fallback.
//

if (
    !window.Network
) {

    window.Network =
        NetworkLocal;

    console.log(
        "[Network] Modo local carregado."
    );

} else {

    console.log(
        "[Network] Multiplayer já existe. Não sobrescrevendo."
    );
}
```
