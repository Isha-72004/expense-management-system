// src/components/FinancialCopilot.jsx
import { useState } from 'react';
import { askFinancialCopilot } from '../services/api';

export function FinancialCopilot({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about your spending or budget.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const reply = await askFinancialCopilot(userId, userMsg, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the copilot.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '0.75rem 1.25rem', background: '#6366f1', color: '#fff', borderRadius: '2rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', fontWeight: 600, zIndex: 50 }}
      >
        💬 Ask AI Copilot
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '350px', height: '450px', background: '#0f172a', border: '1px solid #334155', borderRadius: '1rem', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50, color: '#f8fafc' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>✨ Financial Copilot</h4>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#4f46e5' : '#1e293b', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', maxWidth: '80%' }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Thinking...</div>}
      </div>
      <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid #1e293b', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., How much did I spend on dining?"
          style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #334155', background: '#020617', color: '#fff', fontSize: '0.85rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.4rem', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}