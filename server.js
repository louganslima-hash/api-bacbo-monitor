const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Essa rota entrega os dados exatos que o seu robô precisa
app.get('/api/monitor/status', async (req, res) => {
    try {
        // Link interno da BetFusion que puxa o Bac Bo VIP em tempo real
        const URL_BETFUSION = 'https://api.betfusion.com/v1/games/bacbo/live'; 
        
        const response = await axios.get(URL_BETFUSION, { timeout: 3000 });
        const dadosMesa = response.data;

        // Formato com porcentagens e o resultado impresso na mesa
        res.json({
            jogador_porcentagem: dadosMesa.player_percentage || "50.0",
            banca_porcentagem: dadosMesa.banker_percentage || "50.0",
            resultado_rodada: dadosMesa.last_result || "ESPERANDO", // 'JOGADOR', 'BANCA' ou 'EMPATE'
            status_mesa: dadosMesa.status || "open"
        });

    } catch (error) {
        // Dados de segurança caso a API de fora oscile
        res.json({
            jogador_porcentagem: "50.0",
            banca_porcentagem: "50.0",
            resultado_rodada: "ESPERANDO",
            status_mesa: "open"
        });
    }
});

app.get('/', (req, res) => {
    res.send('Monitor do Bac Bo VIP Ativo na Render!');
});

app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});
