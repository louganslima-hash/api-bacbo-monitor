const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Lista oficial dos 7 padrões do Lougans estruturados para a leitura do robô (o índice [0] é a pedra mais recente)
const padroesDoLougans = [
    // 1. PADRÃO 2X1: Formato 🔴 🔵 🔴 🔴
    { historico: ['B', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO 2X1" },
    
    // 2. PADRÃO 2X2 (Inversão)
    { historico: ['P', 'P', 'B', 'B', 'P', 'P'], nomeSimulado: "PADRÃO 2X2" },
    
    // 3. PADRÃO ESCADINHA (3x2)
    { historico: ['P', 'P', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO ESCADINHA" },
    
    // 4. PADRÃO ESCADINHA INVERTIDO (1x2x2)
    { historico: ['P', 'P', 'B', 'B', 'P', 'B'], nomeSimulado: "PADRÃO ESCADINHA INVERTIDO" },
    
    // 5. PADRÃO DE ALTERNÂNCIA (Quebra do Surf)
    { historico: ['P', 'B', 'B', 'B', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA (QUEBRA DO SURF)" },
    
    // 6. PADRÃO DE ALTERNÂNCIA 2
    { historico: ['P', 'B', 'P', 'P', 'P', 'B', 'P'], nomeSimulado: "PADRÃO DE ALTERNÂNCIA 2" },
    
    // 7. QUEBRA DA SEGUNDA LINHA APÓS O SURF
    { historico: ['P', 'P', 'B', 'B', 'B', 'B'], nomeSimulado: "QUEBRA DA SEGUNDA LINHA APÓS O SURF" }
];

let rodadaIdContador = 300000;

let dadosMesa = {
    id_rodada: "300000",
    gameId: "300000",
    jogador_porcentagem: 55.0,
    banca_porcentagem: 45.0,
    resultado_rodada: "JOGADOR",
    historico_resultados: []
};

function simularMesaReal() {
    rodadaIdContador++;
    
    // Atualiza os IDs para o robô identificar que é uma nova rodada
    dadosMesa.id_rodada = String(rodadaIdContador);
    dadosMesa.gameId = String(rodadaIdContador);

    // Sorteia um dos seus 7 padrões de forma aleatória
    const padraoEscolhido = padroesDoLougans[Math.floor(Math.random() * padroesDoLougans.length)];
    dadosMesa.historico_resultados = padraoEscolhido.historico;

    // Define a direção real baseado na última pedra [0] para bater o GREEN no robô de sinais
    const ultimaPedra = padraoEscolhido.historico[0];
    if (ultimaPedra === 'P') {
        dadosMesa.resultado_rodada = "JOGADOR";
        // Define diferença exata de 12% (Passa na sua trava que aceita de 8.0 a 22.0)
        dadosMesa.jogador_porcentagem = 56.0;
        dadosMesa.banca_porcentagem = 44.0;
    } else {
        dadosMesa.resultado_rodada = "BANCA";
        dadosMesa.jogador_porcentagem = 44.0;
        dadosMesa.banca_porcentagem = 56.0;
    }

    console.log(`[🎲 MONITOR] Rodada #${dadosMesa.id_rodada} | Injetado: ${padraoEscolhido.nomeSimulado} | Próximo Resultado: ${dadosMesa.resultado_rodada}`);
}

// Altera e envia um padrão novo a cada 10 segundos
setInterval(simularMesaReal, 10000);

app.get('/api/monitor/status', (req, res) => {
    res.json(dadosMesa);
});

app.listen(PORT, () => {
    console.log(`🚀 API Monitor atualizada com os 7 Padrões rodando na porta ${PORT}`);
    simularMesaReal();
});
