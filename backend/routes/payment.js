// ================================================================
//  routes/payment.js — Mercado Pago SDK v3 (já instalado)
//  Rotas:
//    POST /api/payment/cartao
//    POST /api/payment/pix
//    POST /api/payment/boleto
// ================================================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MercadoPagoConfig, Payment } = require('mercadopago');

// ── Configuração do Mercado Pago ────────────────────────────────
// ⚠️ Adicione no seu .env:  MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 5000 }
});
const payment = new Payment(client);

// ── Model de usuário (já criado no auth.js) ─────────────────────
const User = mongoose.models.User;

// ── Valor fixo do produto ───────────────────────────────────────
const VALOR = 497.00;
const DESCRICAO = 'Mentoria Onda de Resultados — Acesso Vitalício';

// ── Middleware de autenticação (opcional para checkout)
// O checkout pode ser feito sem token (o aluno acabou de se cadastrar)
// mas precisamos do email para vincular o pagamento ao usuário.

// ────────────────────────────────────────────────────────────────
// POST /api/payment/cartao
// ────────────────────────────────────────────────────────────────
router.post('/cartao', async (req, res) => {
    try {
        const { token, issuerId, paymentMethodId, installments, payer } = req.body;

        if (!token || !payer?.email) {
            return res.status(400).json({ erro: 'Dados incompletos.' });
        }

        const result = await payment.create({
            body: {
                transaction_amount: VALOR,
                token,
                description: DESCRICAO,
                installments: installments || 1,
                payment_method_id: paymentMethodId,
                issuer_id: issuerId,
                payer: {
                    email: payer.email,
                    identification: payer.identification
                }
            },
            requestOptions: { idempotencyKey: `cartao-${payer.email}-${Date.now()}` }
        });

        // Se aprovado, libera o aluno no banco
        if (result.status === 'approved') {
            await User.findOneAndUpdate(
                { email: payer.email },
                { pago: true },
                { new: true }
            );
        }

        res.json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id
        });

    } catch (err) {
        console.error('Erro cartão:', err);
        res.status(500).json({ erro: 'Erro ao processar pagamento com cartão.' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/pix
// ────────────────────────────────────────────────────────────────
router.post('/pix', async (req, res) => {
    try {
        const { payer } = req.body;

        if (!payer?.email || !payer?.identification?.number) {
            return res.status(400).json({ erro: 'Email e CPF são obrigatórios.' });
        }

        const result = await payment.create({
            body: {
                transaction_amount: VALOR,
                description: DESCRICAO,
                payment_method_id: 'pix',
                payer: {
                    email: payer.email,
                    first_name: payer.nome || '',
                    identification: payer.identification
                }
            },
            requestOptions: { idempotencyKey: `pix-${payer.email}-${Date.now()}` }
        });

        const pixData = result.point_of_interaction?.transaction_data;

        res.json({
            id: result.id,
            status: result.status,
            qr_code: pixData?.qr_code,
            qr_code_base64: pixData?.qr_code_base64
        });

    } catch (err) {
        console.error('Erro PIX:', err);
        res.status(500).json({ erro: 'Erro ao gerar PIX.' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/boleto
// ────────────────────────────────────────────────────────────────
router.post('/boleto', async (req, res) => {
    try {
        const { payer } = req.body;

        if (!payer?.email || !payer?.identification?.number) {
            return res.status(400).json({ erro: 'Email e CPF são obrigatórios.' });
        }

        const result = await payment.create({
            body: {
                transaction_amount: VALOR,
                description: DESCRICAO,
                payment_method_id: 'bolbradesco', // ou 'pec' para Lotérica
                payer: {
                    email: payer.email,
                    first_name: payer.nome || '',
                    identification: payer.identification,
                    address: {
                        zip_code: payer.address?.zip_code || '01310100',
                        street_name: payer.address?.street || '',
                        street_number: payer.address?.number || '',
                        neighborhood: payer.address?.neighborhood || '',
                        city: payer.address?.city || '',
                        federal_unit: payer.address?.state || 'SP'
                    }
                }
            },
            requestOptions: { idempotencyKey: `boleto-${payer.email}-${Date.now()}` }
        });

        res.json({
            id: result.id,
            status: result.status,
            boleto_url: result.transaction_details?.external_resource_url
        });

    } catch (err) {
        console.error('Erro boleto:', err);
        res.status(500).json({ erro: 'Erro ao gerar boleto.' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/webhook
// Mercado Pago notifica aqui quando o status muda (PIX/Boleto)
// Configure a URL no painel do MP: https://seu-app.onrender.com/api/payment/webhook
// ────────────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const info = await payment.get({ id: data.id });

            if (info.status === 'approved') {
                const email = info.payer?.email;
                if (email) {
                    await User.findOneAndUpdate(
                        { email },
                        { pago: true }
                    );
                    console.log(`✅ Pagamento aprovado via webhook: ${email}`);
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