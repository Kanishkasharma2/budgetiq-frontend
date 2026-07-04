import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("budgetiq_token");
    const savedUser = localStorage.getItem("budgetiq_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("budgetiq_token", data.token);
    localStorage.setItem("budgetiq_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, monthlyIncome) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      monthlyIncome,
    });
    localStorage.setItem("budgetiq_token", data.token);
    localStorage.setItem("budgetiq_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("budgetiq_token");
    localStorage.removeItem("budgetiq_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
