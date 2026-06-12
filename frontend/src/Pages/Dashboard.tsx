import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Match, Prediction } from "../types/api";
import { NavBar } from "../components/NavBar";

interface PredictionInput { home: string; away: string; }
type SaveState = "idle" | "saving" | "saved" | "error";

const CACHE_MATCHES = "bolao:matches";
const CACHE_PREDS = "bolao:predictions";

function buildPredMaps(preds: Prediction[]) {
  const mapa: Record<string, Prediction> = {};
  const inputsMapa: Record<string, PredictionInput> = {};
  preds.forEach((p) => {
    mapa[p.matchId] = p;
    inputsMapa[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore) };
  });
  return { mapa, inputsMapa };
}

function CardPontuacao() {
  const [aberto, setAberto] = useState(false);
  const bonuses = [
    { dot: "bg-green-500", label: "Placar Exato", pts: "+5", color: "text-green-400" },
    { dot: "bg-blue-500", label: "Placar Vencedor", pts: "+3", color: "text-blue-400" },
    { dot: "bg-cyan-500", label: "Diferença de Gols", pts: "+2", color: "text-cyan-400" },
    { dot: "bg-purple-500", label: "Placar Perdedor", pts: "+1", color: "text-purple-400" },
    { dot: "bg-amber-500", label: "Goleada (diff ≥ 3)", pts: "+1", color: "text-amber-400" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl mb-6 overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-slate-300 font-semibold text-sm">Como funciona a pontuação?</span>
        <span className="text-slate-500 text-sm">{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
        <div className="px-5 pb-5 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Base</p>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-slate-300">Acertou o resultado</span>
                <span className="text-sm font-bold text-slate-400">1 pt</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bônus exclusivo + extra</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {bonuses.map((b) => (
                  <div key={b.label} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${b.dot}`} />
                      <span className="text-sm text-slate-300">{b.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${b.color}`}>{b.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const [jogos, setJogos] = useState<Match[]>([]);
  const [palpites, setPalpites] = useState<Record<string, Prediction>>({});
  const [inputs, setInputs] = useState<Record<string, PredictionInput>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedMatches = sessionStorage.getItem(CACHE_MATCHES);
    const cachedPreds = sessionStorage.getItem(CACHE_PREDS);
    if (cachedMatches && cachedPreds) {
      const matches: Match[] = JSON.parse(cachedMatches);
      const preds: Prediction[] = JSON.parse(cachedPreds);
      setJogos(matches.filter((m) => m.status === "SCHEDULED"));
      const { mapa, inputsMapa } = buildPredMaps(preds);
      setPalpites(mapa);
      setInputs(inputsMapa);
      setCarregando(false);
    }

    async function carregar() {
      try {
        const [matchesRes, predsRes] = await Promise.all([
          api.get<Match[]>("/matches"),
          api.get<Prediction[]>("/predictions/me"),
        ]);
        sessionStorage.setItem(CACHE_MATCHES, JSON.stringify(matchesRes.data));
        sessionStorage.setItem(CACHE_PREDS, JSON.stringify(predsRes.data));
        setJogos(matchesRes.data.filter((m) => m.status === "SCHEDULED"));
        const { mapa, inputsMapa } = buildPredMaps(predsRes.data);
        setPalpites(mapa);
        setInputs(inputsMapa);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function handleInput(matchId: string, side: "home" | "away", value: string) {
    setInputs((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: value } }));
  }

  async function salvarPalpite(matchId: string) {
    const input = inputs[matchId];
    if (!input || input.home === "" || input.away === "") return;
    const homeScore = parseInt(input.home, 10);
    const awayScore = parseInt(input.away, 10);
    if (isNaN(homeScore) || isNaN(awayScore)) return;

    setSaveStates((prev) => ({ ...prev, [matchId]: "saving" }));
    try {
      const existing = palpites[matchId];
      const { data } = existing
        ? await api.put<Prediction>(`/predictions/${existing.id}`, { homeScore, awayScore })
        : await api.post<Prediction>("/predictions", { matchId, homeScore, awayScore });
      setPalpites((prev) => ({ ...prev, [matchId]: data }));
      sessionStorage.removeItem(CACHE_PREDS);
      setSaveStates((prev) => ({ ...prev, [matchId]: "saved" }));
      setTimeout(() => setSaveStates((prev) => ({ ...prev, [matchId]: "idle" })), 2000);
    } catch {
      setSaveStates((prev) => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setSaveStates((prev) => ({ ...prev, [matchId]: "idle" })), 3000);
    }
  }

  const jogosAgrupados = jogos.reduce((grupos, jogo) => {
    const data = new Date(jogo.kickoffAt).toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "long",
    });
    if (!grupos[data]) grupos[data] = [];
    grupos[data].push(jogo);
    return grupos;
  }, {} as Record<string, Match[]>);

  function palpiteBloqueado(kickoffAt: string) {
    return Date.now() >= new Date(kickoffAt).getTime();
  }

  function botaoEstado(matchId: string) {
    const s = saveStates[matchId] ?? "idle";
    if (s === "saving") return { label: "Salvando...", cls: "bg-slate-700 cursor-not-allowed" };
    if (s === "saved") return { label: "✓ Salvo!", cls: "bg-emerald-600" };
    if (s === "error") return { label: "Erro ao salvar", cls: "bg-red-600" };
    return {
      label: palpites[matchId] ? "Atualizar Palpite" : "Salvar Palpite",
      cls: "bg-blue-600 hover:bg-blue-500",
    };
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur">
        <h1 className="text-xl font-black tracking-tighter">
          <span className="text-blue-400">BOLÃO</span><span className="text-white"> NEVOUS</span> ❄️
        </h1>
        <nav className="flex items-center gap-2">
          {[
            { path: "/ranking", label: "🏆 Ranking" },
            { path: "/palpites", label: "📋 Palpites" },
            { path: "/profile", label: "👤 Perfil" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-center px-5 pt-5 pb-2">
        <h1 className="text-2xl font-black tracking-tighter">
          <span className="text-blue-400">BOLÃO</span><span className="text-white"> NEVOUS</span> ❄️
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 md:pt-8">
        <CardPontuacao />

        {carregando ? (
          <div className="flex flex-col gap-8">
            {[1, 2].map((g) => (
              <div key={g} className="flex flex-col gap-3">
                <div className="h-5 bg-slate-800 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((c) => (
                    <div key={c} className="h-44 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(jogosAgrupados).length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-slate-400 font-semibold">Nenhum jogo agendado no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(jogosAgrupados).map(([data, jogosDia]) => (
              <div key={data}>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 capitalize">
                  {data}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jogosDia.map((jogo) => {
                    const input = inputs[jogo.id] ?? { home: "", away: "" };
                    const salvando = saveStates[jogo.id] === "saving";
                    const bloqueado = palpiteBloqueado(jogo.kickoffAt);
                    const { label, cls } = botaoEstado(jogo.id);
                    const temPalpite = !!palpites[jogo.id];

                    return (
                      <div
                        key={jogo.id}
                        className={`bg-slate-900 border rounded-2xl p-4 flex flex-col gap-4 transition-colors ${
                          bloqueado ? "border-slate-800 opacity-70" : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(jogo.kickoffAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {temPalpite && !bloqueado && (
                            <span className="text-xs text-blue-400 font-semibold">Palpite salvo ✓</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0">
                            <img src={jogo.homeTeam.crestUrl} alt={jogo.homeTeam.name} className="w-11 h-11 object-contain" />
                            <span className="text-white text-xs font-semibold text-center line-clamp-2 leading-tight w-full">{jogo.homeTeam.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number" min={0}
                              disabled={bloqueado}
                              value={input.home}
                              onChange={(e) => handleInput(jogo.id, "home", e.target.value)}
                              className="w-12 h-13 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 text-white text-xl font-black text-center rounded-xl outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            />
                            <span className="text-slate-600 font-black text-lg">×</span>
                            <input
                              type="number" min={0}
                              disabled={bloqueado}
                              value={input.away}
                              onChange={(e) => handleInput(jogo.id, "away", e.target.value)}
                              className="w-12 h-13 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 text-white text-xl font-black text-center rounded-xl outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            />
                          </div>

                          <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0">
                            <img src={jogo.awayTeam.crestUrl} alt={jogo.awayTeam.name} className="w-11 h-11 object-contain" />
                            <span className="text-white text-xs font-semibold text-center line-clamp-2 leading-tight w-full">{jogo.awayTeam.name}</span>
                          </div>
                        </div>

                        {bloqueado ? (
                          <div className="bg-slate-800/80 text-slate-500 text-xs font-bold text-center py-2.5 rounded-xl border border-slate-700">
                            🔒 Palpites encerrados
                          </div>
                        ) : (
                          <button
                            disabled={salvando}
                            onClick={() => salvarPalpite(jogo.id)}
                            className={`w-full text-white text-sm font-bold py-2.5 rounded-xl transition-colors ${cls}`}
                          >
                            {label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}
