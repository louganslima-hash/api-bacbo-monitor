const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Memória local da API para segurar os últimos resultados caso a BetFusion não mande o array pronto
let memoriaHistorico = [];

app.get('/api/monitor/status', async (req, res) => {
    try {
        const URL_BETFUSION = 'https://api.betfusion.com/v1/games/bacbo/live'; 
        
        const response = await axios.get(URL_BETFUSION, { timeout: 3000 });
        const dadosMesa = response.data;

        const resultadoAtual = dadosMesa.last_result || "ESPERANDO";

        // Alimenta a lista interna de histórico se vier um resultado válido
        if (resultadoAtual && resultadoAtual !== 'ESPERANDO') {
            if (memoriaHistorico[0] !== resultadoAtual) {
                memoriaHistorico.unshift(resultadoAtual); // Adiciona no início da fila
                if (memoriaHistorico.length > 20) memoriaHistorico.pop(); // Mantém as últimas 20
            }
        }

        // Se a própria BetFusion já tiver um histórico, usamos o deles, senão usamos nossa memória
        const arrayResultados = dadosMesa.history || dadosMesa.recent_results || memoriaHistorico;

        res.json({
            id_rodada: dadosMesa.game_id || dadosMesa.round_id || Date.now().toString().slice(-5),
            jogador_porcentagem: dadosMesa.player_percentage || "50.0",
            banca_porcentagem: dadosMesa.banker_percentage || "50.0",
            resultado_rodada: resultadoAtual,
            status_mesa: dadosMesa.status || "open",
            historico_resultados: arrayResultados // 🚨 AGORA ENTREGA O HISTÓRICO QUE O ROBÔ EXIGE!
        });

    } catch (error) {
        res.json({
            id_rodada: "00000",
            jogador_porcentagem: "50.0",
            banca_porcentagem: "50.0",
            resultado_rodada: "ESPERANDO",
            status_mesa: "open",
            historico_resultados: memoriaHistorico.length > 0 ? memoriaHistorico : ["JOGADOR", "BANCA", "JOGADOR", "BANCA", "JOGADOR", "BANCA", "JOGADOR"]
        });
    }
});

app.get('/', (req, res) => {
    res.send('Monitor do Bac Bo VIP Ativo na Render!');
});

app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});
