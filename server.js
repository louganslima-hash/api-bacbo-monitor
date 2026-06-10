const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const padroesDoLougans = [
    { historico: ['B', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO 2X1", sugerido: "BANCA" },
    { historico: ['P', 'P', 'B', 'B', 'P', 'P'], nomeSimulado: "PADRÃO 2X2", sugerido: "BANCA" },
    { historico: ['P', 'P', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO ESCADINHA", sugerido: "BANCA" },
    { historico: ['P', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO ESCADINHA INVERTIDO", sugerido: "JOGADOR" },
    { historico: ['P', 'B', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA (QUEBRA DO SURF)", sugerido: "BANCA" },
    { historico: ['P', 'B', 'P', 'P', 'P', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA 2", sugerido: "JOGADOR" },
    { historico: ['P', 'P', 'B', 'B', 'B', 'B'], nomeSimulado: "QUEBRA DA SEGUNDA LINHA APÓS O SURF", sugerido: "BANCA" }
];

let rodadaIdContador = 400000;
let padraoAtual = padroesDoLougans[0];

let dadosMesa = {
    id_rodada: "400000",
    gameId: "400000",
    jogador_porcentagem: 50.0,
    banca_porcentagem: 50.0,
    resultado_rodada: "ESPERANDO",
    historico_resultados: []
};

function iniciarNovaRodada() {
    rodadaIdContador++;
    padraoAtual = padroesDoLougans[Math.floor(Math.random() * padroesDoLougans.length)];
    
    dadosMesa.id_rodada = String(rodadaIdContador);
    dadosMesa.gameId = String(rodadaIdContador);
    dadosMesa.historico_resultados = padraoAtual.historico;
    
    // Deixa em ESPERANDO para o robô poder ler o padrão e disparar no grupo
    dadosMesa.resultado_rodada = "ESPERANDO";

    if (padraoAtual.sugerido === "JOGADOR") {
        dadosMesa.jogador_porcentagem = 56.0;
        dadosMesa.banca_porcentagem = 44.0;
    } else {
        dadosMesa.jogador_porcentagem = 44.0;
        dadosMesa.banca_porcentagem = 56.0;
    }

    console.log(`[🟢 NOVA RODADA] #${dadosMesa.id_rodada} - Analisando: ${padraoAtual.nomeSimulado}. Robô tem 15s para disparar...`);

    // Espera 15 segundos com a mesa aberta e depois injeta o resultado para dar o GREEN no grupo
    setTimeout(finalizarRodada, 15000);
}

function finalizarRodada() {
    dadosMesa.resultado_rodada = padraoAtual.sugerido;
    console.log(`[🔴 RODADA FINALIZADA] #${dadosMesa.id_rodada} - Resultado: ${dadosMesa.resultado_rodada} (Enviando Green/Red para o robô)`);
}

// Ciclo completo de 40 segundos por rodada
setInterval(iniciarNovaRodada, 40000);

app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 API Monitor Fluxo Perfeito rodando na porta ${PORT}`);
    iniciarNovaRodada();
});
