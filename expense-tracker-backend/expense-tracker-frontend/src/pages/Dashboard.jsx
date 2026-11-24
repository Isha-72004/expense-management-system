// src/pages/Dashboard.jsx
import { FinancialCopilot } from '../components/FinancialCopilot';
import { SmartExpenseInput } from '../components/SmartExpenseInput';
import { TransactionReview } from '../components/TransactionReview';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { convertAmount, getCurrencySymbol } from '../services/currencyService';
import {
  Trash2,
  LogOut,
  PlusCircle,
  Receipt,
  Calendar,
  Tag,
  FileText,
  Sparkles,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Flame,
  Zap,
  Target,
} from 'lucide-react';

const CHROMATIC_PALETTE = [
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#f43f5e',
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Food & Dining' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Utilities' },
  { id: 4, name: 'Education' },
  { id: 5, name: 'Entertainment' },
  { id: 6, name: 'Health' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Currency Selection State
  const [currentCurrency, setCurrentCurrency] = useState('INR');

  // AI Parsed Receipt / Text preview state
  const [parsedPreviewData, setParsedPreviewData] = useState(null);

  // Budget State Management
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return parseFloat(localStorage.getItem('user_monthly_budget')) || 25000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('ALL');

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [expenseRes, catRes] = await Promise.allSettled([
          API.get('/expenses'),
          API.get('/categories'),
        ]);

        if (!isMounted) return;

        if (expenseRes.status === 'fulfilled') {
          setExpenses(expenseRes.value.data || []);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.length > 0) {
          setCategories(catRes.value.data);
        }
      } catch (err) {
        console.error('Data reload error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    setMonthlyBudget(parsed);
    localStorage.setItem('user_monthly_budget', parsed);
    setIsEditingBudget(false);
    toast.success('Budget limit updated!');
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.amount || !formData.date) {
      toast.error('Please fill in category, amount, and date');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    const parsedCategoryId = parseInt(formData.category_id, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category_id: parsedCategoryId,
        amount: parsedAmount,
        description: formData.description?.trim() || 'Expense',
        date: formData.date,
      };

      await API.post('/expenses', payload);
      toast.success('Expense recorded!');

      setFormData({
        category_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      const updated = await API.get('/expenses');
      setExpenses(updated.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveParsedTransaction = async (parsedData) => {
    try {
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === (parsedData.items?.[0]?.category || '').toLowerCase()
      ) || categories[0];

      const payload = {
        category_id: matchedCat.id,
        amount: parseFloat(parsedData.totalAmount || 0),
        description: parsedData.merchant ? `Receipt: ${parsedData.merchant}` : 'AI Parsed Expense',
        date: parsedData.date || new Date().toISOString().split('T')[0],
      };

      await API.post('/expenses', payload);
      toast.success('AI Parsed expense saved to ledger!');
      setParsedPreviewData(null);

      const updated = await API.get('/expenses');
      setExpenses(updated.data || []);
    } catch {
      toast.error('Failed to save parsed receipt');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;

    try {
      await API.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      toast.success('Expense deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const headers = `ID,Date,Category,Description,Amount (${currentCurrency})\n`;
    const rows = expenses
      .map((exp) => {
        const cleanDesc = (exp.description || '').replace(/,/g, ' ');
        const cleanCategory = (exp.category_name || 'General').replace(/,/g, ' ');
        const dateStr = exp.date ? new Date(exp.date).toISOString().split('T')[0] : '';
        const converted = convertAmount(exp.amount, currentCurrency);
        return `${exp.id},${dateStr},${cleanCategory},${cleanDesc},${converted}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expense_Analytics_${currentCurrency}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully!');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch = (item.description || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedFilterCategory === 'ALL' ||
        String(item.category_id) === String(selectedFilterCategory);
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedFilterCategory]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [expenses]);

  const budgetProgress = Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100);
  const isBudgetExceeded = totalSpent >= monthlyBudget;
  const isBudgetNearLimit = totalSpent >= monthlyBudget * 0.8 && !isBudgetExceeded;

  const currencySymbol = getCurrencySymbol(currentCurrency);

  const categoryChartData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const name = item.category_name || 'General';
      map[name] = (map[name] || 0) + parseFloat(item.amount || 0);
    });
    return Object.keys(map).map((name) => ({
      name,
      value: parseFloat(convertAmount(map[name], currentCurrency)),
    }));
  }, [expenses, currentCurrency]);

  const timelineChartData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      if (!item.date) return;
      const dateObj = new Date(item.date);
      const key = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      map[key] = (map[key] || 0) + parseFloat(item.amount || 0);
    });
    return Object.keys(map).map((key) => ({
      date: key,
      amount: parseFloat(convertAmount(map[key], currentCurrency)),
    }));
  }, [expenses, currentCurrency]);

  return (
    <div className="min-h-screen w-full bg-[#070913] text-slate-100 relative overflow-x-hidden selection:bg-fuchsia-500 selection:text-white pb-20">
      {/* Background Chromatic Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 0.95, 1],
          x: [0, 60, -40, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-10 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-fuchsia-600/25 via-pink-500/20 to-rose-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.2, 1.1],
          x: [0, -70, 30, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-0 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-indigo-600/25 via-purple-600/20 to-cyan-500/20 blur-[140px] pointer-events-none"
      />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3.5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-[1px] shadow-lg shadow-purple-500/20">
              <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-fuchsia-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <p className="text-xs text-slate-400">
                Welcome back, <span className="text-cyan-400 font-medium">{user?.name || 'Explorer'}</span>
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <select
              value={currentCurrency}
              onChange={(e) => setCurrentCurrency(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs font-semibold text-cyan-400 outline-none focus:border-cyan-500 cursor-pointer shadow-md"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:border-indigo-400 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" /> Export Data
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-600/20 border border-rose-500/40 text-rose-300 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Exit
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Smart Budget Alert Banner */}
        <AnimatePresence>
          {(isBudgetExceeded || isBudgetNearLimit) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 shadow-xl ${
                isBudgetExceeded
                  ? 'bg-gradient-to-r from-rose-950/40 to-red-900/30 border-rose-500/40 text-rose-200'
                  : 'bg-gradient-to-r from-amber-950/40 to-yellow-900/30 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isBudgetExceeded ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {isBudgetExceeded
                    ? `Critical Alert: Budget exceeded by ${currencySymbol}${convertAmount(
                        totalSpent - monthlyBudget,
                        currentCurrency
                      )}!`
                    : `Attention: ${budgetProgress}% of monthly budget utilized (${currencySymbol}${convertAmount(
                        totalSpent,
                        currentCurrency
                      )} of ${currencySymbol}${convertAmount(monthlyBudget, currentCurrency)}).`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative rounded-3xl p-[1px] bg-gradient-to-b from-fuchsia-500/40 via-purple-500/20 to-transparent shadow-xl"
          >
            <div className="h-full w-full rounded-3xl bg-slate-950/70 p-6 backdrop-blur-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
                  <Target className="h-4 w-4" /> Monthly Budget ({currentCurrency})
                </div>
                <button
                  onClick={() => {
                    setBudgetInput(monthlyBudget);
                    setIsEditingBudget(!isEditingBudget);
                  }}
                  className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 font-medium underline underline-offset-4 cursor-pointer"
                >
                  {isEditingBudget ? 'Cancel' : 'Configure'}
                </button>
              </div>

              {isEditingBudget ? (
                <form onSubmit={handleSaveBudget} className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full bg-slate-900 border border-fuchsia-500/40 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-fuchsia-500/40"
                    placeholder="25000"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-110 cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {currencySymbol}{convertAmount(monthlyBudget, currentCurrency)}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                      <span>{budgetProgress}% consumed</span>
                      <span>
                        {currencySymbol}{convertAmount(totalSpent, currentCurrency)} / {currencySymbol}{convertAmount(monthlyBudget, currentCurrency)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isBudgetExceeded
                            ? 'bg-gradient-to-r from-rose-500 to-red-600'
                            : isBudgetNearLimit
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative rounded-3xl p-[1px] bg-gradient-to-b from-cyan-500/40 via-blue-500/20 to-transparent shadow-xl"
          >
            <div className="h-full w-full rounded-3xl bg-slate-950/70 p-6 backdrop-blur-xl flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 text-cyan-300 shadow-inner">
                <span className="text-xl font-bold">{currencySymbol}</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" /> Total Expenditures
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
                  {currencySymbol}{convertAmount(totalSpent, currentCurrency)}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/40 via-teal-500/20 to-transparent shadow-xl"
          >
            <div className="h-full w-full rounded-3xl bg-slate-950/70 p-6 backdrop-blur-xl flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-600/30 border border-emerald-400/30 text-emerald-300 shadow-inner">
                <Receipt className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Logged Activities
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
                  {expenses.length} Entries
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-2xl shadow-2xl flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-fuchsia-400" />
                Category Distribution ({currentCurrency})
              </h3>
            </div>

            {categoryChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No categorical records found
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHROMATIC_PALETTE[index % CHROMATIC_PALETTE.length]}
                          stroke="rgba(15, 23, 42, 0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `${currencySymbol}${val}`}
                      contentStyle={{
                        backgroundColor: '#030712',
                        borderColor: '#374151',
                        borderRadius: '12px',
                        color: '#f9fafb',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-2xl shadow-2xl flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                Daily Trajectory ({currentCurrency})
              </h3>
            </div>

            {timelineChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No timeline records found
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val) => `${currencySymbol}${val}`}
                      contentStyle={{
                        backgroundColor: '#030712',
                        borderColor: '#374151',
                        borderRadius: '12px',
                        color: '#f9fafb',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="amount" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Ingest & Review Section */}
        <div className="grid grid-cols-1 gap-6">
          <SmartExpenseInput onParsed={(data) => setParsedPreviewData(data)} />
          {parsedPreviewData && (
            <TransactionReview data={parsedPreviewData} onSave={handleSaveParsedTransaction} />
          )}
        </div>

        {/* Input Form & Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-7 backdrop-blur-2xl shadow-2xl h-fit"
          >
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-fuchsia-400" />
              Quick Log Expense
            </h2>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category *</label>
                <div className="relative flex items-center">
                  <Tag className="absolute left-3.5 h-4 w-4 text-fuchsia-400/80 pointer-events-none" />
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-fuchsia-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount (INR Base) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-cyan-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Date *</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3.5 h-4 w-4 text-indigo-400/80 pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-3.5 h-4 w-4 text-purple-400/80 pointer-events-none" />
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., Grocery, Tech Gadgets"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-purple-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{submitting ? 'Recording...' : 'Add Transaction'}</span>
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-950/60 p-7 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-base font-bold text-white">Expense Ledger</h2>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex items-center flex-1 sm:w-48">
                  <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="relative flex items-center">
                  <Filter className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedFilterCategory}
                    onChange={(e) => setSelectedFilterCategory(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-900/90 py-2 pl-8 pr-3 text-xs text-slate-300 outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">Loading your transactions...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-500 border border-dashed border-white/10 rounded-2xl">
                {expenses.length === 0
                  ? 'No records yet. Log your first expense on the left!'
                  : 'No matches found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3.5 px-3">Date</th>
                      <th className="pb-3.5 px-3">Category</th>
                      <th className="pb-3.5 px-3">Description</th>
                      <th className="pb-3.5 px-3">Amount ({currentCurrency})</th>
                      <th className="pb-3.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredExpenses.map((exp, idx) => (
                        <motion.tr
                          key={exp.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="hover:bg-white/[0.03] transition duration-150"
                        >
                          <td className="py-3 px-3 text-slate-300 text-xs">
                            {new Date(exp.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm"
                              style={{
                                backgroundColor: `${CHROMATIC_PALETTE[idx % CHROMATIC_PALETTE.length]}18`,
                                color: CHROMATIC_PALETTE[idx % CHROMATIC_PALETTE.length],
                                borderColor: `${CHROMATIC_PALETTE[idx % CHROMATIC_PALETTE.length]}40`,
                              }}
                            >
                              {exp.category_name || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 text-xs font-medium">
                            {exp.description || '—'}
                          </td>
                          <td className="py-3 px-3 font-bold text-white text-sm">
                            {currencySymbol}{convertAmount(exp.amount, currentCurrency)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <FinancialCopilot userId={user?.id || '1'} />
    </div>
  );
}