/**
 * trade.js
 * Sistema de Trocas: negociação de propriedades e dinheiro entre jogadores (Host-Authoritative).
 *
 * Regras:
 * - Apenas o jogador da vez pode propor uma troca, para qualquer outro jogador ativo.
 * - Ao ser aceita, quem propôs paga ao banco uma taxa de negociação: o maior valor entre
 *   GAME_CONFIG.taxaTroca (fixo) e GAME_CONFIG.taxaTrocaPercent do dinheiro total envolvido na troca.
 */

let pendingTrade = null;

function calculateTradeFee(offerMoney, requestMoney) {
    const totalMoney = (offerMoney || 0) + (requestMoney || 0);
    return Math.max(GAME_CONFIG.taxaTroca, Math.round(totalMoney * GAME_CONFIG.taxaTrocaPercent));
}

// ==========================================
// AÇÕES DISPARADAS PELA UI (CLIENTE OU LOCAL)
// ==========================================
function proposeTrade(toPlayerId, offerProperties, offerMoney, requestProperties, requestMoney) {
    const payload = { toPlayerId, offerProperties, offerMoney, requestProperties, requestMoney };
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_PROPOSE_TRADE", payload);
    } else {
        hostProcessProposeTrade(window.Network ? window.Network.myPeerId : null, payload);
    }
}

function respondTrade(accept) {
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_RESPOND_TRADE", { accept });
    } else {
        hostProcessRespondTrade(window.Network ? window.Network.myPeerId : null, accept);
    }
}

function cancelTrade() {
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_CANCEL_TRADE");
    } else {
        hostProcessCancelTrade(window.Network ? window.Network.myPeerId : null);
    }
}

// ==========================================
// PROCESSADORES DE COMANDOS EXECUTADOS PELO HOST
// ==========================================
function hostProcessProposeTrade(senderPeerId, payload) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    if (pendingTrade || isMoving || awaitingDecision) return;

    const proposer = players[currentPlayerIndex];
    if (!proposer || proposer.isBankrupt) return;
    if (isMultiplayer && senderPeerId && proposer.peerId !== senderPeerId) return;

    const target = players.find(p => p.id === payload.toPlayerId);
    if (!target || target.isBankrupt || target.id === proposer.id) return;

    const offerProperties = Array.isArray(payload.offerProperties) ? payload.offerProperties : [];
    const requestProperties = Array.isArray(payload.requestProperties) ? payload.requestProperties : [];
    const offerMoney = Math.max(0, Math.floor(payload.offerMoney) || 0);
    const requestMoney = Math.max(0, Math.floor(payload.requestMoney) || 0);

    if (offerProperties.length === 0 && requestProperties.length === 0 && offerMoney === 0 && requestMoney === 0) return;

    const offerValid = offerProperties.every(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        return s && s.owner === proposer.id;
    });
    const requestValid = requestProperties.every(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        return s && s.owner === target.id;
    });
    if (!offerValid || !requestValid) return;

    const fee = calculateTradeFee(offerMoney, requestMoney);
    if (proposer.money < offerMoney + fee) {
        const msg = `⚠️ ${proposer.name} não tem saldo suficiente para propor essa troca (oferta + taxa de $${fee}).`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
        return;
    }

    pendingTrade = {
        fromPlayerId: proposer.id,
        toPlayerId: target.id,
        offerProperties,
        offerMoney,
        requestProperties,
        requestMoney,
        fee
    };

    const msg = `🤝 ${proposer.name} propôs uma negociação para ${target.name}!`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    refreshTradeUI();
}

