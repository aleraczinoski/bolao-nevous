import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      signIn(data.accessToken, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg ?? "E-mail ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6'>
      <div className='mb-10 text-center'>
        <h1 className='text-5xl md:text-6xl font-black text-blue-600 tracking-tighter mb-4'>
          BOLÃO <span className='text-gray-800'>NEVOUS</span> ❄️
        </h1>
      </div>

      <div className='w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 text-center'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>
          Entrar no Jogo
        </h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold'>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className='flex flex-col gap-4 mb-6'>
          <input
            type='email'
            placeholder='Seu e-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <input
            type='password'
            placeholder='Sua senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-2'
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className='text-sm text-gray-500'>
          Não tem uma conta?{" "}
          <Link
            to='/register'
            className='text-blue-600 font-bold hover:underline'
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
