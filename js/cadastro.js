// ================================================================
//  CADASTRO.JS — frontend
//  Fluxo: cadastro → checkout (NÃO área de membros)
// ================================================================

const form = document.getElementById('formCadastro');
const btnEnviar = document.getElementById('btnCadastro');
const erroEl = document.getElementById('erroMsg');

// Se já está logado e pago, vai direto para área de membros
if (api.estaLogado()) {
    const token = api.getToken();
    // Decodifica o token sem verificar assinatura (só para checar o campo pago)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Mesmo logado, só redireciona para membros se o admin já liberou
        // Caso contrário, deixa na página de cadastro/checkout
    } catch (e) { /* ignora */ }
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroEl.textContent = '';
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Cadastrando...';

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmarSenha')?.value;

    // Validações básicas no front
    if (confirmar !== undefined && senha !== confirmar) {
        erroEl.textContent = 'As senhas não coincidem.';
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Criar Conta';
        return;
    }

    if (senha.length < 6) {
        erroEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Criar Conta';
        return;
    }

    try {
        const data = await api.cadastrar(nome, email, senha);

        if (data.erro) {
            erroEl.textContent = data.erro;
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Criar Conta';
            return;
        }

        // ✅ Cadastro OK — guarda o email para pré-preencher no checkout
        // NÃO salva token nem redireciona para área de membros
        sessionStorage.setItem('cadastroEmail', email);
        sessionStorage.setItem('cadastroNome', nome);

        // Redireciona para o checkout
        window.location.href = './checkout.html';

    } catch (err) {
        erroEl.textContent = 'Erro de conexão. Tente novamente.';
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Criar Conta';
    }
});