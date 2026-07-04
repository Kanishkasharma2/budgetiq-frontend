import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Food", "Rent", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];

export default function Budgets() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "Food", monthlyLimit: "" });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets?month=${currentMonth}`);
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/budgets", { ...form, monthlyLimit: Number(form.monthlyLimit), month: currentMonth });
      setForm({ category: "Food", monthlyLimit: "" });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-1">Monthly Limits</p>
          <h1 className="font-display text-3xl text-ink dark:text-dark-text">Budgets</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-paper-line rounded-sm px-3 py-2 font-body text-sm bg-transparent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            required
            placeholder="Monthly limit (₹)"
            value={form.monthlyLimit}
            onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
            className="border border-paper-line rounded-sm px-3 py-2 font-body text-sm bg-transparent"
          />
          <button type="submit" className="bg-gold text-ink dark:text-dark-text font-body text-sm font-medium rounded-sm hover:opacity-90 transition-opacity">
            Set Budget
          </button>
        </form>

        {loading ? (
          <p className="font-body text-ink-light dark:text-dark-text/60 text-sm">Loading...</p>
        ) : budgets.length === 0 ? (
          <p className="font-body text-ink-light dark:text-dark-text/60 text-sm">No budgets set for this month yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const pct = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100));
              const over = b.spent > b.monthlyLimit;
              return (
                <div key={b._id} className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-5">
                  <div className="flex justify-between mb-2">
                    <span className="font-display text-lg text-ink dark:text-dark-text">{b.category}</span>
                    {over && <span className="font-mono text-xs text-expense bg-expense-soft px-2 py-0.5 rounded-sm">Over limit</span>}
                  </div>
                  <div className="flex justify-between font-mono text-xs text-ink-light dark:text-dark-text/60 mb-2">
                    <span>{formatMoney(b.spent)} spent</span>
                    <span>{formatMoney(b.monthlyLimit)} limit</span>
                  </div>
                  <div className="h-2 bg-paper-line rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${over ? "bg-expense" : pct > 80 ? "bg-gold" : "bg-income"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
