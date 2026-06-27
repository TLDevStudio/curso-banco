const express = require('express');
const router = express.Router();

// POST /api/payment/criar
router.post('/criar', async (req, res) => {
    res.json({ message: 'Integração Mercado Pago em breve' });
});

module.exports = router;