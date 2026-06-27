const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/modules', require('./routes/modules'));

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'API Onda de Resultados funcionando ✅' });
});

// Conecta ao banco e sobe o servidor
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB conectado');
        app.listen(process.env.PORT, () => {
            console.log(`✅ Servidor rodando na porta ${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));