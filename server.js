const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let dadosMesa = {
    jogador_porcentagem: 50.0,
    banca_porcentagem: 50.0,
    resultado_rodada: "WAITING",
    historico_resultados: []
};

// URL da API interna da Evolution que puxa o estado atualizado da mesa (pública)
const API_URL = 'https://sortenabet.evo-games.com/api/public/table/SortenaBacBo0001/cell-history';

async function atualizarDados() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://betfusion.bet.br',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.history) {
            const historico = response.data.history; // Array com os últimos resultados
            
            // Salva o histórico para o seu robô ler os padrões (ex: [ 'P', 'B', 'T', 'P' ])
            dadosMesa.historico_resultados = historico;

            // Calcula as porcentagens reais dos últimos jogos do histórico
            const total = historico.length;
            if (total > 0) {
                const jogadores = historico.filter(res => res === 'P' || res === 'PLAYER').length;
                const bancas = historico.filter(res => res === 'B' || res === 'BANKER').length;
                
                dadosMesa.jogador_porcentagem = Math.round((jogadores / total) * 100);
                dadosMesa.banca_porcentagem = Math.round((bancas / total) * 100);
            }
            
            console.log(`[🎯 DADOS REAIS] Monitor atualizado! J: ${dadosMesa.jogador_porcentagem}% | B: ${dadosMesa.banca_porcentagem}% | Total Rodadas: ${total}`);
        }
    } catch (error) {
        console.error("⚠️ Erro ao acessar API da Evolution:", error.message);
    }
}

// Atualiza a cada 3 segundos direto da fonte
setInterval(atualizarDados, 3000);

app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    atualizarDados();
});
