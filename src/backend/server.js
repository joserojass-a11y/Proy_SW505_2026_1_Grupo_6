const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGINS }));
app.use(express.json());

// Endpoint de Health Check requerido por operaciones
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        services: { database: 'CONNECTED' } // Integrar lógica de ping real aquí
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});