function hostProcessRespondTrade(senderPeerId, accept) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    if (!pendingTrade) return;

    const target = players.find(p => p.id === pendingTrade.toPlayerId);
    if (!target) { pendingTrade = null; return; }
    if (isMultiplayer && senderPeerId && target.peerId !== senderPeerId) return;

    const proposer = players.find(p => p.id === pendingTrade.fromPlayerId);
    const trade = pendingTrade;
    pendingTrade = null;

    if (!accept) {
        const msg = `🚫 ${target.name} recusou a proposta de negociação de ${proposer.name}.`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
        refreshTradeUI();
        return;
    }

    const offerValid = trade.offerProperties.every(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        return s && s.owner === proposer.id;
    });
    const requestValid = trade.requestProperties.every(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        return s && s.owner === target.id;
    });
    const fundsValid = proposer.money >= trade.offerMoney + trade.fee && target.money >= trade.requestMoney;

    if (!offerValid || !requestValid || !fundsValid) {
        const msg = `⚠️ A negociação não pôde ser concluída: as condições mudaram (saldo ou propriedades inválidas).`;
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = msg;
        syncGameState(msg);
        refreshTradeUI();
        return;
    }

    proposer.money = proposer.money - trade.offerMoney - trade.fee + trade.requestMoney;
    target.money = target.money - trade.requestMoney + trade.offerMoney;

    trade.offerProperties.forEach(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        if (s) s.owner = target.id;
    });
    trade.requestProperties.forEach(id => {
        const s = boardSpaces.find(sp => sp.id === id);
        if (s) s.owner = proposer.id;
    });
    refreshBoardOwnership();

    const msg = `✅ Negociação concluída entre ${proposer.name} e ${target.name}! Taxa de $${trade.fee} paga ao banco por ${proposer.name}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    refreshTradeUI();
}

function hostProcessCancelTrade(senderPeerId) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    if (!pendingTrade) return;

    const proposer = players.find(p => p.id === pendingTrade.fromPlayerId);
    if (isMultiplayer && senderPeerId && proposer && proposer.peerId !== senderPeerId) return;

    const target = players.find(p => p.id === pendingTrade.toPlayerId);
    pendingTrade = null;

    const msg = `↩️ ${proposer ? proposer.name : "Um jogador"} cancelou a proposta de negociação${target ? ` para ${target.name}` : ""}.`;
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
    syncGameState(msg);
    refreshTradeUI();
}

// ==========================================
// SINCRONIZAÇÃO: RECONSTRÓI O ESTADO VISUAL DA NEGOCIAÇÃO
// ==========================================
function refreshTradeUI() {
    closeTradeModal();
    updateUI();
    if (!pendingTrade) return;

    const proposer = players.find(p => p.id === pendingTrade.fromPlayerId);
    const target = players.find(p => p.id === pendingTrade.toPlayerId);
    if (!proposer || !target) return;

    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const isLocalTarget = !isMultiplayer || target.peerId === myPeerId;
    const isLocalProposer = !isMultiplayer || proposer.peerId === myPeerId;

    if (isLocalTarget) {
        showTradeResponseModalUI(proposer, target, pendingTrade);
    } else if (isLocalProposer) {
        showTradeWaitingModalUI(proposer, target);
    } else {
        const statusDiv = document.getElementById("game-status");
        if (statusDiv) statusDiv.innerText = `🤝 Negociação em andamento entre ${proposer.name} e ${target.name}...`;
    }
}

// ==========================================
// INTERFACE: MODAL DE PROPOSTA DE TROCA
// ==========================================
function openTradeProposalModalUI(proposer, target) {
    closeTradeModal();
    const proposerProps = getOwnedSpaces(proposer.id);
    const targetProps = getOwnedSpaces(target.id);

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "trade-modal-overlay";
    overlay.innerHTML = `
        <div class="rules-box" style="max-width: 640px; text-align:left;">
            <h2 style="color:#1e90ff; margin-bottom: 15px;">🤝 Negociar com ${target.name}</h2>
            <div style="display:flex; gap:20px;">
                <div style="flex:1;">
                    <h4 style="margin-bottom:8px;">Você oferece</h4>
                    <div style="max-height:160px; overflow-y:auto; margin-bottom:10px; background:#1a293d; padding:8px; border-radius:6px;">
                        ${proposerProps.length ? proposerProps.map(s => `
                            <label style="display:block; font-size:0.8rem; margin-bottom:4px;">
                                <input type="checkbox" class="trade-offer-prop" value="${s.id}"> ${s.name}
                            </label>`).join("") : `<p style="color:#888; font-size:0.8rem;">Nenhuma propriedade.</p>`}
                    </div>
                    <label style="font-size:0.85rem;">Dinheiro (máx $${proposer.money}):
                        <input type="number" id="trade-offer-money" min="0" max="${proposer.money}" value="0" style="width:90px; margin-left:6px;">
                    </label>
                </div>
                <div style="flex:1;">
                    <h4 style="margin-bottom:8px;">Você pede</h4>
                    <div style="max-height:160px; overflow-y:auto; margin-bottom:10px; background:#1a293d; padding:8px; border-radius:6px;">
                        ${targetProps.length ? targetProps.map(s => `
                            <label style="display:block; font-size:0.8rem; margin-bottom:4px;">
                                <input type="checkbox" class="trade-request-prop" value="${s.id}"> ${s.name}
                            </label>`).join("") : `<p style="color:#888; font-size:0.8rem;">Nenhuma propriedade.</p>`}
                    </div>
                    <label style="font-size:0.85rem;">Dinheiro (máx $${target.money}):
                        <input type="number" id="trade-request-money" min="0" max="${target.money}" value="0" style="width:90px; margin-left:6px;">
                    </label>
                </div>
            </div>
            <div id="trade-fee-display" style="margin:15px 0; padding:10px; background:#1a293d; border-radius:6px; font-size:0.8rem; color:#aaa;"></div>
            <div style="display:flex; gap:10px;">
                <button id="btn-confirm-trade" style="padding: 8px 16px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Propor Troca</button>
                <button id="btn-cancel-trade-proposal" style="padding: 8px 16px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const feeDisplay = document.getElementById("trade-fee-display");
    const updateFeeDisplay = () => {
        const offerMoney = Math.max(0, parseInt(document.getElementById("trade-offer-money").value) || 0);
        const requestMoney = Math.max(0, parseInt(document.getElementById("trade-request-money").value) || 0);
        const fee = calculateTradeFee(offerMoney, requestMoney);
        feeDisplay.innerHTML = `Taxa de negociação (paga por você): <strong>$${fee}</strong> — maior valor entre $${GAME_CONFIG.taxaTroca} fixo e ${Math.round(GAME_CONFIG.taxaTrocaPercent * 100)}% do dinheiro negociado.`;
    };
    document.getElementById("trade-offer-money").addEventListener("input", updateFeeDisplay);
    document.getElementById("trade-request-money").addEventListener("input", updateFeeDisplay);
    updateFeeDisplay();

    document.getElementById("btn-cancel-trade-proposal").onclick = () => closeTradeModal();

    document.getElementById("btn-confirm-trade").onclick = () => {
        const offerProperties = Array.from(document.querySelectorAll(".trade-offer-prop:checked")).map(el => parseInt(el.value));
        const requestProperties = Array.from(document.querySelectorAll(".trade-request-prop:checked")).map(el => parseInt(el.value));
        const offerMoney = Math.max(0, parseInt(document.getElementById("trade-offer-money").value) || 0);
        const requestMoney = Math.max(0, parseInt(document.getElementById("trade-request-money").value) || 0);
        const fee = calculateTradeFee(offerMoney, requestMoney);

        if (offerProperties.length === 0 && requestProperties.length === 0 && offerMoney === 0 && requestMoney === 0) {
            alert("Selecione ao menos uma propriedade ou valor para negociar.");
            return;
        }
        if (offerMoney + fee > proposer.money) {
            alert(`Saldo insuficiente: você precisa de $${offerMoney + fee} (oferta + taxa de $${fee}) e tem $${proposer.money}.`);
            return;
        }
        if (requestMoney > target.money) {
            alert(`${target.name} não possui $${requestMoney} disponível.`);
            return;
        }

        // Se formos apenas enviar a requisição ao Host, fechamos o modal aqui (nada mais acontece
        // nesta tela até chegar o SYNC_GAME_STATE). Se formos processar localmente (Host ou modo
        // local), proposeTrade() já dispara hostProcessProposeTrade -> refreshTradeUI(), que troca
        // este modal pelo de resposta/espera — fechar de novo aqui removeria esse novo modal.
        const willSendToHost = isMultiplayer && window.Network && !window.Network.isHost;
        proposeTrade(target.id, offerProperties, offerMoney, requestProperties, requestMoney);
        if (willSendToHost) closeTradeModal();
    };
}

