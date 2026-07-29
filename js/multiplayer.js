// 1. QUANDO O JOGADOR CLICA EM ENVIAR A PROPOSTA:
function enviarPropostaDeNegociacao(dadosDaProposta) {
    if (window.Network && window.Network.peer) {
        // Envia a oferta via rede para o outro jogador
        window.Network.sendGameAction('TRADE_OFFER', dadosDaProposta);
    }
}

// 2. RECEBER A PROPOSTA NO COMPUTADOR DO OUTRO JOGADOR:
window.executeTradeOffer = function(dadosDaProposta) {
    console.log("Proposta de negociação recebida:", dadosDaProposta);
    
    // INSIRA AQUI o código que exibe a modal/popup de Aceitar ou Recusar a negociação para o outro jogador!
};

// 3. QUANDO O OUTRO JOGADOR ACEITA OU REJEITA A PROPOSTA:
function responderNegociacao(aceito, dadosProposta) {
    if (window.Network && window.Network.peer) {
        window.Network.sendGameAction('TRADE_RESPONSE', { aceito: aceito, proposta: dadosProposta });
    }
}

window.executeTradeResponse = function(payload) {
    if (payload.aceito) {
        alert("A proposta de negociação foi aceita!");
        // Aplica a troca de propriedades/dinheiro no jogo
    } else {
        alert("A proposta de negociação foi recusada.");
    }
};
