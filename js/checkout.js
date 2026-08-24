const CHECKOUT_API = 'https://curso-banco-api.onrender.com';

// Pré-preenche se vieram dados do cadastro
document.addEventListener('DOMContentLoaded', () => {
    const email = sessionStorage.getItem('cadastroEmail') || '';
    const nome = sessionStorage.getItem('cadastroNome') || '';
    if (email) document.getElementById('emailCheckout').value = email;
    if (nome) document.getElementById('nomeCheckout').value = nome;

    // Verifica se voltou do MP com status
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'erro') {
        mostrarMsg('Pagamento não concluído. Tente novamente.', 'erro');
    }
});

function mostrarMsg(texto, tipo = 'erro') {
    const el = document.getElementById('checkoutMsg');
    el.textContent = texto;
    el.className = `checkout-msg ${tipo}`;
}

function setLoading(loading) {
    const btn = document.getElementById('btnPagar');
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
}

async function irParaPagamento() {
    const email = document.getElementById('emailCheckout').value.trim();
    const nome = document.getElementById('nomeCheckout').value.trim();

    if (!email || !email.includes('@')) {
        mostrarMsg('Informe um e-mail válido.');
        return;
    }

    setLoading(true);

    try {
        const res = await fetch(`${CHECKOUT_API}/api/payment/preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nome })
        });

        const data = await res.json();

        /* if (data.link) {
            window.location.href = data.link;
        } else {
            mostrarMsg(data.erro || 'Erro ao iniciar pagamento. Tente novamente.');
            setLoading(false);
        } */ /* ===== somente quando eu colocar o token de produção real ===== */

        if (data.link_sandbox) {
            // Em teste usa sandbox, em produção usa link
            window.location.href = data.link_sandbox;
        } else if (data.link) {
            window.location.href = data.link;
        } else {
            mostrarMsg(data.erro || 'Erro ao iniciar pagamento. Tente novamente.');
            setLoading(false);
        }

    } catch (err) {
        console.error(err);
        mostrarMsg('Erro de conexão. Verifique sua internet e tente novamente.');
        setLoading(false);
    }
}