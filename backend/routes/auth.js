const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Model do usuário
const userSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    pago: { type: Boolean, default: false },
    criadoEm: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// POST /api/auth/cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha)
            return res.status(400).json({ erro: 'Preencha todos os campos' });

        const existe = await User.findOne({ email });
        if (existe)
            return res.status(400).json({ erro: 'Email já cadastrado' });

        const hash = await bcrypt.hash(senha, 10);
        // pago: false é o default — só o admin pode liberar
        const user = await User.create({ nome, email, senha: hash, pago: false });

        // ⚠️  NÃO retorna token no cadastro.
        // O aluno precisa pagar primeiro, depois fazer login manualmente.
        res.json({ ok: true, nome: user.nome });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ erro: 'Email ou senha incorretos' });

        const ok = await bcrypt.compare(senha, user.senha);
        if (!ok)
            return res.status(401).json({ erro: 'Email ou senha incorretos' });

        // ✅ Lê pago diretamente do banco (não do token antigo)
        const token = jwt.sign(
            { id: user._id, pago: user.pago },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, nome: user.nome, pago: user.pago });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

module.exports = router;