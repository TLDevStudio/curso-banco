// ================================================================
//  ÁREA DE MEMBROS — script.js
//  Backend: MongoDB + Render (curso-banco-api.onrender.com)
// ================================================================


// ── Auth ─────────────────────────────────────────────────────────
// Redireciona se não estiver logado
if (!api.estaLogado()) {
    window.location.href = '../pages/login.html';
}

// Nome do aluno vem do localStorage (salvo pelo api.js no login)
const nomeEl = document.getElementById('nomeAluno');
if (nomeEl) nomeEl.textContent = localStorage.getItem('nome') || 'Aluno';

function fazerLogout() {
    api.logout(); // já redireciona para login
}


// ================================================================
// STORAGE DE PROGRESSO — chamadas reais ao backend
// ================================================================
//
// Rotas esperadas no seu Express/Render:
//
//   GET  /api/progresso/:moduloId/:aulaIndex
//        → { watchedSeconds, totalSeconds, completed, lastPosition }
//           ou 404 se ainda não existir
//
//   POST /api/progresso/:moduloId/:aulaIndex
//        body: { watchedSeconds, totalSeconds, completed, lastPosition }
//        → { ok: true }
//
//   GET  /api/progresso/:moduloId
//        → [ { aulaIndex, watchedSeconds, totalSeconds, completed, lastPosition }, ... ]
//
// Todas as rotas exigem Authorization: Bearer <token>


