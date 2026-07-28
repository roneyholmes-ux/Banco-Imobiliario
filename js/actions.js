/**
 * actions.js
 * Centraliza e valida todas as ações enviadas pelos jogadores antes de alterar o Game State.
 */

const Actions = {
  /**
   * Recebe a mensagem enviada via Network.sendAction
   */
  handleAction(message) {
    const { type, payload, senderId } = message;

    // Apenas o Host executa as alterações oficiais de estado
    if (!window.Network || !window.Network.isHost) {
      return;
    }

    console.log(`[Host Actions] Processando ação: ${type}`, payload);

    switch (type) {
      case 'JOIN_GAME':
        if (window.Game && typeof window.Game.addPlayer === 'function') {
          window.Game.addPlayer(payload.playerName, senderId);
        }
        break;

      case 'ROLL_DICE':
        if (window.Game && typeof window.Game.rollDice === 'function') {
          window.Game.rollDice(senderId);
        }
        break;

      case 'BUY_PROPERTY':
        if (window.Game && typeof window.Game.buyProperty === 'function') {
          window.Game.buyProperty(senderId, payload.propertyId);
        }
        break;

      case 'END_TURN':
        if (window.Game && typeof window.Game.endTurn === 'function') {
          window.Game.endTurn(senderId);
        }
        break;

      default:
        console.warn(`[Actions] Tipo de ação desconhecido: ${type}`);
        break;
    }

    // Após qualquer alteração de estado válida, envia o estado renovado a todos
    if (window.Game && typeof window.Game.getState === 'function') {
      window.Network.broadcastGameState(window.Game.getState());
    }
  }
};

window.Actions = Actions;
