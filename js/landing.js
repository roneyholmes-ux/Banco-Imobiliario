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
// Atrelamento genérico dos botões de ação à camada Network
document.getElementById('btn-roll-dice')?.addEventListener('click', () => {
  Network.sendAction('ROLL_DICE');
});

document.getElementById('btn-buy-property')?.addEventListener('click', () => {
  Network.sendAction('BUY_PROPERTY');
});

document.getElementById('btn-end-turn')?.addEventListener('click', () => {
  Network.sendAction('END_TURN');
});
