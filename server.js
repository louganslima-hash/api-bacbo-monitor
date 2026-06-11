const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Lista dos 7 padrões do Lougans configurados para alternar entre entradas na BANCA e JOGADOR
const padroesDoLougans = [
    // 1. PADRÃO 2X1: Formato 🔴 🔵 🔴 🔴 -> Entrada na Banca
    { historico: ['B', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO 2X1", sugerido: "BANCA" },
    
    // 2. PADRÃO 2X2 (Inversão) -> Entrada na Banca
    { historico: ['P', 'P', 'B', 'B', 'P', 'P'], nomeSimulado: "PADRÃO 2X2", sugerido: "BANCA" },
    
    // 3. PADRÃO ESCADINHA (3x2) -> Entrada na Banca
    { historico: ['P', 'P', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO ESCADINHA", sugerido: "BANCA" },
    
    // 4. PADRÃO ESCADINHA INVERTIDO (1x2x2) -> Entrada no Jogador
    { historico: ['P', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO ESCADINHA INVERTIDO", sugerido: "JOGADOR" },
    
    // 5. PADRÃO DE ALTERNÂNCIA (Quebra do Surf) -> Entrada na Banca
    { historico: ['P', 'B', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA (QUEBRA DO SURF)", sugerido: "BANCA" },
    
    // 6. PADRÃO DE ALTERNÂNCIA 2 -> Entrada no Jogador
    { historico: ['P', 'B', 'P', 'P', 'P', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA 2", sugerido: "JOGADOR" },
    
    // 7. QUEBRA DA SEGUNDA LINHA APÓS O SURF -> Entrada na Banca
    { historico: ['P', 'P', 'B', 'B', 'B', 'B'], nomeSimulado: "QUEBRA DA SEGUNDA LINHA APÓS O SURF", sugerido: "BANCA" }
];

let rodadaIdContador = 500000;
let padraoAtual = padroesDoLougans[0];

let dadosMesa = {
    id_rodada: "500000",
    gameId: "500000",
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
    dadosMesa.resultado_rodada = "ESPERANDO";

    // 🎲 GERA UMA DIFERENÇA DINÂMICA (Varia de 9% a 19%, mudando a cada sinal)
    // Sorteia um número quebrado entre 54.5 e 59.5
    const maiorPct = parseFloat((54.5 + Math.random() * 5).toFixed(1)); 
    const menorPct = parseFloat((100 - maiorPct - 3.5).toFixed(1)); // Desconta a margem de empate

    // Aplica as porcentagens baseadas no lado vencedor do padrão para validar o Green
    if (padraoAtual.sugerido === "JOGADOR") {
        dadosMesa.jogador_porcentagem = maiorPct;
        dadosMesa.banca_porcentagem = menorPct;
    } else {
        dadosMesa.jogador_porcentagem = menorPct;
        dadosMesa.banca_porcentagem = maiorPct;
    }

    console.log(`[🟢 NOVA RODADA] #${dadosMesa.id_rodada} - ${padraoAtual.nomeSimulado} | Sugerido: ${padraoAtual.sugerido} | Dif: ${(Math.abs(dadosMesa.jogador_porcentagem - dadosMesa.banca_porcentagem)).toFixed(1)}%`);

    // Mantém os 15 segundos para o robô ler e enviar no Telegram antes do resultado sair
    setTimeout(finalizarRodada, 15000);
}

function finalizarRodada() {
    dadosMesa.resultado_rodada = padraoAtual.sugerido;
    console.log(`[🔴 RODADA FINALIZADA] #${dadosMesa.id_rodada} - Resultado: ${dadosMesa.resultado_rodada}`);
}

// Rodadas dinâmicas a cada 40 segundos
setInterval(iniciarNovaRodada, 40000);

app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 Monitor Dinâmico (Cores e % Alternadas) rodando na porta ${PORT}`);
    iniciarNovaRodada();
});
