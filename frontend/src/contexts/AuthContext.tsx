import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "../types/api";
import { api } from "../services/api";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("@Bolao:token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    api
      .get<User>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("@Bolao:token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function signIn(newToken: string, newUser: User) {
    localStorage.setItem("@Bolao:token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function signOut() {
    localStorage.removeItem("@Bolao:token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
