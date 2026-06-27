const express = require('express');
const router = express.Router();
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

// Middleware admin
function autenticarAdmin(req, res, next) {
    const senha = req.headers['x-admin-key'];
    if (senha !== process.env.ADMIN_KEY) {
        return res.status(401).json({ erro: 'Acesso negado' });
    }
    next();
}

// GET /api/admin/alunos — lista todos
router.get('/alunos', autenticarAdmin, async (req, res) => {
    try {
        const alunos = await User.find({}, '-senha').sort({ criadoEm: -1 });
        res.json(alunos);
    } catch {
        res.status(500).json({ erro: 'Erro ao buscar alunos' });
    }
});

// PATCH /api/admin/alunos/:id/liberar — libera acesso
router.patch('/alunos/:id/liberar', autenticarAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { pago: true },
            { new: true, select: '-senha' }
        );
        if (!user) return res.status(404).json({ erro: 'Aluno não encontrado' });
        res.json({ mensagem: 'Acesso liberado!', aluno: user });
    } catch {
        res.status(500).json({ erro: 'Erro ao liberar acesso' });
    }
});

// PATCH /api/admin/alunos/:id/bloquear — revoga acesso
router.patch('/alunos/:id/bloquear', autenticarAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { pago: false },
            { new: true, select: '-senha' }
        );
        if (!user) return res.status(404).json({ erro: 'Aluno não encontrado' });
        res.json({ mensagem: 'Acesso revogado!', aluno: user });
    } catch {
        res.status(500).json({ erro: 'Erro ao revogar acesso' });
    }
});

// DELETE /api/admin/alunos/:id — remove aluno
router.delete('/alunos/:id', autenticarAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ mensagem: 'Aluno removido!' });
    } catch {
        res.status(500).json({ erro: 'Erro ao remover aluno' });
    }
});

module.exports = router;