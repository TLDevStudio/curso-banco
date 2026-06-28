const API_URL = 'https://curso-banco-api.onrender.com';
let adminKey = '';
let todosAlunos = [];

// Verifica se já tem sessão salva
window.addEventListener('load', () => {
    const keySalva = sessionStorage.getItem('adminKey');
    if (keySalva) {
        adminKey = keySalva;
        mostrarPainel();
        carregarAlunos();
    }
});

async function entrarAdmin() {
    const senha = document.getElementById('adminSenha').value;
    const erro = document.getElementById('adminErro');

    if (!senha) {
        erro.textContent = 'Digite a senha.';
        erro.style.display = 'block';
        return;
    }

    // Testa a senha fazendo uma requisição real
    const res = await fetch(`${API_URL}/api/admin/alunos`, {
        headers: { 'x-admin-key': senha }
    });

    if (!res.ok) {
        erro.textContent = 'Senha incorreta.';
        erro.style.display = 'block';
        return;
    }

    adminKey = senha;
    sessionStorage.setItem('adminKey', senha);
    mostrarPainel();

    const alunos = await res.json();
    renderizarAlunos(alunos);
}

function mostrarPainel() {
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'block';
}

function sairAdmin() {
    sessionStorage.removeItem('adminKey');
    adminKey = '';
    document.getElementById('telaLogin').style.display = 'flex';
    document.getElementById('painelAdmin').style.display = 'none';
    document.getElementById('adminSenha').value = '';
}

async function carregarAlunos() {
    const tbody = document.getElementById('tabelaAlunos');
    tbody.innerHTML = '<tr><td colspan="5" class="admin-loading">Carregando...</td></tr>';

    const res = await fetch(`${API_URL}/api/admin/alunos`, {
        headers: { 'x-admin-key': adminKey }
    });

    const alunos = await res.json();
    todosAlunos = alunos;
    renderizarAlunos(alunos);
}

function renderizarAlunos(alunos) {
    const tbody = document.getElementById('tabelaAlunos');

    // Estatísticas
    document.getElementById('statTotal').textContent = alunos.length;
    document.getElementById('statPagos').textContent = alunos.filter(a => a.pago).length;
    document.getElementById('statPendentes').textContent = alunos.filter(a => !a.pago).length;

    if (!alunos.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-vazio">Nenhum aluno cadastrado ainda.</td></tr>';
        return;
    }

    tbody.innerHTML = alunos.map(aluno => {
        const data = new Date(aluno.criadoEm).toLocaleDateString('pt-BR');
        return `
        <tr id="row-${aluno._id}">
            <td><strong>${aluno.nome}</strong></td>
            <td>${aluno.email}</td>
            <td>${data}</td>
            <td>
                <span class="status-badge ${aluno.pago ? 'status-pago' : 'status-pendente'}">
                    ${aluno.pago ? '✓ Pago' : '✗ Pendente'}
                </span>
            </td>
            <td>
                ${aluno.pago
                ? `<button class="action-btn btn-bloquear" onclick="bloquear('${aluno._id}')">Revogar</button>`
                : `<button class="action-btn btn-liberar" onclick="liberar('${aluno._id}')">Liberar</button>`
            }
                <button class="action-btn btn-remover" onclick="remover('${aluno._id}', '${aluno.nome}')">Remover</button>
            </td>
        </tr>`;
    }).join('');
}

function filtrarAlunos() {
    const busca = document.getElementById('busca').value.toLowerCase();
    const filtrados = todosAlunos.filter(a =>
        a.nome.toLowerCase().includes(busca) ||
        a.email.toLowerCase().includes(busca)
    );
    renderizarAlunos(filtrados);
}

async function liberar(id) {
    await fetch(`${API_URL}/api/admin/alunos/${id}/liberar`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey }
    });
    carregarAlunos();
}

async function bloquear(id) {
    await fetch(`${API_URL}/api/admin/alunos/${id}/bloquear`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey }
    });
    carregarAlunos();
}

async function remover(id, nome) {
    if (!confirm(`Remover o aluno "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`${API_URL}/api/admin/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
    });
    carregarAlunos();
}

// Enter para logar
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('telaLogin').style.display !== 'none') {
        entrarAdmin();
    }
});