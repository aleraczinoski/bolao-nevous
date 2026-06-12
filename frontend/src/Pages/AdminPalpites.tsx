import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { AdminPrediction } from "../types/api";
import { NavBar } from "../components/NavBar";

function badgePts(pts: number | null) {
  if (pts === null) return null;
  const map: Record<number, { label: string; cls: string }> = {
    0: { label: "Errou", cls: "bg-slate-800 text-slate-500 border-slate-700" },
    1: { label: "Resultado", cls: "bg-slate-700 text-slate-300 border-slate-600" },
    2: { label: "+Perdedor", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    3: { label: "+Diferença", cls: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    4: { label: "+Vencedor", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    5: { label: "+Vencedor+Gol", cls: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    6: { label: "Placar Exato!", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    7: { label: "Exato+Goleada!", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  };
  const entry = map[pts] ?? { label: `${pts} pts`, cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${entry.cls}`}>{entry.label}</span>
      <span className="text-xs text-slate-600 font-bold">{pts} pts</span>
    </div>
  );
}

export function AdminPalpites() {
  const navigate = useNavigate();
  const [palpites, setPalpites] = useState<AdminPrediction[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroPartida, setFiltroPartida] = useState("");

  useEffect(() => {
    api
      .get<AdminPrediction[]>("/predictions/finished")
      .then((res) => setPalpites(res.data))
      .catch((err) => setErro(err?.response?.data?.message ?? "Erro ao carregar palpites."))
      .finally(() => setCarregando(false));
  }, []);

  const usuarios = [...new Set(palpites.map((p) => p.user.displayName))].sort();
  const partidas = [...new Set(palpites.map((p) => `${p.match.homeTeam.name} x ${p.match.awayTeam.name}`))].sort();

  const filtrados = palpites.filter((p) => {
    const nomePartida = `${p.match.homeTeam.name} x ${p.match.awayTeam.name}`;
    return (
      (!filtroUsuario || p.user.displayName === filtroUsuario) &&
      (!filtroPartida || nomePartida === filtroPartida)
    );
  });

  const selectCls = "flex-1 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4 max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            📋 <span className="text-blue-400">Palpites</span> das Partidas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Palpites das partidas em andamento e finalizadas</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="hidden md:block text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors">
          ← Voltar
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {erro && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold">
            {erro}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} className={selectCls}>
            <option value="">Todos os participantes</option>
            {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>

          <select value={filtroPartida} onChange={(e) => setFiltroPartida(e.target.value)} className={selectCls}>
            <option value="">Todas as partidas</option>
            {partidas.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {(filtroUsuario || filtroPartida) && (
            <button
              onClick={() => { setFiltroUsuario(""); setFiltroPartida(""); }}
              className="text-slate-500 hover:text-slate-300 font-bold text-sm px-3 py-2.5 bg-slate-800 rounded-xl border border-slate-700 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {carregando ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : palpites.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-3">⚽</p>
            <p className="text-slate-400 font-semibold">Nenhum palpite disponível ainda.</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-semibold">Nenhum palpite para o filtro selecionado.</p>
            <p className="text-slate-600 text-sm mt-1">{palpites.length} palpites no total</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {filtrados.map((p) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">{p.user.displayName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <img src={p.match.homeTeam.crestUrl} alt="" className="w-4 h-4 object-contain" />
                        <span className="text-xs text-slate-400">{p.match.homeTeam.name}</span>
                        <span className="text-slate-600 text-xs">x</span>
                        <span className="text-xs text-slate-400">{p.match.awayTeam.name}</span>
                        <img src={p.match.awayTeam.crestUrl} alt="" className="w-4 h-4 object-contain" />
                      </div>
                    </div>
                    {badgePts(p.points)}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Palpite</p>
                      <p className="text-white font-black">{p.homeScore} × {p.awayScore}</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Resultado</p>
                      {p.match.homeScore !== null && p.match.awayScore !== null ? (
                        <p className="text-white font-black">{p.match.homeScore} × {p.match.awayScore}</p>
                      ) : (
                        <p className="text-slate-500 font-bold text-xs">Em andamento</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-right mt-3 pb-2">
              {filtrados.length} palpite{filtrados.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
