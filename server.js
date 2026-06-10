const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Variáveis globais para armazenar o estado real capturado da mesa
let dadosMesa = {
    jogador_porcentagem: 50.0,
    banca_porcentagem: 50.0,
    resultado_rodada: "ESPERANDO",
    historico_resultados: []
};

// URL oficial com os tokens que você capturou no computador
const WS_URL = 'wss://sortenabet.evo-games.com/public/bacbo/player/game/SortenaBacBo0001/socket?messageFormat=json&tableConfig=txpifq7wh56aauyb&EVOSESSIONID=tyoiqhlyrafexvhjt2zmf7jeixazbdg280f33ded05335dab2b7db68115bc07d4a029dc6cf9f35f25&instance=0n8njj-tyoiqhlyrafexvhj-txpifq7wh56aauyb&client_version=6.20260610.73611.62580-5bb4093ee3-r2';

function conectarWebSocket() {
    console.log("🔌 Conectando ao canal WebSocket oficial do Bac Bo...");
    
    // Conecta disfarçado de navegador para a Evolution não bloquear
    const ws = new WebSocket(WS_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://betfusion.bet.br',
            'Host': 'sortenabet.evo-games.com'
        }
    });

    ws.on('open', () => {
        console.log("✅ Conexão WebSocket ESTABILIZADA e autorizada!");
    });

    ws.on('message', (data) => {
        try {
            const mensagem = JSON.parse(data.toString());
            
            // Filtra o evento bacbo.playerState que você encontrou no DevTools
            if (mensagem && mensagem.type === 'bacbo.playerState' && mensagem.value) {
                const estado = mensagem.value;
                
                // Mapeia o histórico recente de vitórias
                if (estado.history && Array.isArray(estado.history)) {
                    dadosMesa.historico_resultados = estado.history.map(item => item.result || item).slice(0, 100);
                }
                
                // Captura as estatísticas reais das porcentagens da mesa
                if (estado.statistics) {
                    dadosMesa.jogador_porcentagem = parseFloat(estado.statistics.player || estado.statistics.P || 50);
                    dadosMesa.banca_porcentagem = parseFloat(estado.statistics.banker || estado.statistics.B || 50);
                }
                
                // Atualiza o estado do andamento da rodada
                if (estado.roundState) {
                    dadosMesa.resultado_rodada = estado.roundState.toUpperCase();
                }
                
                console.log(`[DATA STREAM] Atualizado! J: ${dadosMesa.jogador_porcentagem}% | B: ${dadosMesa.banca_porcentagem}%`);
            }
        } catch (err) {
            // Ignora mensagens que não sejam do nosso interesse
        }
    });

    ws.on('close', () => {
        console.log("⚠️ Conexão do WebSocket caiu. Tentando reconectar em 5 segundos...");
        setTimeout(conectarWebSocket, 5000);
    });

    ws.on('error', (error) => {
        console.error("❌ Erro no WebSocket:", error.message);
    });
}

// Inicializa a escuta do WebSocket
conectarWebSocket();

// Rota para o seu Robô de Sinais consultar os dados
app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 API Monitor rodando na porta ${PORT}`);
});
