import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível enviar o código.");
      }

      setMessage(
        data.message ||
          "Se o e-mail estiver cadastrado, você receberá um código em breve.",
      );
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
          Esqueceu a senha?
        </h2>
        <p className='text-sm text-gray-500 mb-6'>
          Informe seu e-mail para receber o código de redefinição.
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
          onSubmit={handleForgotPassword}
          className='flex flex-col gap-4 mb-6'
        >
          <input
            type='email'
            placeholder='Seu e-mail cadastrado'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800'
          />

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-2'
          >
            {isLoading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <div className='flex flex-col gap-2 text-sm text-gray-500'>
          <Link
            to='/reset-password'
            className='text-blue-600 font-bold hover:underline'
          >
            Já tenho o código. Redefinir senha
          </Link>
          <Link to='/login' className='text-blue-600 font-bold hover:underline'>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
