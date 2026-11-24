// src/components/SmartExpenseInput.jsx
import { useState } from 'react';
import { parseExpenseText, parseReceiptImage } from '../services/api';
import toast from 'react-hot-toast';

export function SmartExpenseInput({ onParsed }) {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setLoading(true);
    try {
      const result = await parseExpenseText(textInput);
      onParsed(result);
      setTextInput('');
      toast.success('Text parsed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to parse text');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    toast.loading('Running Vision OCR on receipt...', { id: 'ocr' });
    try {
      const receiptData = await parseReceiptImage(file);
      onParsed({
        merchant: receiptData.merchant,
        totalAmount: receiptData.totalAmount,
        currency: receiptData.currency || 'INR',
        date: receiptData.date || new Date().toISOString().split('T')[0],
        suggestedAccountType: 'CREDIT_CARD',
        items: receiptData.items || []
      });
      toast.success('Receipt scanned & itemized!', { id: 'ocr' });
    } catch (err) {
      toast.error(err.message || 'Failed to scan receipt', { id: 'ocr' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-2xl shadow-xl space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        ⚡ Smart AI Ingest (Text or Receipt Vision)
      </h3>
      
      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='e.g., "Spent 450 on groceries and 150 on cab"'
          disabled={loading}
          className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !textInput.trim()}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
        >
          Parse
        </button>
      </form>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <label className="text-xs text-cyan-400 font-medium cursor-pointer hover:underline flex items-center gap-1.5">
          📷 Upload Receipt Photo (.jpg/.png)
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={loading} className="hidden" />
        </label>
        {loading && <span className="text-xs text-slate-400 animate-pulse">Processing AI pipeline...</span>}
      </div>
    </div>
  );
}