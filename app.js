require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurar limitador de solicitudes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por IP
    message: 'Has superado el límite de solicitudes permitidas. Por favor, intenta nuevamente en 15 minutos.'
});

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(__dirname));

// Aplicar el limitador a todas las rutas
app.use(limiter);

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('Error: No se encontró la variable de entorno GEMINI_API_KEY');
    process.exit(1);
}
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/chat', async (req, res) => {
    try {
        console.log('Mensaje recibido:', req.body);
        const { message } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Mensaje no válido' });
        }

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!response.ok) {
            console.error('Error de API:', data.error);
            throw new Error(`Error en la API: ${response.status} - ${data.error?.message || 'Error desconocido'}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error('Respuesta vacía:', data);
            throw new Error('Respuesta vacía de la API');
        }

        res.json({ response: text });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ 
            error: 'Error al procesar el mensaje',
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});