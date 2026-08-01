/**
 * cards.js
 * Sistema de Cartas de Sorte ou Revés: Cartas Objetivas (múltipla escolha, com resposta
 * correta) e Cartas de Investigação (dissertativas, julgadas informalmente pelo grupo).
 * Host-Authoritative, seguindo o mesmo padrão de trade.js.
 *
 * Fluxo (pendingCard.phase):
 *   choosing-mode -> answering (objetiva) | judging (dissertativa)
 *                 -> reward-choice | penalty-choice | done
 */

let pendingCard = null;

// ==========================================
// SORTEIO (INICIADO PELO HOST/LOCAL AO CAIR EM "SORTE OU REVÉS")
// ==========================================
function drawCard(player) {
    const card = CARDS[Math.floor(Math.random() * CARDS.length)];
    pendingCard = {
        card,
        drawerId: player.id,
        phase: "choosing-mode",
        mode: null,
        selectedAnswer: null,
        outcome: null,
        resultMessage: null
    };

    const msg = `🃏 ${player.name} tirou uma carta de Sorte ou Revés!`;
    updateStatus(msg);
    syncGameState(msg);
    refreshCardUI();
}

function updateStatus(msg) {
    const statusDiv = document.getElementById("game-status");
    if (statusDiv) statusDiv.innerText = msg;
}

function addFicha(player, type, amount = 1) {
    if (type === "continua") player.fichasContinua = (player.fichasContinua || 0) + amount;
    else player.fichasDiscreta = (player.fichasDiscreta || 0) + amount;
}

function removeFicha(player, type, amount = 1) {
    if (type === "continua") player.fichasContinua = Math.max(0, (player.fichasContinua || 0) - amount);
    else player.fichasDiscreta = Math.max(0, (player.fichasDiscreta || 0) - amount);
}

// ==========================================
// AÇÕES DISPARADAS PELA UI (CLIENTE OU LOCAL)
// ==========================================
function sendCardAction(step, payload = {}) {
    const fullPayload = Object.assign({ step }, payload);
    if (isMultiplayer && window.Network && !window.Network.isHost) {
        sendNetworkAction("REQUEST_CARD_ACTION", fullPayload);
    } else {
        hostProcessCardAction(window.Network ? window.Network.myPeerId : null, step, fullPayload);
    }
}

function chooseCardMode(mode) { sendCardAction("choose-mode", { mode }); }
function submitCardAnswer(letter) { sendCardAction("submit-answer", { letter }); }
function judgeDissertativa(accepted) { sendCardAction("judge-dissertativa", { accepted }); }
function chooseFichaReward(types) { sendCardAction("choose-reward", { types }); }
function choosePenaltyFicha(fichaType) { sendCardAction("choose-penalty", { fichaType }); }
function closeCardResult() { sendCardAction("close"); }

// ==========================================
// PROCESSADOR HOST (DISPATCH)
// ==========================================
function hostProcessCardAction(senderPeerId, step, payload) {
    if (isMultiplayer && window.Network && !window.Network.isHost) return;
    if (!pendingCard) return;

    const drawer = players.find(p => p.id === pendingCard.drawerId);
    if (!drawer) { pendingCard = null; return; }

    switch (step) {
        case "choose-mode": handleChooseMode(senderPeerId, drawer, payload); break;
        case "submit-answer": handleSubmitAnswer(senderPeerId, drawer, payload); break;
        case "judge-dissertativa": handleJudgeDissertativa(senderPeerId, drawer, payload); break;
        case "choose-reward": handleChooseReward(senderPeerId, drawer, payload); break;
        case "choose-penalty": handleChoosePenalty(senderPeerId, drawer, payload); break;
        case "close": handleCloseCard(senderPeerId, drawer); break;
    }
}

function handleChooseMode(senderPeerId, drawer, payload) {
    if (pendingCard.phase !== "choosing-mode") return;
    if (isMultiplayer && senderPeerId && drawer.peerId !== senderPeerId) return;
    if (payload.mode !== "individual" && payload.mode !== "colaborativa") return;

    pendingCard.mode = payload.mode;
    pendingCard.phase = pendingCard.card.type === "objetiva" ? "answering" : "judging";

    const modeLabel = payload.mode === "individual" ? "Individual" : "Investigação Colaborativa";
    const msg = `🃏 ${drawer.name} escolheu responder no modo: ${modeLabel}.`;
    updateStatus(msg);
    syncGameState(msg);
    refreshCardUI();
}

function handleSubmitAnswer(senderPeerId, drawer, payload) {
    if (pendingCard.phase !== "answering") return;
    if (isMultiplayer && senderPeerId && drawer.peerId !== senderPeerId) return;
    if (!["A", "B", "C", "D"].includes(payload.letter)) return;

    pendingCard.selectedAnswer = payload.letter;
    const correct = payload.letter === pendingCard.card.answer;
    pendingCard.outcome = correct ? "correct" : "incorrect";
    advanceAfterOutcome(drawer, correct);
}

