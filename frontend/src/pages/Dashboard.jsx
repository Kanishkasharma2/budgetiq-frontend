import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CATEGORY_COLORS = ["#1B2A4A", "#2E6F4E", "#C9A13B", "#B8483C", "#7A6FA8", "#4C8FA8"];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-07"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, budgetsRes, trendRes] = await Promise.all([
          api.get("/transactions/summary"),
          api.get(`/budgets?month=${currentMonth}`),
          api.get("/transactions/monthly-trend"),
        ]);
        setSummary(summaryRes.data);
        setBudgets(budgetsRes.data);
        setTrend(trendRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Simple rule-based "smart insight": project this month's spend from the
  // average daily spend so far, and compare it against the trailing average.
  const buildInsight = () => {
    if (!trend.length) return null;
    const today = new Date();
    const daysSoFar = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const thisMonthKey = currentMonth;
    const thisMonthEntry = trend.find((t) => t._id === thisMonthKey);
    const spentSoFar = thisMonthEntry?.total || 0;

    if (spentSoFar === 0) return "Log a few expenses and I'll start projecting your monthly spend.";

    const projected = Math.round((spentSoFar / daysSoFar) * daysInMonth);
    const priorMonths = trend.filter((t) => t._id !== thisMonthKey);
    if (!priorMonths.length) {
      return `At this pace, you're on track to spend about ₹${projected.toLocaleString("en-IN")} this month.`;
    }
    const avgPrior = Math.round(priorMonths.reduce((s, t) => s + t.total, 0) / priorMonths.length);
    const diffPct = avgPrior ? Math.round(((projected - avgPrior) / avgPrior) * 100) : 0;

    if (diffPct > 5) {
      return `At this pace, you'll spend about ₹${projected.toLocaleString("en-IN")} this month — ${diffPct}% more than your recent average.`;
    } else if (diffPct < -5) {
      return `Nice — you're projected to spend about ₹${projected.toLocaleString("en-IN")}, ${Math.abs(diffPct)}% below your recent average.`;
    }
    return `You're on track to spend about ₹${projected.toLocaleString("en-IN")} this month, in line with your usual pace.`;
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-1">
            {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <h1 className="font-display text-3xl text-ink dark:text-dark-text">Dashboard</h1>
        </div>

        {loading ? (
          <p className="font-body text-ink-light dark:text-dark-text/60">Loading your ledger...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <SummaryCard label="Balance" value={formatMoney(summary?.balance)} tone="ink" />
              <SummaryCard label="Income" value={formatMoney(summary?.totalIncome)} tone="income" />
              <SummaryCard label="Expenses" value={formatMoney(summary?.totalExpense)} tone="expense" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Category breakdown pie chart */}
              <div className="lg:col-span-2 bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-6">
                <h2 className="font-display text-lg text-ink dark:text-dark-text mb-4">Spending by Category</h2>
                {summary?.categoryBreakdown?.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.categoryBreakdown}
                        dataKey="total"
                        nameKey="_id"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {summary.categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatMoney(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No expenses logged yet" />
                )}
                <div className="mt-3 space-y-1.5">
                  {summary?.categoryBreakdown?.map((c, i) => (
                    <div key={c._id} className="flex items-center justify-between font-mono text-xs">
                      <span className="flex items-center gap-2 text-ink-light dark:text-dark-text/60">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        {c._id}
                      </span>
                      <span className="text-ink dark:text-dark-text">{formatMoney(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget usage */}
              <div className="lg:col-span-3 bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-6">
                <h2 className="font-display text-lg text-ink dark:text-dark-text mb-4">Budget Usage — This Month</h2>
                {budgets.length ? (
                  <div className="space-y-4">
                    {budgets.map((b) => {
                      const pct = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100));
                      const over = b.spent > b.monthlyLimit;
                      const barColor = over ? "bg-expense" : pct > 80 ? "bg-gold" : "bg-income";
                      return (
                        <div key={b._id}>
                          <div className="flex justify-between font-body text-sm mb-1">
                            <span className="text-ink dark:text-dark-text">{b.category}</span>
                            <span className="font-mono text-xs text-ink-light dark:text-dark-text/60">
                              {formatMoney(b.spent)} / {formatMoney(b.monthlyLimit)}
                            </span>
                          </div>
                          <div className="h-2 bg-paper-line rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState text="Set a budget to track your limits" />
                )}
              </div>
            </div>

            {/* Spending trend + smart insight */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              <div className="lg:col-span-3 bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-6">
                <h2 className="font-display text-lg text-ink dark:text-dark-text mb-4">Spending Trend — Last 6 Months</h2>
                {trend.length > 1 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trend}>
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#8A8370" />
                      <YAxis hide />
                      <Tooltip formatter={(val) => formatMoney(val)} />
                      <Line type="monotone" dataKey="total" stroke="#C9A13B" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Add expenses across a few months to see your trend" />
                )}
              </div>

              <div className="lg:col-span-2 bg-ink dark:bg-dark-surface border border-ink dark:border-dark-line rounded-sm p-6 flex flex-col justify-center">
                <p className="font-mono text-xs uppercase tracking-wide text-gold mb-2">💡 Smart Insight</p>
                <p className="font-body text-sm text-paper-soft dark:text-dark-text leading-relaxed">
                  {buildInsight()}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    ink: "text-ink dark:text-dark-text",
    income: "text-income",
    expense: "text-expense",
  };
  return (
    <div className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-5 relative overflow-hidden">
      <div className="stitch-line absolute left-0 top-0 bottom-0" />
      <p className="font-mono text-xs uppercase tracking-wide text-ink-light dark:text-dark-text/60 mb-2 pl-2">{label}</p>
      <p className={`font-display text-2xl pl-2 ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center h-[180px] font-body text-sm text-ink-light dark:text-dark-text/60 border border-dashed border-paper-line rounded-sm">
      {text}
    </div>
  );
}
