// ================================================================
// API.JS — comunicação com o backend
// ================================================================

const API_URL = 'https://curso-banco-api.onrender.com';

const api = {

    // Salva o token após login/cadastro
    salvarToken(token, nome) {
        localStorage.setItem('token', token);
        localStorage.setItem('nome', nome);
    },

    // Pega o token salvo
    getToken() {
        return localStorage.getItem('token');
    },

    // Verifica se está logado
    estaLogado() {
        return !!localStorage.getItem('token');
    },

    // Faz logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        window.location.href = '/curso-banco/pages/login.html';
    },

    // Cadastro
    async cadastrar(nome, email, senha) {
        const res = await fetch(`${API_URL}/api/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        return res.json();
    },

    // Login
    async login(email, senha) {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        return res.json();
    },

    // Verifica quais módulos o aluno pode acessar
    async getModulos() {
        const res = await fetch(`${API_URL}/api/modules/acesso`, {
            headers: { 'Authorization': `Bearer ${this.getToken()}` }
        });
        return res.json();
    }
};