function showTradeResponseModalUI(proposer, target, trade) {
    closeTradeModal();
    const offerPropsNames = trade.offerProperties.map(id => (boardSpaces.find(s => s.id === id) || {}).name).filter(Boolean);
    const requestPropsNames = trade.requestProperties.map(id => (boardSpaces.find(s => s.id === id) || {}).name).filter(Boolean);

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "trade-modal-overlay";
    overlay.innerHTML = `
        <div class="rules-box" style="max-width: 500px; text-align:left;">
            <h2 style="color:#1e90ff; margin-bottom: 15px;">🤝 Proposta de ${proposer.name}</h2>
            <div style="background:#1a293d; padding:12px; border-radius:6px; margin-bottom:10px; font-size:0.9rem;">
                <p style="margin-bottom:8px;"><strong>Você recebe:</strong> ${[...offerPropsNames, trade.offerMoney > 0 ? `$${trade.offerMoney}` : null].filter(Boolean).join(", ") || "Nada"}</p>
                <p><strong>Você entrega:</strong> ${[...requestPropsNames, trade.requestMoney > 0 ? `$${trade.requestMoney}` : null].filter(Boolean).join(", ") || "Nada"}</p>
            </div>
            <p style="font-size:0.75rem; color:#888; margin-bottom:15px;">Taxa de negociação de $${trade.fee} será paga ao banco por ${proposer.name}, caso você aceite.</p>
            <div style="display:flex; gap:10px;">
                <button id="btn-accept-trade" style="padding: 8px 16px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Aceitar</button>
                <button id="btn-reject-trade" style="padding: 8px 16px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Recusar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("btn-accept-trade").onclick = () => respondTrade(true);
    document.getElementById("btn-reject-trade").onclick = () => respondTrade(false);
}

function showTradeWaitingModalUI(proposer, target) {
    closeTradeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "trade-modal-overlay";
    overlay.innerHTML = `
        <div class="rules-box text-center" style="max-width: 420px;">
            <h2 style="color:#1e90ff; margin-bottom: 10px;">⏳ Aguardando resposta</h2>
            <p style="margin-bottom:20px; color:#ccc;">Aguardando ${target.name} decidir sobre a sua proposta de negociação...</p>
            <button id="btn-cancel-pending-trade" style="padding: 8px 16px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar Proposta</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("btn-cancel-pending-trade").onclick = () => cancelTrade();
}

function closeTradeModal() {
    const el = document.getElementById("trade-modal-overlay");
    if (el) el.remove();
}

window.hostProcessProposeTrade = hostProcessProposeTrade;
window.hostProcessRespondTrade = hostProcessRespondTrade;
window.hostProcessCancelTrade = hostProcessCancelTrade;
window.openTradeProposalModalUI = openTradeProposalModalUI;
