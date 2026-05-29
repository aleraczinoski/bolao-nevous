import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se o e-mail já existir, o NestJS deve retornar uma mensagem de erro aqui
        throw new Error(
          data.message || "Erro ao criar conta. Tente novamente.",
        );
      }

      // Sucesso! Salva o token recém-gerado no navegador
      localStorage.setItem("@Bolao:token", data.accessToken);

      // Redireciona o novo jogador direto para o perfil
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
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
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Criar Conta</h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold'>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className='flex flex-col gap-4 mb-6'>
          <input
            type='text'
            placeholder='Usuário'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <input
            type='email'
            placeholder='Seu melhor e-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <input
            type='password'
            placeholder='Crie uma senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-2'
          >
            {isLoading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <p className='text-sm text-gray-500 mb-6'>
          Já tem uma conta?{" "}
          <Link to='/' className='text-blue-600 font-bold hover:underline'>
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
