require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');

// ================== APP ==================
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ================== RATE LIMIT ==================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ================== GROQ ==================
if (!process.env.GROQ_API_KEY) {
  console.error('❌ Falta GROQ_API_KEY en el archivo .env');
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ================== ROUTES ==================
app.get('/', (_, res) => {
  res.send('API Groq funcionando 🚀');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-prompt-guard-2-22m',
      messages: [
        { role: 'user', content: message }
      ]
    });

    res.json({
      response: completion.choices[0].message.content
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      error: 'Error interno',
      details: err.message
    });
  }
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor activo: http://localhost:${PORT}`);
});
