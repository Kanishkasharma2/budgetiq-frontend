import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", monthlyIncome: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, Number(form.monthlyIncome) || 0);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Kanishka Sharma" },
    { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { name: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
    { name: "monthlyIncome", label: "Monthly Income (optional)", type: "number", placeholder: "50000" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-dark-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-2">
            Open a Ledger
          </p>
          <h1 className="font-display text-4xl text-ink">Create Account</h1>
        </div>

        <div className="bg-paper-soft dark:bg-dark-surface border border-paper-line dark:border-dark-line rounded-sm p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block font-mono text-xs uppercase tracking-wide text-ink-light mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  required={f.name !== "monthlyIncome"}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b-2 border-paper-line focus:border-gold outline-none py-2 text-ink font-body transition-colors"
                  placeholder={f.placeholder}
                />
              </div>
            ))}

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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-sm text-ink-light mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