function handleJudgeDissertativa(senderPeerId, drawer, payload) {
    if (pendingCard.phase !== "judging") return;
    if (isMultiplayer && senderPeerId && drawer.peerId === senderPeerId) return; // o autor não julga a própria resposta

    pendingCard.outcome = payload.accepted ? "correct" : "incorrect";
    advanceAfterOutcome(drawer, !!payload.accepted);
}

function advanceAfterOutcome(drawer, correct) {
    const mode = pendingCard.mode;

    if (mode === "individual") {
        if (correct) {
            pendingCard.phase = "reward-choice";
            const msg = `✅ Resposta correta! ${drawer.name} deve escolher o tipo das 2 Fichas de Investigação recebidas.`;
            updateStatus(msg);
            syncGameState(msg);
        } else {
            const totalFichas = (drawer.fichasContinua || 0) + (drawer.fichasDiscreta || 0);
            if (totalFichas > 0) {
                pendingCard.phase = "penalty-choice";
                const msg = `❌ Resposta incorreta. ${drawer.name} deve escolher qual ficha perder.`;
                updateStatus(msg);
                syncGameState(msg);
            } else {
                drawer.money -= GAME_CONFIG.cardFichaPenalty;
                pendingCard.phase = "done";
                pendingCard.resultMessage = `❌ Resposta incorreta. ${drawer.name} não possuía fichas e pagou $${GAME_CONFIG.cardFichaPenalty} de penalidade ao banco.`;
                updateStatus(pendingCard.resultMessage);
                syncGameState(pendingCard.resultMessage);
            }
        }
    } else {
        if (correct) {
            pendingCard.phase = "reward-choice";
            const msg = `✅ O grupo acertou! ${drawer.name} deve escolher o tipo da Ficha de Investigação que todos vão receber.`;
            updateStatus(msg);
            syncGameState(msg);
        } else {
            pendingCard.phase = "done";
            pendingCard.resultMessage = `❌ O grupo não teve a argumentação aceita. Ninguém perde fichas nem paga penalidade.`;
            updateStatus(pendingCard.resultMessage);
            syncGameState(pendingCard.resultMessage);
        }
    }

    refreshCardUI();
}

function handleChooseReward(senderPeerId, drawer, payload) {
    if (pendingCard.phase !== "reward-choice") return;
    if (isMultiplayer && senderPeerId && drawer.peerId !== senderPeerId) return;

    const types = payload.types;
    if (!Array.isArray(types) || types.some(t => t !== "continua" && t !== "discreta")) return;

    if (pendingCard.mode === "individual") {
        if (types.length !== 2) return;
        types.forEach(t => addFicha(drawer, t, 1));
        pendingCard.resultMessage = `🔬 ${drawer.name} recebeu 2 Fichas de Investigação (${types.map(fichaTypeLabel).join(" + ")}).`;
    } else {
        if (types.length !== 1) return;
        const type = types[0];
        players.forEach(p => addFicha(p, type, 1));
        pendingCard.resultMessage = `🔬 Todos os jogadores receberam 1 Ficha de Grandeza ${fichaTypeLabel(type)}!`;
    }

    pendingCard.phase = "done";
    updateStatus(pendingCard.resultMessage);
    syncGameState(pendingCard.resultMessage);
    refreshCardUI();
}

function handleChoosePenalty(senderPeerId, drawer, payload) {
    if (pendingCard.phase !== "penalty-choice") return;
    if (isMultiplayer && senderPeerId && drawer.peerId !== senderPeerId) return;

    const type = payload.fichaType;
    if (type !== "continua" && type !== "discreta") return;
    const owned = type === "continua" ? (drawer.fichasContinua || 0) : (drawer.fichasDiscreta || 0);
    if (owned <= 0) return;

    removeFicha(drawer, type, 1);
    pendingCard.phase = "done";
    pendingCard.resultMessage = `❌ ${drawer.name} perdeu 1 Ficha de Grandeza ${fichaTypeLabel(type)}.`;
    updateStatus(pendingCard.resultMessage);
    syncGameState(pendingCard.resultMessage);
    refreshCardUI();
}

function handleCloseCard(senderPeerId, drawer) {
    if (pendingCard.phase !== "done") return;
    if (isMultiplayer && senderPeerId && drawer.peerId !== senderPeerId) return;

    pendingCard = null;
    closeCardModal();
    syncGameState();
    nextTurn();
}

