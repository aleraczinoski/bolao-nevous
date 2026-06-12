import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { RankingEntry } from "../types/api";
import { NavBar } from "../components/NavBar";


export function Ranking() {
  const navigate = useNavigate();
  const [jogadores, setJogadores] = useState<RankingEntry[]>([]);
  const [carregando, setCarregando] = useState(true);

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
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4 max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            🏆 <span className="text-blue-400">Ranking</span> Geral
          </h1>
          <p className="text-slate-500 text-sm mt-1">Classificação por pontos acumulados</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="hidden md:block text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors">
          ← Voltar
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {carregando ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full" />
                  <div className="h-4 bg-slate-800 rounded w-32" />
                </div>
                <div className="h-6 bg-slate-800 rounded w-16" />
              </div>
            ))}
          </div>
        ) : jogadores.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-slate-400 font-semibold">Nenhum palpite pontuado ainda.</p>
            <p className="text-slate-600 text-sm mt-1">Aguarde os resultados dos jogos.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {jogadores.map((jogador, index) => {
              const pos = index + 1;
              const icon = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null;
              const numStyle =
                pos === 1 ? "text-yellow-400 bg-yellow-400/10" :
                pos === 2 ? "text-slate-300 bg-slate-700" :
                pos === 3 ? "text-orange-400 bg-orange-400/10" :
                "text-slate-500 bg-slate-800";

              return (
                <div
                  key={jogador.userId}
                  className="flex items-center justify-between px-4 py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-black shrink-0 ${numStyle}`}>
                      {icon ?? `${pos}º`}
                    </div>
                    <span className="text-white font-semibold">{jogador.displayName}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-400">{jogador.points}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}
