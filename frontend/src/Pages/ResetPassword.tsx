import { useState } from "react";
import { Link } from "react-router-dom";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível redefinir a senha.");
      }

      setMessage(data.message || "Senha redefinida com sucesso.");
      setEmail("");
      setCode("");
      setNewPassword("");
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
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Redefinir senha
        </h2>
        <p className='text-sm text-gray-500 mb-6'>
          Use o código enviado por e-mail e escolha uma nova senha.
        </p>

        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold'>
            {error}
          </div>
        )}

        {message && (
          <div className='mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold'>
            {message}
          </div>
        )}

        <form
          onSubmit={handleResetPassword}
          className='flex flex-col gap-4 mb-6'
        >
          <input
            type='email'
            placeholder='E-mail cadastrado'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <input
            type='text'
            placeholder='Código recebido no e-mail'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />
          <input
            type='password'
            placeholder='Nova senha'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-2'
          >
            {isLoading ? "Atualizando..." : "Salvar nova senha"}
          </button>
        </form>

        <Link
          to='/login'
          className='text-sm text-blue-600 font-bold hover:underline'
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
