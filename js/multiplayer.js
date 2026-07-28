/**
 * GERENCIADOR MULTIPLAYER (Host-Client) - Até 6 Jogadores via PeerJS
 */

let peer = null;
let conexoes = []; // Lista de conexões ativas (se for Host)
let conexaoHost = null; // Conexão com o Host (se for Client)
let ehHost = false;
let jogoIniciado = false;
let meuIdPeer = '';

// 1. CRIAR SALA (HOST)
function criarSalaOnline() {
    ehHost = true;
    conexoes = [];
    jogoIniciado = false;

    // Inicializa o PeerJS (gera um ID único de sala)
    peer = new Peer();

    peer.on('open', (id) => {
        meuIdPeer = id;
        console.log("Sala criada com o Código ID:", id);
        
        // Exibe o código da sala na tela para o Host compartilhar
        mostrarCodigoSala(id);
    });

    peer.on('connection', (conn) => {
        // TRAVA DE SEGURANÇA: Bloqueia entradas se o jogo já começou ou se atingiu 6 jogadores
        if (jogoIniciado) {
            conn.on('open', () => {
                conn.send({ tipo: 'ERRO', mensagem: 'A partida já está em andamento!' });
                setTimeout(() => conn.close(), 500);
            });
            return;
        }

        if (conexoes.length >= 5) { // 1 Host + 5 Convidados = 6 Jogadores
            conn.on('open', () => {
                conn.send({ tipo: 'ERRO', mensagem: 'A sala já atingiu o limite de 6 jogadores!' });
                setTimeout(() => conn.close(), 500);
            });
            return;
        }

        // Aceita a nova conexão
        conexoes.push(conn);
        configurarEscutaConexao(conn);

        conn.on('open', () => {
            console.log("Novo jogador entrou na sala!");
            atualizarListaLobby();
        });
    });

    peer.on('error', (err) => {
        alert("Erro na rede multiplayer: " + err);
    });
}

// 2. ENTRAR EM UMA SALA EXISTENTE (CLIENT)
function entrarNaSalaOnline(codigoSala) {
    if (!codigoSala) {
        alert("Por favor, insira o código da sala!");
        return;
    }

    ehHost = false;
    peer = new Peer();

    peer.on('open', (id) => {
        meuIdPeer = id;
        console.log("Conectando ao Host do código:", codigoSala);
        
        // Conecta ao Host usando o código fornecido
        conexaoHost = peer.connect(codigoSala);
        configurarEscutaConexao(conexaoHost);
    });

    peer.on('error', (err) => {
        alert("Não foi possível encontrar a sala com este código. Verifique e tente novamente.");
    });
}

// 3. ESCUTAR MENSAGENS RECEBIDAS DE OUTROS JOGADORES
function configurarEscutaConexao(conn) {
    conn.on('data', (dados) => {
        console.log("Mensagem recebida:", dados);

        // Se a sala recusou a entrada
        if (dados.tipo === 'ERRO') {
            alert(dados.mensagem);
            return;
        }

        // Se o Host iniciou a partida
        if (dados.tipo === 'INICIAR_PARTIDA') {
            jogoIniciado = true;
            if (typeof iniciarTabuleiroMultiplayer === 'function') {
                iniciarTabuleiroMultiplayer(dados.jogadores);
            }
        }

        // Sincroniza ações do jogo (Dados, Compras, Passar Vez)
        if (dados.tipo === 'ACAO_JOGO') {
            if (typeof processarAcaoRemota === 'function') {
                processarAcaoRemota(dados.acao);
            }
        }

        // Se for o Host, retransmite a ação para TODOS os outros 5 navegadores (Broadcast)
        if (ehHost) {
            retransmitirParaTodos(dados, conn.peer);
        }
    });

    conn.on('close', () => {
        console.log("Um participante desconectou.");
        conexoes = conexoes.filter(c => c.peer !== conn.peer);
    });
}

// 4. RETRANSMISSÃO DO HOST PARA DEMAIS NAVEGADORES (BROADCAST)
function retransmitirParaTodos(dados, idRemetente) {
    conexoes.forEach(c => {
        // Envia para todo mundo, exceto quem originou a ação
        if (c.peer !== idRemetente && c.open) {
            c.send(dados);
        }
    });
}

// 5. DISPARAR AÇÃO (Chamado pelo game.js quando um jogador clica em algo)
function enviarAcaoMultiplayer(acao) {
    const pacote = { tipo: 'ACAO_JOGO', acao: acao };

    if (ehHost) {
        // Host transmite para todos os convidados
        conexoes.forEach(c => { if (c.open) c.send(pacote); });
    } else if (conexaoHost && conexaoHost.open) {
        // Cliente envia ao Host para ele retransmitir aos outros
        conexaoHost.send(pacote);
    }
}

// 6. HOST CLICA EM "INICIAR JOGO" (Bloqueia a sala e avisa todos)
function fecharEIniciarPartida(listaJogadores) {
    if (!ehHost) return;

    jogoIniciado = true; // 🔒 Bloqueia novas conexões a partir deste momento
    
    const pacoteInicio = {
        tipo: 'INICIAR_PARTIDA',
        jogadores: listaJogadores
    };

    conexoes.forEach(c => {
        if (c.open) c.send(pacoteInicio);
    });

    // Inicia na própria tela do Host
    if (typeof iniciarTabuleiroMultiplayer === 'function') {
        iniciarTabuleiroMultiplayer(listaJogadores);
    }
}

// Auxiliar visual para exibir/copiar o código da sala
function mostrarCodigoSala(codigo) {
    const elCodigo = document.getElementById('codigo-sala-exibicao');
    if (elCodigo) {
        elCodigo.innerText = codigo;
    } else {
        prompt("Copie o código abaixo e envie aos seus amigos (até 5 pessoas):", codigo);
    }
}

function atualizarListaLobby() {
    const totalConectados = conexoes.length + 1; // Convidados + Host
    console.log(`Lobby atualizado: ${totalConectados}/6 Jogadores na sala.`);
}
