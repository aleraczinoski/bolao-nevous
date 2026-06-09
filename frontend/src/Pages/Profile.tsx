import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Prediction } from "../types/api";

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [historico, setHistorico] = useState<Prediction[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("bolao:predictions");
    if (cached) {
      setHistorico(JSON.parse(cached));
      setCarregando(false);
    }

    api
      .get<Prediction[]>("/predictions/me")
      .then((res) => {
        sessionStorage.setItem("bolao:predictions", JSON.stringify(res.data));
        setHistorico(res.data);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  function handleLogout() {
    signOut();
    navigate("/");
  }

  const totalPontos = historico.reduce((acc, p) => acc + (p.points ?? 0), 0);

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
            <h2 className='text-2xl font-bold'>{user.displayName}</h2>
            <p className='text-blue-200'>{user.email}</p>
          </div>
          <div className='text-right'>
            <p className='text-4xl font-black'>{totalPontos}</p>
            <p className='text-xs uppercase font-bold text-blue-200 tracking-wider'>
              Pontos
            </p>
          </div>
        </div>

        <h3 className='text-xl font-bold text-gray-800 mb-4'>
          Meus Palpites
        </h3>

        {carregando ? (
          <div className='flex flex-col gap-4 animate-pulse'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-white border border-gray-200 rounded-xl p-5 h-20' />
            ))}
          </div>
        ) : historico.length === 0 ? (
          <div className='bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 font-semibold'>
            Você ainda não fez nenhum palpite.
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {historico.map((item) => {
              const { match } = item;
              const nomeJogo = `${match.homeTeam.name} x ${match.awayTeam.name}`;
              const meuPalpite = `${item.homeScore} x ${item.awayScore}`;
              const encerrado = match.status === "FINISHED";
              const resultadoReal =
                encerrado && match.homeScore != null
                  ? `${match.homeScore} x ${match.awayScore}`
                  : "—";

              return (
                <div
                  key={item.id}
                  className='bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm'
                >
                  <div>
                    <p className='font-bold text-gray-800 mb-1'>{nomeJogo}</p>
                    <div className='flex gap-4 text-sm font-medium flex-wrap'>
                      <span className='text-gray-500'>
                        Meu palpite:{" "}
                        <strong className='text-gray-800'>{meuPalpite}</strong>
                      </span>
                      {encerrado && (
                        <span className='text-gray-500'>
                          Oficial:{" "}
                          <strong className='text-gray-800'>{resultadoReal}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {encerrado && item.points != null ? (
                    <div
                      className={`px-4 py-2 rounded-lg font-bold text-center min-w-[64px] ${
                        item.points >= 3
                          ? "bg-green-100 text-green-700"
                          : item.points === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      +{item.points} pts
                    </div>
                  ) : (
                    <div className='px-4 py-2 rounded-lg font-bold text-center min-w-[64px] bg-gray-100 text-gray-400'>
                      Pendente
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
