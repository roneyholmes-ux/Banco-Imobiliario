/**
 * landing.js
 * Gerencia a navegação e o modal de escolha de modo de jogo.
 */

function openPlayModal() {
    const modal = document.getElementById('play-mode-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePlayModal() {
    const modal = document.getElementById('play-mode-modal');
    if (modal) modal.classList.add('hidden');
}

function selectGameMode(mode) {
    // Redireciona diretamente para a nova página do jogo passando o modo na URL
    window.location.href = `game.html?mode=${mode}`;
}

function toggleFaq(element) {
    element.classList.toggle('active');
    const icon = element.querySelector('.faq-icon');
    if (icon) {
        icon.innerText = element.classList.contains('active') ? '-' : '+';
    }
}
