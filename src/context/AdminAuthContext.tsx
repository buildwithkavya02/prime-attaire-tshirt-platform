import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminLogin, adminLogout, getAdminSession } from "../lib/api";

interface AdminAuthContextValue {
  loggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSession().then(({ loggedIn }) => {
      setLoggedIn(loggedIn);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { ok } = await adminLogin(email, password);
    if (ok) setLoggedIn(true);
    return ok;
  };

  const logout = async () => {
    await adminLogout();
    setLoggedIn(false);
  };

  return (
    <AdminAuthContext.Provider value={{ loggedIn, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
