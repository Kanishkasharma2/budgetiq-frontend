import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-2">
            Ledger Access
          </p>
          <h1 className="font-display text-4xl text-ink">BudgetIQ</h1>
        </div>

        <div className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-ink-light mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-line focus:border-gold outline-none py-2 text-ink font-body transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-ink-light mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-line focus:border-gold outline-none py-2 text-ink font-body transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-expense text-sm font-body bg-expense-soft px-3 py-2 rounded-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper-soft font-body font-medium py-3 rounded-sm hover:bg-ink-light transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-sm text-ink-light mt-6">
          New here?{" "}
          <Link to="/register" className="text-gold font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
