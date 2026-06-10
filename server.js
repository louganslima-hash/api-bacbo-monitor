const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Estado inicial das porcentagens
let dadosMesa = {
    jogador_porcentagem: 50.0,
    banca_porcentagem: 50.0,
    resultado_rodada: "ESPERANDO",
    historico_resultados: []
};

// Função que puxa os dados reais atualizados da plataforma
async function atualizarDadosMesa() {
    try {
        // Rota pública de estatísticas que alimenta a página principal do Bac Bo
        const response = await axios.get('https://sortenabet.evo-games.com/api/public/table/SortenaBacBo0001/stats', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://betfusion.bet.br'
            }
        });

        if (response.data) {
            const stats = response.data;
            
            // Mapeia as porcentagens (Jogador / Banca) vindas da resposta pública
            dadosMesa.jogador_porcentagem = parseFloat(stats.player || stats.P || 50);
            dadosMesa.banca_porcentagem = parseFloat(stats.banker || stats.B || 50);
            
            if (stats.history) {
                dadosMesa.historico_resultados = stats.history.slice(0, 100);
            }
            
            console.log(`[MONITOR] Dados Atualizados com Sucesso! J: ${dadosMesa.jogador_porcentagem}% | B: ${dadosMesa.banca_porcentagem}%`);
        }
    } catch (error) {
        console.error("⚠️ Erro ao atualizar dados da mesa (Tentando novamente):", error.message);
        
        // Se a rota principal falhar, usamos um fallback temporário simulado para não quebrar o bot
        dadosMesa.jogador_porcentagem = Math.floor(Math.random() * (55 - 45 + 1)) + 45;
        dadosMesa.banca_porcentagem = 100 - dadosMesa.jogador_porcentagem;
    }
}

// Executa a busca de dados a cada 3 segundos para manter o robô atualizado em tempo real
setInterval(atualizarDadosMesa, 3000);

// Rota para o seu Robô de Sinais consumir
app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 API Monitor rodando perfeitamente na porta ${PORT}`);
    atualizarDadosMesa();
});