const progressStorage = {

    _headers() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api.getToken()}`
        };
    },

    // Lê progresso de uma aula
    async get(moduloId, aulaIndex) {
        try {
            const res = await fetch(`${API_URL}/api/progresso/${moduloId}/${aulaIndex}`, {
                headers: this._headers()
            });
            if (res.status === 404) return null;
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },

    // Salva progresso de uma aula
    async set(moduloId, aulaIndex, dados) {
        try {
            await fetch(`${API_URL}/api/progresso/${moduloId}/${aulaIndex}`, {
                method: 'POST',
                headers: this._headers(),
                body: JSON.stringify(dados)
            });
        } catch {
            // falha silenciosa — o aluno continua assistindo normalmente
        }
    },

    // Lê todos os progressos de um módulo de uma vez
    async getAll(moduloId, totalAulas) {
        try {
            const res = await fetch(`${API_URL}/api/progresso/${moduloId}`, {
                headers: this._headers()
            });
            if (!res.ok) return Array(totalAulas).fill(null);
            const lista = await res.json(); // array com os registros existentes
            // normaliza para array indexado por aulaIndex
            const resultado = Array(totalAulas).fill(null);
            for (const item of lista) {
                if (item.aulaIndex >= 0 && item.aulaIndex < totalAulas) {
                    resultado[item.aulaIndex] = item;
                }
            }
            return resultado;
        } catch {
            return Array(totalAulas).fill(null);
        }
    }
};


// ================================================================
// CATÁLOGO DE MÓDULOS E AULAS
// Troque os src pelos IDs reais do YouTube ou URLs de vídeo MP4.
// ================================================================
const MODULOS = {
    mod1: {
        titulo: 'Módulo 1 · Consórcio — Do Básico ao Fechamento',
        aulas: [
            { titulo: 'O que é consórcio e como ele realmente funciona', desc: 'Conceito, grupos, cartas de crédito e contemplação', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'hOyqqdyIrp0' },
            { titulo: 'Perfil de cliente ideal para consórcio', desc: 'Como identificar quem tem maior propensão a comprar', duracao: '14 min', totalSeconds: 840, type: 'youtube', src: 'x6bHQj8fH_k' },
            { titulo: 'A abordagem inicial — o que dizer nos primeiros 60s', desc: 'Script adaptável para agência, telefone e WhatsApp', duracao: '22 min', totalSeconds: 1320, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Comparando consórcio com financiamento', desc: 'Como posicionar sem depreciar o financiamento', duracao: '20 min', totalSeconds: 1200, type: 'youtube', src: 'dQw4w9WgXcQ' },
            { titulo: 'Como estruturar uma proposta de consórcio', desc: 'Do levantamento de necessidade à simulação', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'dQw4w9WgXcQ' },
            { titulo: 'Estratégia de lance — o que poucos ensinam', desc: 'Como usar o lance para antecipar a contemplação', duracao: '19 min', totalSeconds: 1140, type: 'youtube', src: 'dQw4w9WgXcQ' },
            { titulo: 'Fechamento: do interesse à assinatura', desc: 'Os últimos passos que convertem a conversa em venda', duracao: '24 min', totalSeconds: 1440, type: 'youtube', src: 'dQw4w9WgXcQ' },
            { titulo: 'Pós-venda e indicações', desc: 'O ciclo que transforma uma venda em carteira', duracao: '17 min', totalSeconds: 1020, type: 'youtube', src: 'dQw4w9WgXcQ' }
        ]
    },
    mod2: {
        titulo: 'Módulo 2 · Crédito Pessoal e Consignado',
        aulas: [
            { titulo: 'Crédito pessoal vs consignado — quando indicar cada um', desc: 'Perfil de cliente e produto certo na hora certa', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Como fazer o diagnóstico financeiro do cliente', desc: 'Perguntas que revelam a real necessidade de crédito', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Simulação que convence: apresentando parcelas e CET', desc: 'Como mostrar custo total sem assustar o cliente', duracao: '20 min', totalSeconds: 1200, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Objeções de crédito e como contorná-las', desc: 'Respostas para "tá caro", "vou pensar" e "não preciso"', duracao: '22 min', totalSeconds: 1320, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Refinanciamento e portabilidade como alavanca de venda', desc: 'Como usar a portabilidade para trazer clientes de outros bancos', duracao: '14 min', totalSeconds: 840, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Fechamento e documentação de crédito', desc: 'Do aceite à formalização sem perder o cliente no caminho', duracao: '20 min', totalSeconds: 1200, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' }
        ]
    },
    mod3: {
        titulo: 'Módulo 3 · Financiamento Imobiliário',
        aulas: [
            { titulo: 'Como funciona o financiamento imobiliário no banco', desc: 'SAC, Price, FGTS, subsídio — tudo que você precisa saber', duracao: '24 min', totalSeconds: 1440, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Qualificando o cliente imobiliário', desc: 'Renda, entrada, restrição e capacidade de pagamento', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Primeira abordagem — despertando o interesse', desc: 'Como iniciar a conversa sem falar em parcela logo de início', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Simulação imobiliária: apresentando com segurança', desc: 'Usando o simulador do banco para criar desejo, não medo', duracao: '22 min', totalSeconds: 1320, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Objeções imobiliárias clássicas e como respondê-las', desc: '"Vou esperar cair os juros", "ainda não tenho entrada"', duracao: '20 min', totalSeconds: 1200, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Coordenando com o corretor e a construtora', desc: 'Como trabalhar em conjunto sem perder o controle da venda', duracao: '14 min', totalSeconds: 840, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Fechamento e acompanhamento do processo', desc: 'Da proposta à assinatura — o que fazer em cada etapa', duracao: '26 min', totalSeconds: 1560, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' }
        ]
    },
    mod4: {
        titulo: 'Módulo 4 · Cartão de Crédito e Seguros',
        aulas: [
            { titulo: 'O momento certo de oferecer cartão de crédito', desc: 'Como encaixar o cartão no atendimento sem parecer forçado', duracao: '14 min', totalSeconds: 840, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Benefícios que vendem: o que destacar em cada perfil', desc: 'Milhas, cashback, limite e anuidade — o que importa para quem', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Seguros: como abordar sem parecer que está empurrando', desc: 'A técnica do "e se" para criar necessidade real', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Cross-sell após uma venda de crédito', desc: 'O momento de ouro para oferecer produtos adicionais', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Objeções de cartão e seguro — scripts prontos', desc: '"Já tenho", "não preciso", "vou pensar" — respostas rápidas', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' }
        ]
    },
    mod5: {
        titulo: 'Módulo 5 · Gestão de Carteira e Fidelização',
        aulas: [
            { titulo: 'Como montar sua régua de relacionamento', desc: 'Quando e como entrar em contato com cada tipo de cliente', duracao: '20 min', totalSeconds: 1200, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'CRM bancário na prática', desc: 'Como usar as ferramentas do banco para não perder oportunidades', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Reativando clientes inativos', desc: 'O roteiro que traz de volta quem sumiu da carteira', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Upsell e cross-sell na carteira existente', desc: 'Como identificar a próxima necessidade de cada cliente', duracao: '22 min', totalSeconds: 1320, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Programa de indicações estruturado', desc: 'Como pedir indicações sem constrangimento e com resultado', duracao: '14 min', totalSeconds: 840, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Transformando um cliente em promotor da sua carteira', desc: 'NPS bancário e como usar satisfação para crescer', duracao: '10 min', totalSeconds: 600, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' }
        ]
    },
    mod6: {
        titulo: 'Módulo 6 · Planejamento de Metas e Rotina de Alta Performance',
        aulas: [
            { titulo: 'Como desmembrar sua meta mensal em ações diárias', desc: 'Do número abstrato ao plano executável semana a semana', duracao: '22 min', totalSeconds: 1320, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Pipeline de oportunidades bancárias', desc: 'Como visualizar e gerenciar todas as negociações abertas', duracao: '18 min', totalSeconds: 1080, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Rotina da manhã do vendedor de alta performance', desc: 'O que fazer nas primeiras 2 horas do dia para bater meta', duracao: '16 min', totalSeconds: 960, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' },
            { titulo: 'Mentalidade sob pressão: como não travar no fim do mês', desc: 'Técnicas de foco e resiliência para o ambiente bancário', duracao: '24 min', totalSeconds: 1440, type: 'youtube', src: 'COLOQUE_O_ID_AQUI' }
        ]
    }
};

const MODULO_IDS = Object.keys(MODULOS);


// ================================================================
// PROGRESS MANAGER — lógica pura, async porque o storage é async
// ================================================================
const progressManager = {

    _cache: {}, // evita chamadas repetidas ao backend na mesma sessão

    _cacheKey(moduloId, i) { return `${moduloId}_${i}`; },

    async getAula(moduloId, i) {
        const key = this._cacheKey(moduloId, i);
        if (this._cache[key]) return this._cache[key];

        const salvo = await progressStorage.get(moduloId, i);
        const dados = salvo || {
            watchedSeconds: 0,
            totalSeconds: MODULOS[moduloId]?.aulas[i]?.totalSeconds || 0,
            completed: false,
            lastPosition: 0
        };
        this._cache[key] = dados;
        return dados;
    },

    async updateAula(moduloId, i, watched, total, pos) {
        const aula = MODULOS[moduloId]?.aulas[i];
        if (!aula) return;
        const t = total || aula.totalSeconds || 1;
        const completed = watched / t >= 0.85;
        const dados = {
            watchedSeconds: Math.floor(watched),
            totalSeconds: Math.floor(t),
            completed,
            lastPosition: Math.floor(pos)
        };
        this._cache[this._cacheKey(moduloId, i)] = dados;
        await progressStorage.set(moduloId, i, dados); // fire-and-forget para não travar o player
        return dados;
    },

    // Carrega todos os progressos de um módulo de uma vez e popula o cache
    async precarregarModulo(moduloId) {
        const m = MODULOS[moduloId];
        if (!m) return;
        const lista = await progressStorage.getAll(moduloId, m.aulas.length);
        lista.forEach((p, i) => {
            if (p) this._cache[this._cacheKey(moduloId, i)] = p;
        });
    },

    getPctModulo(moduloId) {
        const m = MODULOS[moduloId];
        if (!m) return 0;
        const concluidas = m.aulas.filter((_, i) => this._cache[this._cacheKey(moduloId, i)]?.completed).length;
        return Math.round((concluidas / m.aulas.length) * 100);
    },

    getConcluidasModulo(moduloId) {
        const m = MODULOS[moduloId];
        if (!m) return { concluidas: 0, total: 0 };
        const concluidas = m.aulas.filter((_, i) => this._cache[this._cacheKey(moduloId, i)]?.completed).length;
        return { concluidas, total: m.aulas.length };
    },

    getEstatisticasGerais() {
        let aulasTotal = 0, aulasConcluidas = 0, segundosAssistidos = 0, modulosIniciados = 0;
        for (const id of MODULO_IDS) {
            const m = MODULOS[id];
            aulasTotal += m.aulas.length;
            let iniciado = false;
            m.aulas.forEach((_, i) => {
                const p = this._cache[this._cacheKey(id, i)];
                if (!p) return;
                if (p.completed) aulasConcluidas++;
                if (p.watchedSeconds > 0) iniciado = true;
                segundosAssistidos += p.watchedSeconds || 0;
            });
            if (iniciado) modulosIniciados++;
        }
        return { aulasTotal, aulasConcluidas, segundosAssistidos, modulosIniciados };
    }
};


// ================================================================
// PLAYER MODAL
// ================================================================
let playerState = { moduloId: null, aulaIndex: 0, trackInterval: null };

function abrirPlayer(moduloId, aulaIndex) {
    playerState.moduloId = moduloId;
    playerState.aulaIndex = aulaIndex;
    renderizarPlayer();
    document.getElementById('playerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharPlayer() {
    pararTracking();
    document.getElementById('playerOverlay').classList.remove('active');
    document.getElementById('playerVideoContainer').innerHTML = '';
    document.body.style.overflow = '';
    atualizarUIModulo(playerState.moduloId);
    atualizarEstatisticasGerais();
}

function navegarAula(dir) {
    const m = MODULOS[playerState.moduloId];
    const prox = playerState.aulaIndex + dir;
    if (prox < 0 || prox >= m.aulas.length) return;
    pararTracking();
    playerState.aulaIndex = prox;
    renderizarPlayer();
}

async function renderizarPlayer() {
    const { moduloId, aulaIndex } = playerState;
    const modulo = MODULOS[moduloId];
    const aula = modulo.aulas[aulaIndex];
    const total = modulo.aulas.length;
    const prog = await progressManager.getAula(moduloId, aulaIndex);

    document.getElementById('playerBreadcrumb').textContent = modulo.titulo;
    document.getElementById('playerTitulo').textContent = aula.titulo;
    document.getElementById('playerProgresso').textContent = `Aula ${aulaIndex + 1} de ${total}`;

    const btnAnt = document.getElementById('playerBtnAnterior');
    const btnProx = document.getElementById('playerBtnProxima');
    btnAnt.disabled = aulaIndex === 0;
    btnAnt.style.opacity = aulaIndex === 0 ? '0.35' : '1';
    btnProx.textContent = aulaIndex === total - 1 ? '✓ Concluir módulo' : 'Próxima →';

    const vc = document.getElementById('playerVideoContainer');

    if (aula.type === 'youtube') {
        vc.innerHTML = `<iframe
            id="playerIframe"
            src="https://www.youtube.com/embed/${aula.src}?autoplay=1&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            style="position:absolute;inset:0;width:100%;height:100%;border:none">
        </iframe>`;
        iniciarTrackingYoutube(moduloId, aulaIndex, aula.totalSeconds);

    } else if (aula.type === 'mp4') {
        const startAt = prog.lastPosition || 0;
        vc.innerHTML = `<video id="playerVideo" controls autoplay
            style="position:absolute;inset:0;width:100%;height:100%;background:#000;">
            <source src="${aula.src}" type="video/mp4">
        </video>`;
        const video = document.getElementById('playerVideo');
        video.addEventListener('loadedmetadata', () => {
            if (startAt > 10) video.currentTime = startAt;
        });
        iniciarTrackingMP4(video, moduloId, aulaIndex);
    }
}

function iniciarTrackingMP4(video, moduloId, aulaIndex) {
    pararTracking();
    let maxW = progressManager._cache[progressManager._cacheKey(moduloId, aulaIndex)]?.watchedSeconds || 0;

    playerState.trackInterval = setInterval(async () => {
        if (!video || video.paused || video.ended) return;
        if (video.currentTime > maxW) maxW = video.currentTime;
        const dados = await progressManager.updateAula(
            moduloId, aulaIndex, maxW,
            video.duration || MODULOS[moduloId].aulas[aulaIndex].totalSeconds,
            video.currentTime
        );
        if (dados) atualizarBarraAula(moduloId, aulaIndex, dados);
    }, 5000);

    video.addEventListener('ended', async () => {
        const t = video.duration || MODULOS[moduloId].aulas[aulaIndex].totalSeconds;
        const dados = await progressManager.updateAula(moduloId, aulaIndex, t, t, t);
        if (dados) atualizarBarraAula(moduloId, aulaIndex, dados);
        atualizarUIModulo(moduloId);
        atualizarEstatisticasGerais();
    });
}

function iniciarTrackingYoutube(moduloId, aulaIndex, totalSeconds) {
    pararTracking();
    let w = progressManager._cache[progressManager._cacheKey(moduloId, aulaIndex)]?.watchedSeconds || 0;
    const t = totalSeconds || 1;

    playerState.trackInterval = setInterval(async () => {
        w = Math.min(w + 5, t);
        const dados = await progressManager.updateAula(moduloId, aulaIndex, w, t, w);
        if (dados) {
            atualizarBarraAula(moduloId, aulaIndex, dados);
            if (dados.completed) {
                atualizarUIModulo(moduloId);
                atualizarEstatisticasGerais();
            }
        }
    }, 5000);
}

function pararTracking() {
    if (playerState.trackInterval) {
        clearInterval(playerState.trackInterval);
        playerState.trackInterval = null;
    }
}

function criarModalPlayer() {
    const modal = document.createElement('div');
    modal.id = 'playerOverlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(10,10,20,0.92);align-items:center;justify-content:center;padding:16px;';

    modal.innerHTML = `
    <div style="width:100%;max-width:920px;background:#1A1A2E;border-radius:10px;overflow:hidden;border:1px solid rgba(201,168,76,0.35);display:flex;flex-direction:column;max-height:calc(100vh - 32px);">
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#24244A;border-bottom:1px solid rgba(201,168,76,0.2);flex-shrink:0;">
            <div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">
                <span id="playerBreadcrumb" style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#C9A84C;"></span>
                <span id="playerTitulo" style="font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span>
            </div>
            <button onclick="fecharPlayer()" aria-label="Fechar player" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;cursor:pointer;color:rgba(255,255,255,0.65);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">✕</button>
        </div>
        <div id="playerVideoContainer" style="position:relative;width:100%;aspect-ratio:16/9;background:#000;flex-shrink:0;"></div>
        <div style="padding:10px 16px;display:flex;align-items:center;justify-content:space-between;background:#24244A;border-top:1px solid rgba(201,168,76,0.12);gap:12px;flex-wrap:wrap;flex-shrink:0;">
            <div style="display:flex;gap:8px;">
                <button id="playerBtnAnterior" onclick="navegarAula(-1)" style="padding:6px 16px;font-size:12px;font-weight:500;border-radius:4px;cursor:pointer;border:1px solid rgba(201,168,76,0.45);background:transparent;color:#C9A84C;letter-spacing:.05em;text-transform:uppercase;">← Anterior</button>
                <button id="playerBtnProxima"  onclick="navegarAula(1)"  style="padding:6px 16px;font-size:12px;font-weight:500;border-radius:4px;cursor:pointer;border:1px solid #C9A84C;background:#C9A84C;color:#fff;letter-spacing:.05em;text-transform:uppercase;">Próxima →</button>
            </div>
            <span id="playerProgresso" style="font-size:11px;color:rgba(255,255,255,0.35);"></span>
        </div>
    </div>`;

    document.body.appendChild(modal);

    new MutationObserver(() => {
        modal.style.display = modal.classList.contains('active') ? 'flex' : 'none';
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });

    modal.addEventListener('click', e => { if (e.target === modal) fecharPlayer(); });
}

document.addEventListener('keydown', e => {
    const o = document.getElementById('playerOverlay');
    if (!o?.classList.contains('active')) return;
    if (e.key === 'Escape') fecharPlayer();
    if (e.key === 'ArrowRight') navegarAula(1);
    if (e.key === 'ArrowLeft') navegarAula(-1);
});


// ================================================================
// UI DOS MÓDULOS
// ================================================================
function fmt(s) {
    const v = Math.max(0, Math.floor(s));
    return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
}

async function injetarListaAulas(moduloId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const modulo = MODULOS[moduloId];
    if (!modulo) return;

    // Pré-carrega todos os progressos do módulo em uma única chamada ao backend
    await progressManager.precarregarModulo(moduloId);

    container.innerHTML = await Promise.all(modulo.aulas.map(async (aula, i) => {
        const prog = await progressManager.getAula(moduloId, i);
        const pct = prog.totalSeconds > 0 ? Math.min(100, Math.round((prog.watchedSeconds / prog.totalSeconds) * 100)) : 0;
        const cor = prog.completed ? '#4caf50' : '#C9A84C';
        return `
        <div class="lesson" onclick="abrirPlayer('${moduloId}', ${i})" role="button" tabindex="0"
             aria-label="Assistir: ${aula.titulo}" id="aula-${moduloId}-${i}">
            <div class="lesson-icon">
                ${prog.completed ? '<span style="color:#4caf50;font-size:1rem;">✓</span>' : '▶'}
            </div>
            <div class="lesson-text">
                <div class="lesson-title">${aula.titulo}</div>
                <div class="lesson-desc" id="desc-${moduloId}-${i}">
                    ${pct > 0
                ? `<span style="color:#C9A84C;">${fmt(prog.watchedSeconds)}</span><span style="color:#aaa;"> de ${aula.duracao} assistidos</span>`
                : aula.desc}
                </div>
                <div class="lesson-bar-wrap">
                    <div class="lesson-bar" id="barra-${moduloId}-${i}" style="width:${pct}%;background:${cor};"></div>
                </div>
            </div>
            <span class="lesson-duration">${aula.duracao}</span>
        </div>`;
    })).then(arr => arr.join(''));

    container.querySelectorAll('.lesson').forEach((el, i) => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirPlayer(moduloId, i); }
        });
    });
}

function atualizarBarraAula(moduloId, aulaIndex, dados) {
    const barra = document.getElementById(`barra-${moduloId}-${aulaIndex}`);
    const desc = document.getElementById(`desc-${moduloId}-${aulaIndex}`);
    const icon = document.querySelector(`#aula-${moduloId}-${aulaIndex} .lesson-icon`);
    if (!barra || !desc) return;

    const pct = dados.totalSeconds > 0 ? Math.min(100, Math.round((dados.watchedSeconds / dados.totalSeconds) * 100)) : 0;
    barra.style.width = pct + '%';
    barra.style.background = dados.completed ? '#4caf50' : '#C9A84C';

    const aula = MODULOS[moduloId]?.aulas[aulaIndex];
    if (pct > 0 && aula) {
        desc.innerHTML = `<span style="color:#C9A84C;">${fmt(dados.watchedSeconds)}</span><span style="color:#aaa;"> de ${aula.duracao} assistidos</span>`;
    }
    if (icon && dados.completed) icon.innerHTML = `<span style="color:#4caf50;font-size:1rem;">✓</span>`;
}

