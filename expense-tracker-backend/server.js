// expense-tracker-backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import fs from 'fs';

// 1. Initialize environment variables and express app FIRST
dotenv.config();
const app = express();

// 2. Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// 3. Initialize Google Gen AI and Multer
const ai = new GoogleGenAI({});
const upload = multer({ dest: 'uploads/' });

// --- AUTH & EXPENSE ROUTES PLACEHOLDER (Ensure your DB connection is here if separate) ---
// If you have separate router files (e.g., authRoutes, expenseRoutes), mount them here:
// import authRouter from './routes/authRoutes.js';
// import expenseRouter from './routes/expenseRoutes.js';
// app.use('/api/auth', authRouter);
// app.use('/api/expenses', expenseRouter);

// 4. AI Routes
app.post('/api/ai/parse-text', async (req, res) => {
  try {
    const { text, referenceDate } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Extract expense details from this text: "${text}". Reference date is ${referenceDate}. Return valid JSON containing: merchant, totalAmount, currency, date, and items array with description, category, amount, and quantity.`
    });

    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    res.json({ success: true, data: JSON.parse(rawText) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/parse-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt file uploaded' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype || 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: 'Extract itemized expense data from this receipt image. Return ONLY valid JSON matching schema: { "merchant": string, "totalAmount": number, "currency": string, "date": string, "items": [{ "description": string, "category": string, "amount": number, "quantity": number }] }'
        }
      ]
    });

    fs.unlinkSync(req.file.path);

    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    res.json({ success: true, data: JSON.parse(rawText) });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message } = req.body;

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: 'You are an expert personal finance AI copilot. Answer queries concisely and offer smart budgeting advice.'
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ success: true, data: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Listen on PORT at the bottom (Defaults to 5000 as configured in your .env)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
// --- EXPENSES & CATEGORIES BACKEND ROUTES ---

// 1. Get all expenses
app.get('/expenses', async (req, res) => {
  try {
    // If you are using a database connection pool, query your expenses table here.
    // Example with mysql2/promise:
    // const [rows] = await db.query('SELECT * FROM expenses ORDER BY date DESC');
    // res.json(rows);

    // Temporary mock response if database setup is pending:
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Post a new expense
app.post('/expenses', async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    // const [result] = await db.query('INSERT INTO expenses (category_id, amount, description, date) VALUES (?, ?, ?, ?)', [category_id, amount, description, date]);
    res.json({ success: true, id: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete an expense
app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // await db.query('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get categories
app.get('/categories', async (req, res) => {
  try {
    // const [rows] = await db.query('SELECT * FROM categories');
    // res.json(rows);
    
    // Fallback default categories matching your frontend fallback list
    res.json([
      { id: 1, name: 'Food & Dining' },
      { id: 2, name: 'Transportation' },
      { id: 3, name: 'Utilities' },
      { id: 4, name: 'Education' },
      { id: 5, name: 'Entertainment' },
      { id: 6, name: 'Health' },
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});