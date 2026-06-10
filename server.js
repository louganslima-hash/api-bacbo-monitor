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

// URL inicial obtida do seu painel do desenvolvedor (Evolution Gaming)
const WS_URL = 'wss://sortenabet.evo-games.com/public/bacbo/player/game/SortenaBacBo0001/socket?messageFormat=json&tableConfig=txpifq7wh56aauyb&EVOSESSIONID=tyoiqhlyrafexvhjt2zmf7jeixazbdg280f33ded05335dab2b7db68115bc07d4a029dc6cf9f35f25&instance=0n8njj-tyoiqhlyrafexvhj-txpifq7wh56aauyb&client_version=6.20260610.73611.62580-5bb4093ee3-r2';

function conectarWebSocket() {
    console.log("🔌 Conectando ao canal WebSocket oficial do Bac Bo...");
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log("✅ Conexão WebSocket estabelecida com sucesso!");
    });

    ws.on('message', (data) => {
        try {
            const mensagem = JSON.parse(data.toString());
            
            // Procura pelo evento exato que você descobriu no print: bacbo.playerState
            if (mensagem && mensagem.type === 'bacbo.playerState' && mensagem.value) {
                const estado = mensagem.value;
                
                // Captura o histórico recente de resultados (as últimas pedras/rodadas)
                if (estado.history && Array.isArray(estado.history)) {
                    dadosMesa.historico_resultados = estado.history.map(item => item.result || item).slice(0, 100);
                }
                
                // Captura as estatísticas de porcentagem se estiverem presentes no objeto
                if (estado.statistics) {
                    dadosMesa.jogador_porcentagem = parseFloat(estado.statistics.player || estado.statistics.P || 50);
                    dadosMesa.banca_porcentagem = parseFloat(estado.statistics.banker || estado.statistics.B || 50);
                }
                
                // Atualiza o status da rodada atual
                if (estado.roundState) {
                    dadosMesa.resultado_rodada = estado.roundState.toUpperCase(); // ex: "PLAYING", "WAITING", "COMPLETED"
                }
                
                console.log(`[DATA STREAM] Atualizado! J: ${dadosMesa.jogador_porcentagem}% | B: ${dadosMesa.banca_porcentagem}% | Histórico: ${dadosMesa.historico_resultados.length} itens`);
            }
        } catch (err) {
            // Ignora mensagens que não sejam JSON ou que não tenham relevância
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

// Inicia a escuta contínua do WebSocket assim que a API liga
conectarWebSocket();

// Rota padrão que o seu Robô de Sinais (index.js da outra Render) consome a cada segundo
app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 API Monitor rodando na porta ${PORT}`);
});