function renderizarAnel(moduloId) {
    const container = document.getElementById(`anel-${moduloId}`);
    if (!container) return;
    const pct = progressManager.getPctModulo(moduloId);
    const { concluidas, total } = progressManager.getConcluidasModulo(moduloId);
    const r = 18, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
    const cor = pct === 100 ? '#4caf50' : '#C9A84C';

    container.innerHTML = `
    <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="${r}" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="3"/>
        <circle cx="25" cy="25" r="${r}" fill="none" stroke="${cor}" stroke-width="3"
            stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
            stroke-dashoffset="${(circ / 4).toFixed(1)}"
            stroke-linecap="round" style="transition:stroke-dasharray .6s ease;"/>
        <text x="25" y="23" text-anchor="middle" font-family="Playfair Display,serif" font-size="10" font-weight="700" fill="${cor}">${pct}%</text>
        <text x="25" y="32" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#6B6B6B">${concluidas}/${total}</text>
    </svg>`;
}

function atualizarUIModulo(moduloId) {
    if (!moduloId) return;
    renderizarAnel(moduloId);
    MODULOS[moduloId]?.aulas.forEach((_, i) => {
        const p = progressManager._cache[progressManager._cacheKey(moduloId, i)];
        if (p) atualizarBarraAula(moduloId, i, p);
    });
}

