import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./Pages/Login";
import { Dashboard } from "./Pages/Dashboard";
import { NotFound } from "./Pages/NotFound";
import { Ranking } from "./Pages/Ranking";
import { Profile } from "./Pages/Profile";
import { Register } from "./Pages/Register";
import { AdminPalpites } from "./Pages/AdminPalpites";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-gray-500 font-semibold'>Carregando...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' index element={<GuestRoute><Login /></GuestRoute>} />
          <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />
          <Route path='/register' element={<Register />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/ranking' element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/palpites' element={<ProtectedRoute><AdminPalpites /></ProtectedRoute>} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
