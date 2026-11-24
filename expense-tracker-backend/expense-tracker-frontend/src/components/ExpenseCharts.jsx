// src/components/ExpenseCharts.jsx

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function ExpenseCharts({ expenses = [] }) {
  // Aggregate data by Category for the Pie Chart
  const categoryMap = {};
  // Aggregate data by Date for the Area Chart
  const dateMap = {};

  expenses.forEach((exp) => {
    const dateStr = new Date(exp.createdAt || exp.date).toLocaleDateString();
    dateMap[dateStr] = (dateMap[dateStr] || 0) + Number(exp.totalAmount || 0);

    if (exp.items && exp.items.length > 0) {
      exp.items.forEach((item) => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.amount || 0);
      });
    } else {
      categoryMap['General'] = (categoryMap['General'] || 0) + Number(exp.totalAmount || 0);
    }
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({ name: cat, value: categoryMap[cat] }));
  const areaData = Object.keys(dateMap).map((date) => ({ date, amount: dateMap[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (expenses.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No categorical spending records found yet. Log an expense to populate charts!</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
      {/* Category Distribution Pie Chart */}
      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#f8fafc' }}>📊 Category Distribution</h4>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Trajectory Area Chart */}
      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#f8fafc' }}>📈 Daily Trajectory</h4>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}