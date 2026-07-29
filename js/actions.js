// actions.js - Gatilhos de Ações do Usuário

const Actions = {
    // Chamado pelo clique do botão "Jogar Dado"
    rollDice() {
        Multiplayer.sendActionToHost('ROLL_DICE');
    },

    // Chamado pelo clique do botão "Comprar Propriedade"
    buyProperty(propertyId) {
        Multiplayer.sendActionToHost('BUY_PROPERTY', { propertyId: propertyId });
    },

    // Chamado pelo clique do botão "Passar Vez"
    endTurn() {
        Multiplayer.sendActionToHost('END_TURN');
    }
};
