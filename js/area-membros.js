// Se não estiver logado, manda para login
if (!api.estaLogado()) {
    window.location.href = '/curso-banco/pages/login.html';
}

// Mostra o nome do aluno
const nome = localStorage.getItem('nome');
if (nome) document.getElementById('nomeAluno').textContent = nome;

// Verifica se tem acesso pago
async function verificarAcesso() {
    const card = document.getElementById('cardConteudo');
    const avisoNegado = document.getElementById('acessoNegado');

    const timeout = setTimeout(() => {
        card.innerHTML = `
            <div class="membros-card-icon">⚠️</div>
            <h2>Servidor iniciando...</h2>
            <p>O servidor estava em repouso e está acordando. Aguarde 30 segundos e tente novamente.</p>
            <button class="btn-primary" onclick="verificarAcesso()">Tentar novamente</button>`;
    }, 10000);

    try {
        const res = await api.getModulos();
        clearTimeout(timeout);

        if (res.modulos && res.modulos.length > 1) {
            card.innerHTML = `
                <div class="membros-card-icon">🎉</div>
                <h2>Acesso Liberado!</h2>
                <p>Seus módulos estão disponíveis.</p>`;
        } else {
            avisoNegado.style.display = 'block';
            card.innerHTML = `
                <div class="membros-card-icon">🔒</div>
                <h2>Acesso Pendente</h2>
                <p>Aguardando confirmação do pagamento.</p>
                <a href="checkout.html" class="btn-primary" style="display:inline-block;text-decoration:none;">
                    Realizar Pagamento
                </a>`;
        }
    } catch {
        clearTimeout(timeout);
        card.innerHTML = `
            <div class="membros-card-icon">⚠️</div>
            <h2>Erro de conexão</h2>
            <p>Não foi possível verificar seu acesso. Tente novamente.</p>
            <button class="btn-primary" onclick="verificarAcesso()">Tentar novamente</button>`;
    }
}

function fazerLogout() {
    api.logout();
}

verificarAcesso();