import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("@Bolao:token");

      if (!token) {
        navigate("/"); // Sem token? Volta pro login
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token inválido ou expirado");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("@Bolao:token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("@Bolao:token");
    navigate("/");
  }

  // Histórico mockado (futuramente virá da API)
  const historico = [
    {
      id: 1,
      jogo: "Brasil x Argentina",
      meuPalpite: "2 x 1",
      resultadoReal: "2 x 1",
      pontosGanhos: 5,
    },
    {
      id: 2,
      jogo: "França x Alemanha",
      meuPalpite: "1 x 0",
      resultadoReal: "2 x 0",
      pontosGanhos: 3,
    },
  ];

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Carregando dados do jogador...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-black text-gray-800 tracking-tight'>
            Meu Perfil
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className='text-blue-600 font-bold hover:underline'
          >
            Voltar aos Jogos
          </button>
        </div>

        <div className='bg-blue-600 text-white rounded-2xl p-6 shadow-xl mb-8 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>
              {user.displayName || "Jogador"}
            </h2>
            <p className='text-blue-200'>{user.email}</p>
          </div>
          <div className='text-right flex gap-6'>
            <div>
              <p className='text-4xl font-black'>145</p>
              <p className='text-xs uppercase font-bold text-blue-200 tracking-wider'>
                Pontos
              </p>
            </div>
          </div>
        </div>

        <h3 className='text-xl font-bold text-gray-800 mb-4'>
          Meus Últimos Palpites
        </h3>
        <div className='flex flex-col gap-4'>
          {historico.map((item) => (
            <div
              key={item.id}
              className='bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm'
            >
              <div>
                <p className='font-bold text-gray-800 mb-1'>{item.jogo}</p>
                <div className='flex gap-4 text-sm font-medium'>
                  <span className='text-gray-500'>
                    Meu palpite:{" "}
                    <strong className='text-gray-800'>{item.meuPalpite}</strong>
                  </span>
                  <span className='text-gray-500'>
                    Oficial:{" "}
                    <strong className='text-gray-800'>
                      {item.resultadoReal}
                    </strong>
                  </span>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-bold text-center ${item.pontosGanhos === 5 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                +{item.pontosGanhos} pts
              </div>
            </div>
          ))}
        </div>

        <div className='mt-12 text-center border-t border-gray-200 pt-8'>
          <button
            onClick={handleLogout}
            className='text-red-500 font-bold hover:text-red-700'
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}