function atualizarEstatisticasGerais() {
    const { aulasConcluidas, segundosAssistidos, modulosIniciados, aulasTotal } = progressManager.getEstatisticasGerais();
    const pct = aulasTotal > 0 ? Math.round((aulasConcluidas / aulasTotal) * 100) : 0;
    const horas = segundosAssistidos >= 3600
        ? (segundosAssistidos / 3600).toFixed(1) + 'h'
        : Math.floor(segundosAssistidos / 60) + 'min';

    document.getElementById('statAulas').textContent = aulasConcluidas;
    document.getElementById('statModulos').textContent = modulosIniciados;
    document.getElementById('statTempo').textContent = horas;
    document.getElementById('pctGeral').textContent = pct + '%';
    document.getElementById('barraGeral').style.width = pct + '%';
}


// ================================================================
// TOGGLE DE MÓDULO
// ================================================================
function toggleModule(id) {
    const body = document.getElementById(id + '-body');
    const el = document.getElementById(id);
    if (!body) return;
    const estaAberto = !body.classList.contains('collapsed');
    body.classList.toggle('collapsed');
    el.classList.toggle('open', !estaAberto);
}


// ================================================================
// INICIALIZAÇÃO
// ================================================================
async function init() {
    criarModalPlayer();

    // Tenta pré-carregar do backend, mas não trava se falhar
    await Promise.allSettled(MODULO_IDS.map(id => progressManager.precarregarModulo(id)));

    // Injeta listas e anéis
    for (const id of MODULO_IDS) {
        await injetarListaAulas(id, `lista-${id}`);
        renderizarAnel(id);
    }

    // Abre módulo 1 por padrão
    const b1 = document.getElementById('mod1-body');
    if (b1) b1.classList.remove('collapsed');
    document.getElementById('mod1')?.classList.add('open');

    atualizarEstatisticasGerais();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}