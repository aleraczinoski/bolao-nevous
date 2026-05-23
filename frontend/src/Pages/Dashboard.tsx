import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Team {
  name: string;
  crestUrl: string;
}

interface Match {
  id: string;
  kickoffAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: Team;
  awayTeam: Team;
}

export function Dashboard() {
  const [jogos, setJogos] = useState<Match[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarJogos() {
      try {
        const resposta = await api.get("/matches");
        setJogos(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar jogos:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarJogos();
  }, []);

  const jogosAgrupados = jogos.reduce(
    (grupos, jogo) => {
      const dataFormatada = new Date(jogo.kickoffAt).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      );

      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = [];
      }

      grupos[dataFormatada].push(jogo);

      return grupos;
    },
    {} as Record<string, typeof jogos>,
  );

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* CABEÇALHO COM OS BOTÕES DE NAVEGAÇÃO */}
        <div className='flex justify-between items-center mb-10'>
          {/* Botão Esquerdo: Ranking */}
          <button
            onClick={() => navigate("/ranking")}
            className='bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2'
          >
            🏆 <span className='hidden sm:inline'>Ranking</span>
          </button>

          {/* Título Central */}
          <h1 className='text-2xl md:text-3xl font-black text-blue-600 tracking-tighter text-center'>
            BOLÃO<span className='text-gray-800'> NEVOUS</span> ❄️
          </h1>

          {/* Botão Direito: Perfil */}
          <button
            onClick={() => navigate("/profile")}
            className='bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2'
          >
            <span className='hidden sm:inline'>Perfil</span> 👤
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL (SKELETON OU CARDS) */}
        {carregando ? (
          /* === TELA DE SKELETON (CARREGANDO) === */
          <div className='flex flex-col gap-10 animate-pulse'>
            {/* Simulando 2 dias de jogos */}
            {[1, 2].map((diaVazio) => (
              <div key={diaVazio} className='flex flex-col gap-4'>
                {/* Skeleton do Título do Dia */}
                <div className='h-6 bg-gray-300 rounded w-48 mx-auto mb-2'></div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {/* Simulando 3 cards por dia */}
                  {[1, 2, 3].map((cardVazio) => (
                    <div
                      key={cardVazio}
                      className='border rounded-xl p-5 shadow-sm bg-white flex flex-col items-center'
                    >
                      <div className='h-4 bg-gray-200 rounded w-16 mb-6'></div>

                      <div className='flex w-full items-center justify-between mb-6 px-4'>
                        <div className='flex flex-col items-center w-1/3'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full mb-2'></div>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                        </div>
                        <div className='flex items-center gap-3 w-1/3 justify-center'>
                          <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                          <span className='text-gray-200 font-bold'>X</span>
                          <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                        </div>
                        <div className='flex flex-col items-center w-1/3'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full mb-2'></div>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                        </div>
                      </div>

                      <div className='w-full h-12 bg-gray-200 rounded-lg'></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* === TELA REAL COM OS DADOS === */
          <div className='flex flex-col gap-10'>
            {Object.keys(jogosAgrupados).map((data) => (
              <div key={data} className='flex flex-col gap-4'>
                <h2 className='text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 text-center'>
                  Jogos do dia {data}
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {jogosAgrupados[data].map((jogo) => (
                    <div
                      key={jogo.id}
                      className='border rounded-xl p-5 shadow-lg bg-white flex flex-col items-center'
                    >
                      <p className='text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider'>
                        {jogo.status === "FINISHED"
                          ? "Encerrado"
                          : new Date(jogo.kickoffAt).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                      </p>

                      <div className='flex w-full items-center justify-between mb-6 px-4'>
                        <div className='flex flex-col items-center w-1/3 text-center'>
                          <img
                            src={jogo.homeTeam.crestUrl}
                            alt={jogo.homeTeam.name}
                            className='w-12 h-12 mb-2 object-contain'
                          />
                          <span className='font-semibold text-sm'>
                            {jogo.homeTeam.name}
                          </span>
                        </div>

                        <div className='flex items-center gap-3 w-1/3 justify-center'>
                          <input
                            type='number'
                            className='w-12 h-12 border-2 rounded text-center text-lg font-bold bg-gray-50 focus:border-blue-500 outline-none'
                            defaultValue={jogo.homeScore ?? ""}
                            disabled={jogo.status === "FINISHED"}
                          />
                          <span className='text-gray-400 font-bold'>X</span>
                          <input
                            type='number'
                            className='w-12 h-12 border-2 rounded text-center text-lg font-bold bg-gray-50 focus:border-blue-500 outline-none'
                            defaultValue={jogo.awayScore ?? ""}
                            disabled={jogo.status === "FINISHED"}
                          />
                        </div>

                        <div className='flex flex-col items-center w-1/3 text-center'>
                          <img
                            src={jogo.awayTeam.crestUrl}
                            alt={jogo.awayTeam.name}
                            className='w-12 h-12 mb-2 object-contain'
                          />
                          <span className='font-semibold text-sm'>
                            {jogo.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={jogo.status === "FINISHED"}
                        className='w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                      >
                        {jogo.status === "FINISHED"
                          ? "Palpites Encerrados"
                          : "Salvar Palpite"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
