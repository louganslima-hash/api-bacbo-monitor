const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Histórico padrão de segurança para o robô nunca ficar vazio e nem bugar
let memoriaHistorico = ["BANCA", "JOGADOR", "BANCA", "JOGADOR", "BANCA", "JOGADOR", "BANCA", "JOGADOR", "BANCA", "JOGADOR"];

app.get('/api/monitor/status', async (req, res) => {
    try {
        const URL_BETFUSION = 'https://api.betfusion.com/v1/games/bacbo/live'; 
        const response = await axios.get(URL_BETFUSION, { timeout: 4000 });
        const dadosMesa = response.data;

        let resultadoAtual = dadosMesa.last_result || "ESPERANDO";
        
        // Padroniza o resultado para maiúsculo (evita problemas com 'banca' vs 'BANCA')
        if (typeof resultadoAtual === 'string') {
            resultadoAtual = resultadoAtual.toUpperCase();
        }

        // Alimenta a memória local se o resultado for válido
        if (resultadoAtual && resultadoAtual !== 'ESPERANDO') {
            if (memoriaHistorico[0] !== resultadoAtual) {
                memoriaHistorico.unshift(resultadoAtual);
                if (memoriaHistorico.length > 30) memoriaHistorico.pop();
            }
        }

        // Garante as porcentagens como números válidos
        const pctJ = dadosMesa.player_percentage ? parseFloat(dadosMesa.player_percentage) : 50.0;
        const pctB = dadosMesa.banker_percentage ? parseFloat(dadosMesa.banker_percentage) : 50.0;

        res.json({
            id_rodada: dadosMesa.game_id || dadosMesa.round_id || Date.now().toString().slice(-5),
            jogador_porcentagem: pctJ,
            banca_porcentagem: pctB,
            resultado_rodada: resultadoAtual,
            status_mesa: dadosMesa.status || "open",
            historico_resultados: memoriaHistorico
        });

    } catch (error) {
        console.log("⚠️ Erro ao buscar BetFusion, usando dados de segurança...");
        // Se a BetFusion falhar, responde estruturado para o robô não dar erro 502
        res.json({
            id_rodada: Date.now().toString().slice(-5),
            jogador_porcentagem: 50.0,
            banca_porcentagem: 50.0,
            resultado_rodada: "ESPERANDO",
            status_mesa: "open",
            historico_resultados: memoriaHistorico
        });
    }
});

app.get('/', (req, res) => {
    res.send('Monitor do Bac Bo VIP Blindado Ativo!');
});

app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});
