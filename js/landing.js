// Funções de navegação e interações da página institucional
function scrollToGame() {
    const gameArea = document.getElementById('game-section-area');
    gameArea.classList.remove('hidden');
    if(typeof startPlayerSetup === 'function' && typeof players !== 'undefined' && players.length === 0){
        startPlayerSetup();
    }
    gameArea.scrollIntoView({ behavior: 'smooth' });
}

function toggleFaq(element) {
    element.classList.toggle('active');
    const icon = element.querySelector('.faq-icon');
    icon.innerText = element.classList.contains('active') ? '-' : '+';
}
