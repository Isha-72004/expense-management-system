const { GoogleGenAI } = require('@google/genai');
const path = require('path');

// Dynamically point to the exact location of your .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

module.exports = ai;