import { useNavigate } from "react-router";

export function Login() {
  const navigate = useNavigate(); // Navegação provisória -> Tirar depois da autenticação estar funcionando
  function handleGoogleLogin() {
    // Redireciona direto para a rota do seu NestJS que vai falar com o Google
    window.location.href = "http://localhost:3000/api/auth/google";
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6'>
      {/* Logo e Chamada */}
      <div className='mb-10 text-center'>
        <h1 className='text-5xl md:text-6xl font-black text-blue-600 tracking-tighter mb-4'>
          BOLÃO <span className='text-gray-800'>NEVOUS</span> ❄️
        </h1>
      </div>

      {/* Card Minimalista de Login */}
      <div className='w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 text-center'>
        <h2 className='text-2xl font-bold text-gray-800 mb-8'>
          Entrar no Jogo
        </h2>

        {/* Botão Único e Gigante do Google */}
        <button
          onClick={handleGoogleLogin}
          className='w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-200 text-gray-700 h-16 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:scale-[0.98] transition-all'
        >
          <img
            src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
            alt='Logo Google'
            className='w-7 h-7'
          />
          Continuar com o Google
        </button>
        <button
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Entre no dashboard
        </button>
      </div>
    </div>
  );
}
