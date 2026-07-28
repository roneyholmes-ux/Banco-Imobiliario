/**
 * GERENCIADOR DA LANDING PAGE E NAVEGAÇÃO
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Landing page carregada com sucesso.");
});

// 1. MODO LOCAL (Single Device / Pass & Play)
function iniciarJogoLocal() {
    const qtdStr = prompt("Quantos jogadores vão jogar localmente no mesmo dispositivo? (2 a 6):", "2");
    if (!qtdStr) return;

    const qtd = parseInt(qtdStr, 10);
    if (isNaN(qtd) || qtd < 2 || qtd > 6) {
        alert("Por favor, escolha um número de jogadores entre 2 e 6.");
        return;
    }

    // Salva a quantidade local no sessionStorage e redireciona para o tabuleiro
    sessionStorage.setItem('qtdJogadoresLocal', qtd);
    sessionStorage.setItem('modoJogo', 'local');
    window.location.href = 'game.html'; // Ou index.html/tabuleiro de acordo com suas rotas
}

// 2. MODO MULTIPLAYER ONLINE (PeerJS)
function abrirModalMultiplayer() {
    // Garante que o script do PeerJS/Multiplayer está carregado
    if (typeof criarSalaOnline !== 'function' || typeof entrarNaSalaOnline !== 'function') {
        alert("Erro: O sistema multiplayer não foi carregado corretamente. Recarregue a página e tente novamente.");
        return;
    }

    const escolha = prompt(
        "ESCOLHA O MODO MULTIPLAYER:\n\n" +
        "1 - Criar uma nova Sala (Você será o Host)\n" +
        "2 - Entrar em uma Sala Existente (Usando Código)\n\n" +
        "Digite 1 ou 2:",
        "1"
    );

    if (escolha === "1") {
        sessionStorage.setItem('modoJogo', 'multiplayer');
        criarSalaOnline();
    } else if (escolha === "2") {
        const codigo = prompt("Digite o código da sala gerado pelo seu amigo:");
        if (codigo && codigo.trim() !== "") {
            sessionStorage.setItem('modoJogo', 'multiplayer');
            entrarNaSalaOnline(codigo.trim());
        } else if (codigo !== null) {
            alert("O código da sala não pode estar vazio!");
        }
    }
}

// 3. REGRA E NAVEGAÇÃO
function abrirRegras() {
    const modal = document.getElementById('modal-regras');
    if (modal) {
        modal.style.display = 'block';
    } else {
        alert("Regras: O objetivo do Banco Imobiliário é comprar propriedades, gerenciar recursos e falir os oponentes.");
    }
}

function fecharRegras() {
    const modal = document.getElementById('modal-regras');
    if (modal) {
        modal.style.display = 'none';
    }
}
