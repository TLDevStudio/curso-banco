const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

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
// Retorna quais módulos o aluno pode acessar
router.get('/acesso', autenticar, (req, res) => {
    if (req.user.pago) {
        res.json({ modulos: ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'] });
    } else {
        res.json({ modulos: ['mod1'] }); // mod1 é a prévia gratuita
    }
});

module.exports = router;