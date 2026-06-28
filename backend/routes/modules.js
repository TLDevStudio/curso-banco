const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Reutiliza o model já registrado pelo auth.js
const User = mongoose.models.User;

// Middleware que verifica o token
function autenticar(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erro: 'Token inválido' });
    }
}

// GET /api/modules/acesso
// ✅ Consulta o banco a cada request — reflete liberação do admin imediatamente
router.get('/acesso', autenticar, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('pago');
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });

        if (user.pago) {
            res.json({ pago: true, modulos: ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'] });
        } else {
            // pago: false → área de membros mostra tela de bloqueio
            res.json({ pago: false, modulos: [] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

module.exports = router;