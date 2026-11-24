// src/components/TransactionReview.jsx
export function TransactionReview({ data, onSave }) {
  if (!data) return null;

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/80 p-6 backdrop-blur-2xl shadow-2xl space-y-4 my-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h4 className="text-base font-bold text-white">{data.merchant || 'Parsed Expense'}</h4>
          <span className="text-xs text-slate-400">{data.date}</span>
        </div>
        <div className="text-right">
          <strong className="text-xl text-cyan-400">₹{Number(data.totalAmount || 0).toFixed(2)}</strong>
          <div className="text-[11px] text-fuchsia-400">{data.suggestedAccountType || 'General'}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase">
              <th className="pb-2">Description</th>
              <th className="pb-2">Category</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(data.items || []).map((item, idx) => (
              <tr key={idx}>
                <td className="py-2.5 text-slate-300">{item.description}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 text-right font-semibold text-white">₹{Number(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => onSave(data)}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-xs font-bold text-white shadow-lg hover:brightness-110 cursor-pointer transition"
      >
        Confirm & Save to Ledger
      </button>
    </div>
  );
}