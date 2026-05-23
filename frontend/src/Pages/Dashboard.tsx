import { useEffect, useState } from "react";
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

  if (carregando)
    return <p className='text-center mt-10'>Carregando o painel...</p>;

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Partidas</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {jogos.map((jogo) => (
          <div
            key={jogo.id}
            className='border rounded-xl p-5 shadow-lg bg-white flex flex-col items-center'
          >
            <p className='text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider'>
              {jogo.status === "FINISHED"
                ? "Encerrado"
                : new Date(jogo.kickoffAt).toLocaleString("pt-BR")}
            </p>

            <div className='flex w-full items-center justify-between mb-6 px-4'>
              {/* Time A */}
              <div className='flex flex-col items-center w-1/3'>
                <img
                  src={jogo.homeTeam.crestUrl}
                  alt={jogo.homeTeam.name}
                  className='w-12 h-12 mb-2 object-contain'
                />
                <span className='font-semibold text-sm text-center'>
                  {jogo.homeTeam.name}
                </span>
              </div>

              {/* Placar ou Inputs */}
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

              {/* Time B */}
              <div className='flex flex-col items-center w-1/3'>
                <img
                  src={jogo.awayTeam.crestUrl}
                  alt={jogo.awayTeam.name}
                  className='w-12 h-12 mb-2 object-contain'
                />
                <span className='font-semibold text-sm text-center'>
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
  );
}