// ==========================================
// SINCRONIZAÇÃO: RECONSTRÓI O ESTADO VISUAL DA CARTA
// ==========================================
function refreshCardUI() {
    if (!pendingCard) {
        closeCardModal();
        updateUI();
        return;
    }

    const drawer = players.find(p => p.id === pendingCard.drawerId);
    if (!drawer) {
        closeCardModal();
        updateUI();
        return;
    }

    const myPeerId = window.Network ? window.Network.myPeerId : null;
    const isLocalDrawer = !isMultiplayer || drawer.peerId === myPeerId;

    let overlay = document.getElementById("card-modal-overlay");
    let justCreated = false;
    if (!overlay) {
        overlay = buildCardModalShell();
        document.body.appendChild(overlay);
        justCreated = true;
    }

    fillCardFrontContent(overlay, pendingCard.card);
    renderCardActionArea(overlay, drawer, isLocalDrawer, myPeerId);

    if (justCreated) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const inner = document.getElementById("card-flip-inner");
                if (inner) inner.classList.add("flipped");
            });
        });
    }

    updateUI();
}

function closeCardModal() {
    const el = document.getElementById("card-modal-overlay");
    if (el) el.remove();
}

// ==========================================
// CONSTRUÇÃO DO MODAL (CARTA 3D + ÁREA DE AÇÃO)
// ==========================================
function buildCardModalShell() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "card-modal-overlay";
    overlay.innerHTML = `
        <div class="rules-box card-modal-box">
            <div class="card-flip-wrapper">
                <div class="card-flip-inner" id="card-flip-inner">
                    <div class="card-face card-face-back">
                        <div style="font-size:2.8rem;">🃏</div>
                        <div style="margin-top:10px; font-size:1rem; letter-spacing:1px;">SORTE OU REVÉS</div>
                    </div>
                    <div class="card-face card-face-front" id="card-face-front"></div>
                </div>
            </div>
            <div class="card-action-area" id="card-action-area"></div>
        </div>
    `;
    return overlay;
}

function fillCardFrontContent(overlay, card) {
    const front = overlay.querySelector("#card-face-front");
    if (!front || front.dataset.cardId === String(card.id)) return;
    front.dataset.cardId = String(card.id);

    const badge = card.type === "objetiva" ? "📘 Carta Objetiva" : "💬 Carta de Investigação";
    let optionsHtml = "";
    if (card.type === "objetiva") {
        optionsHtml = `<ul class="card-options-list">
            ${Object.entries(card.options).map(([letter, text]) => `<li><strong>${letter})</strong> ${text}</li>`).join("")}
        </ul>`;
    }
    front.innerHTML = `
        <span class="card-type-badge">${badge}</span>
        <p class="card-question-text">${card.text}</p>
        ${optionsHtml}
    `;
}

