// ================================================================
//  routes/payment.js — Checkout Pro (Mercado Pago)
//  Rota:
//    POST /api/payment/preferencia  → retorna link de pagamento
//    POST /api/payment/webhook      → libera acesso após pagamento
// ================================================================

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 5000 }
});

const preference = new Preference(client);
const payment = new Payment(client);

const User = mongoose.models.User;

const VALOR = 1.00; // ← mude para 497.00 quando for produção
const DESCRICAO = 'Mentoria Onda de Resultados — Acesso Vitalício';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ────────────────────────────────────────────────────────────────
// POST /api/payment/preferencia
// Frontend chama isso e recebe o link do MP para redirecionar
// ────────────────────────────────────────────────────────────────
router.post('/preferencia', async (req, res) => {
    try {
        const { email, nome } = req.body;

        if (!email) {
            return res.status(400).json({ erro: 'Email obrigatório.' });
        }

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: DESCRICAO,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: VALOR
                    }
                ],
                payer: {
                    email,
                    name: nome || ''
                },
                back_urls: {
                    success: `${BASE_URL}/pages/login.html?origem=checkout&status=aprovado`,
                    failure: `${BASE_URL}/pages/checkout.html?status=erro`,
                    pending: `${BASE_URL}/pages/login.html?origem=checkout&status=pendente`
                },
                auto_return: 'approved',
                notification_url: `${process.env.API_URL}/api/payment/webhook`,
                metadata: { email }
            }
        });

        res.json({
            link: result.init_point,           // link de produção
            link_sandbox: result.sandbox_init_point  // link de teste
        });

    } catch (err) {
        console.error('Erro preferência:', err);
        res.status(500).json({ erro: 'Erro ao criar preferência de pagamento.' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/webhook
// ────────────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const info = await payment.get({ id: data.id });

            if (info.status === 'approved') {
                const email = info.payer?.email || info.metadata?.email;
                if (email) {
                    await User.findOneAndUpdate(
                        { email },
                        { pago: true }
                    );
                    console.log(`✅ Pagamento aprovado: ${email}`);
                }
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('Webhook erro:', err);
        res.sendStatus(500);
    }
});

module.exports = router;