// ================================================================
//  MENTORIA BANCÁRIA — script.js
//  Estrutura:
//    1. progressStorage   → única função a trocar quando tiver backend
//    2. progressManager   → lógica de progresso (não muda com o backend)
//    3. Player modal      → abre vídeo, rastreia tempo, atualiza progresso
//    4. UI dos módulos    → anel, barras, checks, lista de aulas
//    5. Mercado ao vivo   → crypto + câmbio
//    6. Utilitários       → nav, reveal, contadores
// ================================================================


// ================================================================
// 1. STORAGE — TROQUE APENAS ESTE BLOCO QUANDO TIVER BACKEND
// ================================================================
//
// Hoje: localStorage (funciona sem servidor)
// Quando monetizar: substitua as 3 funções abaixo por chamadas à sua API.
//
// Formato dos dados salvos por aula:
// {
//   watchedSeconds: number,   — quantos segundos o aluno assistiu
//   totalSeconds:   number,   — duração total do vídeo
//   completed:      boolean,  — marcada como concluída (>= 85%)
//   lastPosition:   number    — posição para retomar
// }
//
// Chave: "progresso_<moduloId>_<aulaIndex>"
// Ex:    "progresso_mod1_0"

const progressStorage = {

    // Lê progresso de uma aula
    get(moduloId, aulaIndex) {
        // ── BACKEND: substitua por → return await api.get(`/progresso/${moduloId}/${aulaIndex}`)
        try {
            const raw = localStorage.getItem(`progresso_${moduloId}_${aulaIndex}`);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    // Salva progresso de uma aula
    set(moduloId, aulaIndex, dados) {
        // ── BACKEND: substitua por → await api.post(`/progresso/${moduloId}/${aulaIndex}`, dados)
        try {
            localStorage.setItem(
                `progresso_${moduloId}_${aulaIndex}`,
                JSON.stringify(dados)
            );
        } catch {
            // localStorage cheio ou bloqueado — silencia
        }
    },

    // Lê todos os progressos de um módulo de uma vez
    getAll(moduloId, totalAulas) {
        // ── BACKEND: substitua por → return await api.get(`/progresso/${moduloId}`)
        const resultado = [];
        for (let i = 0; i < totalAulas; i++) {
            resultado.push(this.get(moduloId, i));
        }
        return resultado;
    }
};


// ================================================================
// 2. CATÁLOGO DE MÓDULOS E AULAS
// ================================================================
//
// type: 'youtube' → src é o ID do vídeo (ex: 'dQw4w9WgXcQ')
// type: 'mp4'     → src é URL direta do arquivo
//                   (Bunny.net, Pandavideo, S3, Cloudflare Stream, etc.)
//
// totalSeconds: duração real do vídeo em segundos
//   ex: 18 min = 1080s | 14 min = 840s | 22 min = 1320s

const MODULOS = {
    mod1: {
        titulo: 'Módulo 1 · Consórcio — Do Básico ao Fechamento',
        aulas: [
            {
                titulo: 'O que é consórcio e como ele realmente funciona',
                desc: 'Conceito, grupos, cartas de crédito e contemplação',
                duracao: '18 min',
                totalSeconds: 1080,
                type: 'youtube',
                src: 'hOyqqdyIrp0'          // ← ID do YouTube
            },
            {
                titulo: 'Perfil de cliente ideal para consórcio',
                desc: 'Como identificar quem tem maior propensão a comprar',
                duracao: '14 min',
                totalSeconds: 840,
                type: 'youtube',
                src: 'x6bHQj8fH_k'          // ← ID do YouTube
            },
            {
                titulo: 'A abordagem inicial — o que dizer nos primeiros 60 segundos',
                desc: 'Script adaptável para agência, telefone e WhatsApp',
                duracao: '22 min',
                totalSeconds: 1320,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            },
            {
                titulo: 'Comparando consórcio com financiamento',
                desc: 'Como posicionar sem depreciar o financiamento',
                duracao: '20 min',
                totalSeconds: 1200,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            },
            {
                titulo: 'Como estruturar uma proposta de consórcio',
                desc: 'Do levantamento de necessidade à simulação',
                duracao: '16 min',
                totalSeconds: 960,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            },
            {
                titulo: 'Estratégia de lance — o que poucos ensinam',
                desc: 'Como usar o lance para antecipar a contemplação',
                duracao: '19 min',
                totalSeconds: 1140,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            },
            {
                titulo: 'Fechamento: do interesse à assinatura',
                desc: 'Os últimos passos que convertem a conversa em venda',
                duracao: '24 min',
                totalSeconds: 1440,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            },
            {
                titulo: 'Pós-venda e indicações',
                desc: 'O ciclo que transforma uma venda em carteira',
                duracao: '17 min',
                totalSeconds: 1020,
                type: 'youtube',
                src: 'COLOQUE_O_ID_AQUI'
            }
        ]
    },
    mod2: { titulo: 'Módulo 2 · Crédito Pessoal e Consignado', aulas: [] },
    mod3: { titulo: 'Módulo 3 · Financiamento Imobiliário', aulas: [] },
    mod4: { titulo: 'Módulo 4 · Cartão de Crédito e Seguros', aulas: [] },
    mod5: { titulo: 'Módulo 5 · Gestão de Carteira e Fidelização', aulas: [] },
    mod6: { titulo: 'Módulo 6 · Planejamento de Metas e Rotina de Alta Performance', aulas: [] }
};


// ================================================================
// 3. PROGRESS MANAGER — lógica pura (não depende do storage)
// ================================================================

const progressManager = {

    // Retorna o progresso salvo de uma aula (ou defaults zerados)
    getAula(moduloId, aulaIndex) {
        return progressStorage.get(moduloId, aulaIndex) || {
            watchedSeconds: 0,
            totalSeconds: MODULOS[moduloId]?.aulas[aulaIndex]?.totalSeconds || 0,
            completed: false,
            lastPosition: 0
        };
    },

    // Atualiza progresso de uma aula com os dados vindos do vídeo
    updateAula(moduloId, aulaIndex, watchedSeconds, totalSeconds, currentPosition) {
        const aula = MODULOS[moduloId]?.aulas[aulaIndex];
        if (!aula) return;

        const total = totalSeconds || aula.totalSeconds || 1;
        const pct = watchedSeconds / total;
        const completed = pct >= 0.85; // considera concluída a partir de 85%

        const dados = {
            watchedSeconds: Math.floor(watchedSeconds),
            totalSeconds: Math.floor(total),
            completed,
            lastPosition: Math.floor(currentPosition)
        };

        progressStorage.set(moduloId, aulaIndex, dados);
        return dados;
    },

    // Calcula % de conclusão do módulo (0-100)
    getPctModulo(moduloId) {
        const modulo = MODULOS[moduloId];
        if (!modulo || !modulo.aulas.length) return 0;

        const total = modulo.aulas.length;
        const progressos = progressStorage.getAll(moduloId, total);
        const concluidas = progressos.filter(p => p && p.completed).length;
        return Math.round((concluidas / total) * 100);
    },

    // Conta aulas concluídas de um módulo
    getConcluidasModulo(moduloId) {
        const modulo = MODULOS[moduloId];
        if (!modulo || !modulo.aulas.length) return { concluidas: 0, total: 0 };

        const total = modulo.aulas.length;
        const progressos = progressStorage.getAll(moduloId, total);
        const concluidas = progressos.filter(p => p && p.completed).length;
        return { concluidas, total };
    }
};


// ================================================================
// 4. PLAYER MODAL
// ================================================================

let playerState = {
    moduloId: null,
    aulaIndex: 0,
    trackInterval: null,
    videoEl: null
};

// Abre o player na aula escolhida
function abrirPlayer(moduloId, aulaIndex) {
    const modulo = MODULOS[moduloId];
    if (!modulo || !modulo.aulas.length) return;

    playerState.moduloId = moduloId;
    playerState.aulaIndex = aulaIndex;

    renderizarPlayer();
    document.getElementById('playerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fecha o player e para o tracking
function fecharPlayer() {
    pararTracking();
    document.getElementById('playerOverlay').classList.remove('active');
    document.getElementById('playerVideoContainer').innerHTML = '';
    document.body.style.overflow = '';
    atualizarUIModulo(playerState.moduloId);
}

// Navega entre aulas sem fechar o modal
function navegarAula(dir) {
    const modulo = MODULOS[playerState.moduloId];
    const proximo = playerState.aulaIndex + dir;
    if (proximo < 0 || proximo >= modulo.aulas.length) return;
    pararTracking();
    playerState.aulaIndex = proximo;
    renderizarPlayer();
}

// Renderiza o conteúdo atual no modal
function renderizarPlayer() {
    const { moduloId, aulaIndex } = playerState;
    const modulo = MODULOS[moduloId];
    const aula = modulo.aulas[aulaIndex];
    const total = modulo.aulas.length;
    const prog = progressManager.getAula(moduloId, aulaIndex);

    // Cabeçalho
    document.getElementById('playerBreadcrumb').textContent = modulo.titulo;
    document.getElementById('playerTitulo').textContent = aula.titulo;
    document.getElementById('playerProgresso').textContent =
        `Aula ${aulaIndex + 1} de ${total}`;

    // Botões de navegação
    const btnAnt = document.getElementById('playerBtnAnterior');
    const btnProx = document.getElementById('playerBtnProxima');
    btnAnt.disabled = aulaIndex === 0;
    btnAnt.style.opacity = aulaIndex === 0 ? '0.35' : '1';
    btnProx.textContent = aulaIndex === total - 1 ? '✓ Concluir módulo' : 'Próxima →';

    // Vídeo
    const vc = document.getElementById('playerVideoContainer');
    playerState.videoEl = null;

    if (aula.type === 'youtube') {
        // YouTube: tracking via ping periódico (não acessa currentTime)
        vc.innerHTML = `<iframe
            id="playerIframe"
            src="https://www.youtube.com/embed/${aula.src}?autoplay=1&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            style="position:absolute;inset:0;width:100%;height:100%;border:none">
        </iframe>`;
        iniciarTrackingYoutube(moduloId, aulaIndex, aula.totalSeconds);

    } else if (aula.type === 'mp4') {
        // MP4: tracking preciso via events do <video>
        const startAt = prog.lastPosition || 0;
        vc.innerHTML = `<video
            id="playerVideo"
            controls
            autoplay
            style="position:absolute;inset:0;width:100%;height:100%;background:#000;outline:none">
            <source src="${aula.src}" type="video/mp4">
        </video>`;

        const video = document.getElementById('playerVideo');
        playerState.videoEl = video;

        // Retoma de onde parou
        video.addEventListener('loadedmetadata', () => {
            if (startAt > 10) video.currentTime = startAt;
        });

        iniciarTrackingMP4(video, moduloId, aulaIndex);
    }
}

// Tracking para vídeos MP4 (preciso)
function iniciarTrackingMP4(video, moduloId, aulaIndex) {
    pararTracking();

    let maxWatched = progressManager.getAula(moduloId, aulaIndex).watchedSeconds;

    playerState.trackInterval = setInterval(() => {
        if (!video || video.paused || video.ended) return;

        const current = video.currentTime;
        const total = video.duration || MODULOS[moduloId].aulas[aulaIndex].totalSeconds;

        // Acumula apenas progresso para frente (evita contar rewind)
        if (current > maxWatched) maxWatched = current;

        const dados = progressManager.updateAula(moduloId, aulaIndex, maxWatched, total, current);
        if (dados) atualizarBarraAula(moduloId, aulaIndex, dados);

    }, 5000); // salva a cada 5 segundos

    // Marca como concluída ao terminar
    video.addEventListener('ended', () => {
        const total = video.duration || MODULOS[moduloId].aulas[aulaIndex].totalSeconds;
        const dados = progressManager.updateAula(moduloId, aulaIndex, total, total, total);
        if (dados) atualizarBarraAula(moduloId, aulaIndex, dados);
        atualizarUIModulo(moduloId);
    });
}

// Tracking para YouTube (estimado — conta tempo com modal aberto)
function iniciarTrackingYoutube(moduloId, aulaIndex, totalSeconds) {
    pararTracking();

    const prog = progressManager.getAula(moduloId, aulaIndex);
    let watchedSeconds = prog.watchedSeconds || 0;
    const total = totalSeconds || 1;

    playerState.trackInterval = setInterval(() => {
        watchedSeconds = Math.min(watchedSeconds + 5, total);
        const dados = progressManager.updateAula(
            moduloId, aulaIndex, watchedSeconds, total, watchedSeconds
        );
        if (dados) {
            atualizarBarraAula(moduloId, aulaIndex, dados);
            if (dados.completed) atualizarUIModulo(moduloId);
        }
    }, 5000);
}

// Para o interval de tracking
function pararTracking() {
    if (playerState.trackInterval) {
        clearInterval(playerState.trackInterval);
        playerState.trackInterval = null;
    }
}

// Cria e injeta o HTML do modal no body
function criarModalPlayer() {
    const modal = document.createElement('div');
    modal.id = 'playerOverlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'playerTitulo');
    modal.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'background:rgba(10,10,20,0.92)',
        'align-items:center',
        'justify-content:center',
        'padding:16px'
    ].join(';');

    modal.innerHTML = `
        <div style="
            width:100%;max-width:920px;
            background:#1A1A2E;
            border-radius:10px;overflow:hidden;
            border:1px solid rgba(201,168,76,0.35);
            display:flex;flex-direction:column;
            max-height:calc(100vh - 32px);
        ">
            <div style="
                display:flex;align-items:center;gap:12px;
                padding:12px 16px;
                background:#24244A;
                border-bottom:1px solid rgba(201,168,76,0.2);
                flex-shrink:0;
            ">
                <div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">
                    <span id="playerBreadcrumb" style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#C9A84C;"></span>
                    <span id="playerTitulo" style="font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span>
                </div>
                <button onclick="fecharPlayer()" aria-label="Fechar player" style="
                    width:32px;height:32px;border-radius:50%;
                    background:rgba(255,255,255,0.08);border:none;
                    cursor:pointer;color:rgba(255,255,255,0.65);
                    display:flex;align-items:center;justify-content:center;
                    font-size:18px;flex-shrink:0;
                ">✕</button>
            </div>

            <div id="playerVideoContainer" style="
                position:relative;width:100%;
                aspect-ratio:16/9;background:#000;flex-shrink:0;
            "></div>

            <div style="
                padding:10px 16px;
                display:flex;align-items:center;justify-content:space-between;
                background:#24244A;
                border-top:1px solid rgba(201,168,76,0.12);
                gap:12px;flex-wrap:wrap;flex-shrink:0;
            ">
                <div style="display:flex;gap:8px;">
                    <button id="playerBtnAnterior" onclick="navegarAula(-1)" style="
                        padding:6px 16px;font-size:12px;font-weight:500;
                        border-radius:4px;cursor:pointer;
                        border:1px solid rgba(201,168,76,0.45);
                        background:transparent;color:#C9A84C;
                        letter-spacing:0.05em;text-transform:uppercase;
                    ">← Anterior</button>
                    <button id="playerBtnProxima" onclick="navegarAula(1)" style="
                        padding:6px 16px;font-size:12px;font-weight:500;
                        border-radius:4px;cursor:pointer;
                        border:1px solid #C9A84C;
                        background:#C9A84C;color:#fff;
                        letter-spacing:0.05em;text-transform:uppercase;
                    ">Próxima →</button>
                </div>
                <span id="playerProgresso" style="font-size:11px;color:rgba(255,255,255,0.35);"></span>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Mostra/esconde via classe .active
    new MutationObserver(() => {
        modal.style.display = modal.classList.contains('active') ? 'flex' : 'none';
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });

    // Fecha ao clicar no fundo
    modal.addEventListener('click', e => { if (e.target === modal) fecharPlayer(); });
}

// Atalhos de teclado
document.addEventListener('keydown', e => {
    const overlay = document.getElementById('playerOverlay');
    if (!overlay?.classList.contains('active')) return;
    if (e.key === 'Escape') fecharPlayer();
    if (e.key === 'ArrowRight') navegarAula(1);
    if (e.key === 'ArrowLeft') navegarAula(-1);
});


// ================================================================
// 5. UI DOS MÓDULOS — anel de progresso, barras, checks, lista
// ================================================================

// Formata segundos para "mm:ss"
function formatarTempo(segundos) {
    const s = Math.max(0, Math.floor(segundos));
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
}

// Injeta a lista de aulas clicáveis dentro de um container
function injetarListaAulas(moduloId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const modulo = MODULOS[moduloId];
    if (!modulo) return;

    container.innerHTML = modulo.aulas.map((aula, i) => {
        const prog = progressManager.getAula(moduloId, i);
        const pct = prog.totalSeconds > 0
            ? Math.min(100, Math.round((prog.watchedSeconds / prog.totalSeconds) * 100))
            : 0;
        const concluida = prog.completed;

        return `
        <div class="lesson"
             onclick="abrirPlayer('${moduloId}', ${i})"
             role="button" tabindex="0"
             aria-label="Assistir: ${aula.titulo}"
             id="aula-${moduloId}-${i}"
             style="cursor:pointer;">

            <div class="lesson-icon" style="position:relative;cursor:pointer;">
                ${concluida
                ? `<span style="color:#4caf50;font-size:1rem;">✓</span>`
                : `▶`
            }
            </div>

            <div class="lesson-text">
                <div class="lesson-title">${aula.titulo}</div>
                <div class="lesson-desc" id="desc-${moduloId}-${i}">
                    ${pct > 0
                ? `<span style="color:#C9A84C;">${formatarTempo(prog.watchedSeconds)}</span>
                           <span style="color:#aaa;"> de ${aula.duracao} assistidos</span>`
                : aula.desc
            }
                </div>
                <div style="
                    margin-top:5px;
                    height:3px;border-radius:2px;
                    background:rgba(201,168,76,0.15);
                    overflow:hidden;
                " id="barra-wrap-${moduloId}-${i}">
                    <div id="barra-${moduloId}-${i}" style="
                        height:100%;
                        width:${pct}%;
                        background:${concluida ? '#4caf50' : '#C9A84C'};
                        border-radius:2px;
                        transition:width 0.4s ease;
                    "></div>
                </div>
            </div>

            <span class="lesson-duration">${aula.duracao}</span>
        </div>`;
    }).join('');

    // Suporte a teclado
    container.querySelectorAll('.lesson').forEach((el, i) => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrirPlayer(moduloId, i);
            }
        });
    });
}

// Atualiza barra + descrição de uma aula específica (chamado pelo tracking)
function atualizarBarraAula(moduloId, aulaIndex, dados) {
    const barra = document.getElementById(`barra-${moduloId}-${aulaIndex}`);
    const desc = document.getElementById(`desc-${moduloId}-${aulaIndex}`);
    const icon = document.querySelector(`#aula-${moduloId}-${aulaIndex} .lesson-icon`);
    if (!barra || !desc) return;

    const pct = dados.totalSeconds > 0
        ? Math.min(100, Math.round((dados.watchedSeconds / dados.totalSeconds) * 100))
        : 0;

    barra.style.width = pct + '%';
    barra.style.background = dados.completed ? '#4caf50' : '#C9A84C';

    const aula = MODULOS[moduloId]?.aulas[aulaIndex];
    if (pct > 0 && aula) {
        desc.innerHTML = `
            <span style="color:#C9A84C;">${formatarTempo(dados.watchedSeconds)}</span>
            <span style="color:#aaa;"> de ${aula.duracao} assistidos</span>`;
    }

    if (icon && dados.completed) {
        icon.innerHTML = `<span style="color:#4caf50;font-size:1rem;">✓</span>`;
    }
}

// Atualiza o anel de progresso do módulo e a lista completa de aulas
function atualizarUIModulo(moduloId) {
    if (!moduloId) return;
    const pct = progressManager.getPctModulo(moduloId);
    const { concluidas, total } = progressManager.getConcluidasModulo(moduloId);

    // Anel SVG
    atualizarAnelProgresso(moduloId, pct, concluidas, total);

    // Rebaixa todos os itens da lista (atualiza barras e checks)
    const modulo = MODULOS[moduloId];
    if (!modulo) return;
    modulo.aulas.forEach((_, i) => {
        const dados = progressManager.getAula(moduloId, i);
        atualizarBarraAula(moduloId, i, dados);
    });
}

// Cria ou atualiza o anel SVG de progresso no topo do módulo
function atualizarAnelProgresso(moduloId, pct, concluidas, total) {
    const containerId = `anel-${moduloId}`;
    let container = document.getElementById(containerId);
    if (!container) return;

    const r = 22;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const cor = pct === 100 ? '#4caf50' : '#C9A84C';

    container.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 60 60" style="flex-shrink:0;">
            <circle cx="30" cy="30" r="${r}"
                fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="3"/>
            <circle cx="30" cy="30" r="${r}"
                fill="none" stroke="${cor}" stroke-width="3"
                stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
                stroke-dashoffset="${(circ / 4).toFixed(1)}"
                stroke-linecap="round"
                style="transition:stroke-dasharray 0.6s ease;"/>
            <text x="30" y="27" text-anchor="middle"
                font-family="Playfair Display, serif"
                font-size="11" font-weight="700"
                fill="${cor}">${pct}%</text>
            <text x="30" y="38" text-anchor="middle"
                font-family="Inter, sans-serif"
                font-size="7.5" fill="#6B6B6B">${concluidas}/${total}</text>
        </svg>`;
}

// Injeta o container do anel dentro do module-meta de um módulo
function injetarAnelProgresso(moduloId) {
    const meta = document.querySelector(`#${moduloId} .module-meta`);
    if (!meta) return;

    const anel = document.createElement('div');
    anel.id = `anel-${moduloId}`;
    anel.style.cssText = 'display:flex;align-items:center;margin-left:8px;';
    meta.appendChild(anel);

    const pct = progressManager.getPctModulo(moduloId);
    const { concluidas, total } = progressManager.getConcluidasModulo(moduloId);
    atualizarAnelProgresso(moduloId, pct, concluidas, total);
}


// ================================================================
// 6. VÍDEOS DEMO (seção de aulas demonstrativas)
// ================================================================

const videoIds = { 1: 'hOyqqdyIrp0', 2: 'x6bHQj8fH_k' };

function loadVideo(n) {
    const el = document.getElementById('video' + n);
    if (!el) return;
    el.style.background = '#000';
    el.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${videoIds[n]}?autoplay=1&rel=0"
        allow="autoplay; encrypted-media"
        allowfullscreen
        style="position:absolute;inset:0;width:100%;height:100%;border:none">
    </iframe>`;
}


// ================================================================
// 7. MERCADO AO VIVO
// ================================================================

async function fetchMarket() {
    const el = document.getElementById('marketItems');
    if (!el) return;

    try {
        const [cryptoRes, fxRes] = await Promise.allSettled([
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true'),
            fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL')
        ]);

        const items = [];

        if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
            const crypto = await cryptoRes.value.json();
            const fmt = n => n >= 1000
                ? 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                : 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            items.push({ icon: '₿', name: 'Bitcoin', label: 'BTC', price: fmt(crypto.bitcoin.brl), change: crypto.bitcoin.brl_24h_change });
            items.push({ icon: '⟠', name: 'Ethereum', label: 'ETH', price: fmt(crypto.ethereum.brl), change: crypto.ethereum.brl_24h_change });
            items.push({ icon: '◎', name: 'Solana', label: 'SOL', price: fmt(crypto.solana.brl), change: crypto.solana.brl_24h_change });
        }

        if (fxRes.status === 'fulfilled' && fxRes.value.ok) {
            const fx = await fxRes.value.json();
            const fmtFx = n => 'R$ ' + parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            items.push({ icon: '🇺🇸', name: 'Dólar', label: 'USD/BRL', price: fmtFx(fx.USDBRL.bid), change: parseFloat(fx.USDBRL.pctChange) });
            items.push({ icon: '🇪🇺', name: 'Euro', label: 'EUR/BRL', price: fmtFx(fx.EURBRL.bid), change: parseFloat(fx.EURBRL.pctChange) });
        }

        items.push({ icon: '🏦', name: 'CDI', label: 'Taxa anual', price: '13,65% a.a.', change: null });
        items.push({ icon: '📊', name: 'IPCA', label: '12 meses', price: '4,83%', change: null });

        if (!items.length) {
            el.innerHTML = '<div class="market-loading">Dados indisponíveis</div>';
            return;
        }

        el.innerHTML = items.map(item => {
            const cls = item.change == null ? 'neu' : item.change >= 0 ? 'up' : 'down';
            const txt = item.change == null ? '—' : (item.change >= 0 ? '▲ ' : '▼ ') + Math.abs(item.change).toFixed(2) + '%';
            return `
                <div class="market-item">
                    <div class="market-item-left">
                        <div class="market-icon">${item.icon}</div>
                        <div>
                            <div class="market-name">${item.name}</div>
                            <div class="market-label">${item.label}</div>
                        </div>
                    </div>
                    <div class="market-right">
                        <div class="market-price">${item.price}</div>
                        <div class="market-change ${cls}">${txt}</div>
                    </div>
                </div>`;
        }).join('');

        setTimeout(() => {
            document.querySelectorAll('.market-item').forEach(item => {
                item.classList.add('updated');
                setTimeout(() => item.classList.remove('updated'), 700);
            });
        }, 50);

    } catch {
        el.innerHTML = '<div class="market-loading">Erro ao carregar dados</div>';
    }
}

fetchMarket();
setInterval(fetchMarket, 60000);


// ================================================================
// 8. UTILITÁRIOS — nav, reveal, contadores
// ================================================================

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

function toggleModule(id) {
    const body = document.getElementById(id + '-body');
    if (!body) return;
    body.classList.toggle('collapsed');
}

const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (nav) nav.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.08)'
        : 'none';
});

const reveals = document.querySelectorAll('.reveal');
function revealOnScroll() {
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            el.classList.add('show');
        } else {
            el.classList.remove('show');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

function animateCounters() {
    document.querySelectorAll('.hero-stat-num').forEach(counter => {
        const target = Number(counter.dataset.target);
        const suffix = counter.dataset.suffix || '';
        let current = 0;
        const inc = target / 80;
        const update = () => {
            current += inc;
            if (current >= target) {
                counter.textContent = target + suffix;
            } else {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(update);
            }
        };
        update();
    });
}
window.addEventListener('load', animateCounters);


// ================================================================
// 9. INICIALIZAÇÃO
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Abre módulo 1 por padrão
    const body1 = document.getElementById('mod1-body');
    if (body1) body1.classList.remove('collapsed');

    // Cria o modal do player
    criarModalPlayer();

    // Módulo 1: anel de progresso + lista de aulas clicáveis
    injetarAnelProgresso('mod1');
    injetarListaAulas('mod1', 'lista-mod1');

    // Quando desbloquear outros módulos, adicione:
    // injetarAnelProgresso('mod2');
    // injetarListaAulas('mod2', 'lista-mod2');
});