function renderCardActionArea(overlay, drawer, isLocalDrawer, myPeerId) {
    const area = overlay.querySelector("#card-action-area");
    if (!area) return;

    const phase = pendingCard.phase;
    const card = pendingCard.card;

    if (phase === "choosing-mode") {
        if (isLocalDrawer) {
            area.innerHTML = `
                <p class="card-action-hint">Como você quer responder?</p>
                <div class="card-btn-row">
                    <button id="btn-mode-individual" class="card-btn">🧍 Individual</button>
                    <button id="btn-mode-colaborativa" class="card-btn card-btn-primary">🤝 Investigação Colaborativa</button>
                </div>
            `;
            area.querySelector("#btn-mode-individual").onclick = () => chooseCardMode("individual");
            area.querySelector("#btn-mode-colaborativa").onclick = () => chooseCardMode("colaborativa");
        } else {
            area.innerHTML = `<p class="card-action-hint">Aguardando ${drawer.name} escolher como vai responder...</p>`;
        }
        return;
    }

    if (phase === "answering") {
        if (isLocalDrawer) {
            const modeNote = pendingCard.mode === "colaborativa"
                ? `<p class="card-action-hint">🤝 Discutam em voz alta e depois enviem a resposta do grupo.</p>`
                : `<p class="card-action-hint">Responda sozinho, sem ajuda dos demais.</p>`;
            area.innerHTML = `
                ${modeNote}
                <div class="card-btn-row card-answer-row">
                    ${["A", "B", "C", "D"].map(l => `<button class="card-btn card-answer-btn" data-letter="${l}">${l}</button>`).join("")}
                </div>
            `;
            area.querySelectorAll(".card-answer-btn").forEach(btn => {
                btn.onclick = () => submitCardAnswer(btn.dataset.letter);
            });
        } else {
            area.innerHTML = `<p class="card-action-hint">Aguardando a resposta de ${drawer.name}...</p>`;
        }
        return;
    }

    if (phase === "judging") {
        const isLocalJudge = !isMultiplayer || drawer.peerId !== myPeerId;
        if (isLocalJudge) {
            area.innerHTML = `
                <p class="card-action-hint">A argumentação de ${drawer.name} foi aceita pelo grupo?</p>
                <div class="card-btn-row">
                    <button id="btn-judge-accept" class="card-btn card-btn-success">✅ Aceitar</button>
                    <button id="btn-judge-reject" class="card-btn card-btn-danger">❌ Recusar</button>
                </div>
            `;
            area.querySelector("#btn-judge-accept").onclick = () => judgeDissertativa(true);
            area.querySelector("#btn-judge-reject").onclick = () => judgeDissertativa(false);
        } else {
            area.innerHTML = `<p class="card-action-hint">Discuta sua resposta em voz alta com os demais jogadores. Eles vão decidir se ela demonstra compreensão suficiente.</p>`;
        }
        return;
    }

    if (phase === "reward-choice") {
        if (isLocalDrawer) {
            if (pendingCard.mode === "individual") {
                area.innerHTML = `
                    <p class="card-action-hint">Escolha o tipo das 2 Fichas de Investigação que você vai receber:</p>
                    <div class="card-btn-row">
                        <button id="btn-reward-cc" class="card-btn">🔵🔵 2x Contínua</button>
                        <button id="btn-reward-dd" class="card-btn">🟣🟣 2x Discreta</button>
                        <button id="btn-reward-cd" class="card-btn">🔵🟣 1 de cada</button>
                    </div>
                `;
                area.querySelector("#btn-reward-cc").onclick = () => chooseFichaReward(["continua", "continua"]);
                area.querySelector("#btn-reward-dd").onclick = () => chooseFichaReward(["discreta", "discreta"]);
                area.querySelector("#btn-reward-cd").onclick = () => chooseFichaReward(["continua", "discreta"]);
            } else {
                area.innerHTML = `
                    <p class="card-action-hint">Escolha o tipo da Ficha de Investigação que todos os jogadores vão receber:</p>
                    <div class="card-btn-row">
                        <button id="btn-reward-c" class="card-btn">🔵 Grandeza Contínua</button>
                        <button id="btn-reward-d" class="card-btn">🟣 Grandeza Discreta</button>
                    </div>
                `;
                area.querySelector("#btn-reward-c").onclick = () => chooseFichaReward(["continua"]);
                area.querySelector("#btn-reward-d").onclick = () => chooseFichaReward(["discreta"]);
            }
        } else {
            area.innerHTML = `<p class="card-action-hint">Aguardando ${drawer.name} escolher o tipo da ficha...</p>`;
        }
        return;
    }

    if (phase === "penalty-choice") {
        if (isLocalDrawer) {
            const hasContinua = (drawer.fichasContinua || 0) > 0;
            const hasDiscreta = (drawer.fichasDiscreta || 0) > 0;
            area.innerHTML = `
                <p class="card-action-hint">Resposta incorreta. Escolha qual ficha você vai perder:</p>
                <div class="card-btn-row">
                    ${hasContinua ? `<button id="btn-penalty-c" class="card-btn card-btn-danger">🔵 Perder 1 Contínua (tenho ${drawer.fichasContinua})</button>` : ""}
                    ${hasDiscreta ? `<button id="btn-penalty-d" class="card-btn card-btn-danger">🟣 Perder 1 Discreta (tenho ${drawer.fichasDiscreta})</button>` : ""}
                </div>
            `;
            if (hasContinua) area.querySelector("#btn-penalty-c").onclick = () => choosePenaltyFicha("continua");
            if (hasDiscreta) area.querySelector("#btn-penalty-d").onclick = () => choosePenaltyFicha("discreta");
        } else {
            area.innerHTML = `<p class="card-action-hint">Aguardando ${drawer.name} escolher qual ficha perder...</p>`;
        }
        return;
    }

    if (phase === "done") {
        const outcomeLabel = pendingCard.outcome === "correct" ? "✅ Aceito / Correto" : "❌ Não aceito / Incorreto";
        const answerReveal = card.type === "objetiva"
            ? `<p class="card-answer-reveal">Resposta correta: <strong>${card.answer}) ${card.options[card.answer]}</strong></p>`
            : "";
        area.innerHTML = `
            <p class="card-outcome-badge ${pendingCard.outcome}">${outcomeLabel}</p>
            ${answerReveal}
            <p class="card-action-hint">${pendingCard.resultMessage || ""}</p>
            ${isLocalDrawer
                ? `<button id="btn-close-card" class="card-btn card-btn-primary" style="margin-top: 6px;">Continuar</button>`
                : `<p class="card-action-hint">Aguardando ${drawer.name} continuar...</p>`}
        `;
        if (isLocalDrawer) {
            area.querySelector("#btn-close-card").onclick = () => closeCardResult();
        }
        return;
    }
}

window.hostProcessCardAction = hostProcessCardAction;
