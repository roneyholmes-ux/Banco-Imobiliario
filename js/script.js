// ====== MOTOR DO JOGO - BANCO IMOBILIÁRIO ======

// 1. Definição das Casas do Tabuleiro (Tabuleiro Oficial Simplificado para a V1)
const BOARD_DATA = [
    { id: 0, name: "PONTO DE PARTIDA", type: "special", color: "#ffffff" },
    { id: 1, name: "Avenida Paulista", type: "property", price: 100, rent: 6, color: "#9c27b0" },
    { id: 2, name: "Cofre de Comunidade", type: "special", color: "#ffffff" },
    { id: 3, name: "Avenida Brigadeiro Luís Antônio", type: "property", price: 120, rent: 8, color: "#9c27b0" },
    { id: 4, name: "Imposto de Renda", type: "tax", price: 200, color: "#ffffff" },
    { id: 5, name: "Ferrovia Viação Rio-Doce", type: "railroad", price: 200, rent: 25, color: "#e0e0e0" },
    { id: 6, name: "Rua Conselheiro Crispiniano", type: "property", price: 140, rent: 10, color: "#03a9f4" },
    { id: 7, name: "Sorte ou Revés", type: "lucky", color: "#ffffff" },
    { id: 8, name: "Avenida São João", type: "property", price: 140, rent: 10, color: "#03a9f4" },
    { id: 9, name: "Avenida Ipiranga", type: "property", price: 160, rent: 12, color: "#03a9f4" },
    { id: 10, name: "PRISÃO (VISITA)", type: "special", color: "#ffffff" },
    { id: 11, name: "Avenida Nossa Senhora de Copacabana", type: "property", price: 180, rent: 14, color: "#e91e63" },
    { id: 12, name: "Companhia de Força e Luz", type: "utility", price: 150, color: "#e0e0e0" },
    { id: 13, name: "Avenida Atlântica", type: "property", price: 180, rent: 14, color: "#e91e63" },
    { id: 14, name: "Avenida República do Líbano", type: "property", price: 200, rent: 16, color: "#e91e63" },
    { id: 15, name: "Viação Anhanguera", type: "railroad", price: 200, rent: 25, color: "#e0e0e0" },
    { id: 16, name: "Rua Padre João Manuel", type: "property", price: 220, rent: 18, color: "#ff9800" },
    { id: 17, name: "Cofre de Comunidade", type: "special", color: "#ffffff" },
    { id: 18, name: "Avenida Paulista (Recife)", type: "property", price: 220, rent: 18, color: "#ff9800" },
    { id: 19, name: "Avenida Boa Viagem", type: "property", price: 240, rent: 20, color: "#ff9800" },
    { id: 20, name: "PARADA LIVRE", type: "special", color: "#ffffff" },
    { id: 21, name: "Avenida Bento Gonçalves", type: "property", price: 260, rent: 22, color: "#f44336" },
    { id: 22, name: "Sorte ou Revés", type: "lucky", color: "#ffffff" },
    { id: 23, name: "Avenida 24 de Outubro", type: "property", price: 260, rent: 22, color: "#f44336" },
    { id: 24, name: "Avenida Independência", type: "property", price: 280, rent: 24, color: "#f44336" },
    { id: 25, name: "Viação Cometa", type: "railroad", price: 200, rent: 25, color: "#e0e0e0" },
    { id: 26, name: "Avenida Afonso Pena", type: "property", price: 300, rent: 26, color: "#ffeb3b" },
    { id: 27, name: "Avenida Amazonas", type: "property", price: 300, rent: 26, color: "#ffeb3b" },
    { id: 28, name: "Companhia de Água e Saneamento", type: "utility", price: 150, color: "#e0e0e0" },
    { id: 29, name: "Avenida Afonso Pena (RS)", type: "property", price: 320, rent: 28, color: "#ffeb3b" },
    { id: 30, name: "VÁ PARA A PRISÃO", type: "special", color: "#ffffff" },
    { id: 31, name: "Rua Jereissati", type: "property", price: 350, rent: 35, color: "#4caf50" },
    { id: 32, name: "Cofre de Comunidade", type: "special", color: "#ffffff" },
    { id: 33, name: "Avenida Beira Mar", type: "property", price: 400, rent: 50, color: "#4caf50" },
    { id: 34, name: "Taxa de Luxo", type: "tax", price: 100, color: "#ffffff" },
    { id: 35, name: "Interbairros", type: "railroad", price: 200, rent: 25, color: "#e0e0e0" },
    { id: 36, name: "Sorte ou Revés", type: "lucky", color: "#ffffff" },
    { id: 37, name: "Avenida Rebouças", type: "property", price: 350, rent: 35, color: "#3f51b5" },
    { id: 38, name: "Avenida Brigadeiro Faria Lima", type: "property", price: 400, rent: 50, color: "#3f51b5" }
];

// 2. Inicialização do Estado do Jogo
const gameState = {
    players: [
        { id: 1, name: "Jogador Vermelho", position: 0, money: 1500, color: "#ff4d4d" },
        { id: 2, name: "Jogador Azul", position: 0, money: 1500, color: "#4d79ff" }
    ],
    currentPlayerIndex: 0,
    propertiesOwners: {} // Armazenará { houseId: playerId }
};

// 3. Função para Renderizar o Tabuleiro na Tela (Log em texto por enquanto)
function initializeGame() {
    console.log("🎲 Banco Imobiliário carregado com sucesso!");
    console.log("Casas configuradas no motor:", BOARD_DATA.length);
    console.log("Jogadores prontos no Ponto de Partida com R$ 1500 cada!");
}

// Iniciar tudo ao carregar a página
window.onload = initializeGame;
