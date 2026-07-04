import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Food", "Rent", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Salary", "Other"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "expense", amount: "", category: "Food", description: "", isRecurring: false });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterType) params.type = filterType;
      const { data } = await api.get("/transactions", { params });
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterCategory, filterType]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transactions", {
        ...form,
        amount: Number(form.amount),
        recurringFrequency: form.isRecurring ? "monthly" : null,
      });
      setForm({ type: "expense", amount: "", category: "Food", description: "", isRecurring: false });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.type,
      t.category,
      (t.description || "").replace(/,/g, ";"), // avoid breaking CSV columns
      t.amount,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budgetiq-transactions-${new Date().toISOString().slice(0, 7)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-1">Ledger Entries</p>
            <h1 className="font-display text-3xl text-ink dark:text-dark-text">Transactions</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={!transactions.length}
              className="border border-ink dark:border-dark-line text-ink dark:text-dark-text font-body text-sm font-medium px-4 py-2.5 rounded-sm hover:bg-paper transition-colors disabled:opacity-40"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-ink text-paper-soft font-body text-sm font-medium px-4 py-2.5 rounded-sm hover:bg-ink-light transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Transaction"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-paper-line rounded-sm px-3 py-2 font-body text-sm bg-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="number"
              required
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="border border-paper-line rounded-sm px-3 py-2 font-body text-sm bg-transparent"
            />
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
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-paper-line rounded-sm px-3 py-2 font-body text-sm bg-transparent sm:col-span-1"
            />
            <button type="submit" className="bg-gold text-ink font-body text-sm font-medium rounded-sm hover:opacity-90 transition-opacity">
              Save
            </button>
            <label className="sm:col-span-5 flex items-center gap-2 font-body text-sm text-ink-light dark:text-dark-text/60">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              />
              Repeats monthly (e.g. rent, subscriptions) — auto-logged each month
            </label>
          </form>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-paper-line rounded-sm px-3 py-1.5 font-body text-sm bg-paper-soft"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-paper-line rounded-sm px-3 py-1.5 font-body text-sm bg-paper-soft"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm overflow-hidden">
          {loading ? (
            <p className="p-6 font-body text-ink-light dark:text-dark-text/60 text-sm">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="p-10 text-center font-body text-ink-light dark:text-dark-text/60 text-sm">No transactions match this filter yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-line font-mono text-xs uppercase text-ink-light dark:text-dark-text/60">
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Category</th>
                  <th className="text-left px-5 py-3">Description</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-paper-line last:border-0 hover:bg-paper transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-ink-light dark:text-dark-text/60">
                      {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-5 py-3 font-body text-ink dark:text-dark-text">{t.category}</td>
                    <td className="px-5 py-3 font-body text-ink-light dark:text-dark-text/60">{t.description || "—"}</td>
                    <td className={`px-5 py-3 text-right font-mono ${t.type === "income" ? "text-income" : "text-expense"}`}>
                      {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="font-mono text-xs text-expense hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
